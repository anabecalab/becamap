import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import ScholarshipEditor from '../components/ScholarshipEditor'
import ExportButton from '../components/ExportButton'
import LinkRepairButton from '../components/LinkRepairButton'
import AddScholarshipModal from '../components/AddScholarshipModal'
import NotificationBell from '../components/NotificationBell'

export default function BecaMapPage() {
    const [scholarships, setScholarships] = useState([])
    const [filteredScholarships, setFilteredScholarships] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [estadoFilter, setEstadoFilter] = useState('all')
    const [levelFilter, setLevelFilter] = useState('all')
    const [selectedScholarship, setSelectedScholarship] = useState(null)
    const [stats, setStats] = useState(null)
    const [showAddModal, setShowAddModal] = useState(false)

    useEffect(() => {
        fetchScholarships()
        fetchStats()
    }, [])

    useEffect(() => {
        let filtered = scholarships

        if (searchTerm) {
            const term = searchTerm.toLowerCase()
            filtered = filtered.filter(s =>
                s.beca_nombre?.toLowerCase().includes(term) ||
                s.universidad?.toLowerCase().includes(term) ||
                s.pais?.toLowerCase().includes(term) ||
                s.id?.toLowerCase().includes(term)
            )
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(s => s.status_validacion === statusFilter)
        }

        if (estadoFilter !== 'all') {
            filtered = filtered.filter(s => s.estado === estadoFilter)
        }

        if (levelFilter !== 'all') {
            filtered = filtered.filter(s => s.nivel === levelFilter)
        }

        setFilteredScholarships(filtered)
    }, [searchTerm, statusFilter, estadoFilter, levelFilter, scholarships])

    const fetchScholarships = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('scholarships_master')
                .select('*')
                .order('pais', { ascending: true })
                .order('nivel', { ascending: true })

            if (error) throw error
            setScholarships(data || [])
            setFilteredScholarships(data || [])
        } catch (error) {
            console.error('Error fetching scholarships:', error)
            alert('Error loading scholarships: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    const fetchStats = async () => {
        try {
            const { data, error } = await supabase
                .from('scholarships_stats')
                .select('*')
                .single()

            if (error) throw error
            setStats(data)
        } catch (error) {
            console.error('Error fetching stats:', error)
        }
    }

    const handleSave = async (updatedScholarship) => {
        try {
            const { data, error } = await supabase
                .from('scholarships_master')
                .update(updatedScholarship)
                .eq('id', updatedScholarship.id)
                .select()

            if (error) throw error

            await fetchScholarships()
            await fetchStats()
            setSelectedScholarship(null)
            alert('✅ Scholarship updated successfully!')
        } catch (error) {
            console.error('Error updating scholarship:', error)
            alert('❌ Error updating scholarship: ' + error.message)
        }
    }

    const getStatusBadge = (status) => {
        const badges = {
            'active': 'bg-green-100 text-green-800',
            'broken_link': 'bg-red-100 text-red-800',
            'pending': 'bg-yellow-100 text-yellow-800'
        }
        const labels = {
            'active': '✓ Active',
            'broken_link': '✗ Broken',
            'pending': '⋯ Pending'
        }
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status] || 'bg-gray-100 text-gray-800'}`}>
                {labels[status] || status}
            </span>
        )
    }

    const levels = [...new Set(scholarships.map(s => s.nivel))].filter(Boolean).sort()

    return (
        <div className="flex-1 overflow-auto">
            {/* Header */}
            <header className="shadow-sm border-b border-gray-200" style={{ backgroundColor: '#312C8E' }}>
                <div className="px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-white">BecaMap</h1>
                            <p className="mt-1 text-sm" style={{ color: '#D5ED86' }}>La base de becas más grande de LATAM</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <NotificationBell />
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="px-4 py-2 rounded-lg font-semibold text-white transition-all hover:scale-105"
                                style={{ backgroundColor: '#D5ED86', color: '#312C8E' }}
                            >
                                + Agregar Oportunidad
                            </button>
                            <LinkRepairButton
                                scholarships={scholarships}
                                onRepairComplete={() => {
                                    fetchScholarships()
                                    fetchStats()
                                }}
                            />
                            <ExportButton scholarships={scholarships} />
                        </div>
                    </div>

                    {/* Stats */}
                    {stats && (
                        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                                <p className="text-2xl font-bold text-white">{stats.total_scholarships}</p>
                                <p className="text-xs" style={{ color: '#D5ED86' }}>Total Scholarships</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                                <p className="text-2xl font-bold text-white">{stats.active_count}</p>
                                <p className="text-xs" style={{ color: '#D5ED86' }}>Active Links</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                                <p className="text-2xl font-bold text-white">{stats.broken_count}</p>
                                <p className="text-xs" style={{ color: '#D5ED86' }}>Broken Links</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                                <p className="text-2xl font-bold text-white">{stats.pending_count}</p>
                                <p className="text-xs" style={{ color: '#D5ED86' }}>Pending Review</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                                <p className="text-2xl font-bold text-white">{stats.total_countries}</p>
                                <p className="text-xs" style={{ color: '#D5ED86' }}>Countries</p>
                            </div>
                        </div>
                    )}
                </div>
            </header>

            {/* Filters */}
            <div className="px-6 py-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                            <input
                                type="text"
                                placeholder="Search by name, university, country, or ID..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">All Status</option>
                                <option value="active">✓ Active</option>
                                <option value="broken_link">✗ Broken Links</option>
                                <option value="pending">⋯ Pending</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                            <select
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={estadoFilter}
                                onChange={(e) => setEstadoFilter(e.target.value)}
                            >
                                <option value="all">All Estados</option>
                                <option value="Activa">🟢 Activa</option>
                                <option value="Cerrada">🔴 Cerrada</option>
                                <option value="Contínua">🟡 Contínua</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                            <select
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={levelFilter}
                                onChange={(e) => setLevelFilter(e.target.value)}
                            >
                                <option value="all">All Levels</option>
                                {levels.map(level => (
                                    <option key={level} value={level}>{level}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="mt-3 text-sm text-gray-600">
                        Showing {filteredScholarships.length} of {scholarships.length} scholarships
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="px-6 pb-12">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            <p className="mt-4 text-gray-600">Loading scholarships...</p>
                        </div>
                    ) : filteredScholarships.length === 0 ? (
                        <div className="p-12 text-center">
                            <p className="text-gray-500">No scholarships found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scholarship</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">University</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modalidad</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredScholarships.map((scholarship) => (
                                        <tr key={scholarship.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedScholarship(scholarship)}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{scholarship.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{scholarship.pais}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{scholarship.beca_nombre}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{scholarship.universidad || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{scholarship.nivel}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {scholarship.modalidad || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {scholarship.estado === 'Activa' && <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Activa</span>}
                                                {scholarship.estado === 'Cerrada' && <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">Cerrada</span>}
                                                {scholarship.estado === 'Contínua' && <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">Contínua</span>}
                                                {!scholarship.estado && '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">{getStatusBadge(scholarship.status_validacion)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setSelectedScholarship(scholarship)
                                                    }}
                                                    className="font-medium hover:opacity-80"
                                                    style={{ color: '#4B50D0' }}
                                                >
                                                    Edit
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Editor Modal */}
            {selectedScholarship && (
                <ScholarshipEditor
                    scholarship={selectedScholarship}
                    onClose={() => setSelectedScholarship(null)}
                    onSave={handleSave}
                />
            )}

            {/* Add Scholarship Modal */}
            <AddScholarshipModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={() => {
                    fetchScholarships()
                    fetchStats()
                }}
            />
        </div>
    )
}
