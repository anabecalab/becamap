import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function IdeasFromMap({ onSelectForContent }) {
    const [scholarships, setScholarships] = useState([])
    const [filteredScholarships, setFilteredScholarships] = useState([])
    const [loading, setLoading] = useState(true)
    const [creatingId, setCreatingId] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [expandedId, setExpandedId] = useState(null)
    const [selectedIds, setSelectedIds] = useState(new Set())
    const [contentLinkedIds, setContentLinkedIds] = useState(new Set())

    useEffect(() => {
        fetchScholarships()
        fetchLinkedScholarships()
    }, [])

    useEffect(() => {
        let filtered = scholarships
        if (searchTerm) {
            const term = searchTerm.toLowerCase()
            filtered = filtered.filter(s =>
                s.beca_nombre?.toLowerCase().includes(term) ||
                s.pais?.toLowerCase().includes(term) ||
                s.universidad?.toLowerCase().includes(term) ||
                s.nivel?.toLowerCase().includes(term) ||
                s.area?.toLowerCase().includes(term)
            )
        }
        setFilteredScholarships(filtered)
    }, [searchTerm, scholarships])

    const fetchScholarships = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('scholarships_master')
                .select('*')
                .eq('status_validacion', 'active')
                .order('beca_nombre', { ascending: true })

            if (error) throw error
            setScholarships(data || [])
            setFilteredScholarships(data || [])
        } catch (error) {
            console.error('Error fetching scholarships:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchLinkedScholarships = async () => {
        try {
            const { data, error } = await supabase
                .from('becacontent_matrix')
                .select('scholarship_ids')
                .not('scholarship_ids', 'is', null)

            if (error) throw error
            const ids = new Set()
            data?.forEach(item => {
                if (Array.isArray(item.scholarship_ids)) {
                    item.scholarship_ids.forEach(id => ids.add(id))
                }
            })
            setContentLinkedIds(ids)
        } catch (error) {
            console.error('Error fetching linked scholarships:', error)
        }
    }

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id)
    }

    if (loading) {
        return (
            <div className="p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#4B50D0' }}></div>
                <p className="mt-4 text-gray-600">Cargando becas activas...</p>
            </div>
        )
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-bold" style={{ color: '#312C8E' }}>🎯 Becas para contenido</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Explora becas activas del BecaMap para crear contenido. Hay {scholarships.length} becas activas disponibles.
                        </p>
                    </div>
                </div>

                <div className="relative">
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar por nombre, país, universidad, nivel, área..."
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    />
                </div>
            </div>

            {/* Scholarships Grid */}
            {filteredScholarships.length === 0 ? (
                <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
                    <span className="text-4xl">🔍</span>
                    <h3 className="text-lg font-semibold text-gray-900 mt-4 mb-2">Sin resultados</h3>
                    <p className="text-sm text-gray-500">No se encontraron becas con ese criterio de búsqueda</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredScholarships.map((scholarship) => {
                        const isLinked = contentLinkedIds.has(scholarship.id)
                        const isExpanded = expandedId === scholarship.id

                        return (
                            <div
                                key={scholarship.id}
                                className={`bg-white rounded-lg border transition-all hover:shadow-md ${isLinked ? 'border-green-300 bg-green-50/30' : 'border-gray-200'}`}
                            >
                                {/* Card Header */}
                                <div className="p-4 cursor-pointer" onClick={() => toggleExpand(scholarship.id)}>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-gray-900 text-sm truncate" title={scholarship.beca_nombre}>
                                                {scholarship.beca_nombre}
                                            </h4>
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full">{scholarship.pais}</span>
                                                <span className="px-2 py-0.5 bg-purple-50 text-purple-700 text-xs rounded-full">{scholarship.nivel}</span>
                                                {scholarship.area && (
                                                    <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-xs rounded-full">{scholarship.area}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 ml-2">
                                            {isLinked && (
                                                <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700">✅ En uso</span>
                                            )}
                                            <span className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
                                        </div>
                                    </div>

                                    {scholarship.universidad && (
                                        <p className="text-xs text-gray-500 mt-1 truncate">🏛️ {scholarship.universidad}</p>
                                    )}
                                </div>

                                {/* Expanded Detail */}
                                {isExpanded && (
                                    <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-3">
                                        {scholarship.beneficios && (
                                            <div>
                                                <p className="text-xs font-semibold text-gray-600 mb-1">💰 Beneficios</p>
                                                <p className="text-xs text-gray-700">{scholarship.beneficios}</p>
                                            </div>
                                        )}
                                        {scholarship.requisitos && (
                                            <div>
                                                <p className="text-xs font-semibold text-gray-600 mb-1">📋 Requisitos</p>
                                                <p className="text-xs text-gray-700">{scholarship.requisitos}</p>
                                            </div>
                                        )}
                                        {scholarship.siguiente_deadline && (
                                            <div>
                                                <p className="text-xs font-semibold text-gray-600 mb-1">⏰ Siguiente deadline</p>
                                                <p className="text-xs text-gray-700">{scholarship.siguiente_deadline}</p>
                                            </div>
                                        )}
                                        {scholarship.url_origen && (
                                            <a href={scholarship.url_origen} target="_blank" rel="noopener noreferrer"
                                                className="inline-flex items-center text-xs font-medium gap-1" style={{ color: '#4B50D0' }}>
                                                🔗 Ver fuente original
                                            </a>
                                        )}

                                        <button
                                            onClick={async (e) => {
                                                e.stopPropagation()
                                                setCreatingId(scholarship.id)
                                                try {
                                                    await onSelectForContent?.(scholarship)
                                                } finally {
                                                    setCreatingId(null)
                                                }
                                            }}
                                            disabled={creatingId === scholarship.id}
                                            className="w-full py-2 rounded-lg font-semibold text-sm transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-wait"
                                            style={{ backgroundColor: '#D5ED86', color: '#312C8E' }}
                                        >
                                            {creatingId === scholarship.id ? '⏳ Creando...' : '🎯 Crear Contenido con esta Beca'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
