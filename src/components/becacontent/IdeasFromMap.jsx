import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import ScholarshipEditor from '../ScholarshipEditor'

export default function IdeasFromMap() {
    const [scholarships, setScholarships] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedScholarship, setSelectedScholarship] = useState(null)

    useEffect(() => {
        fetchScholarships()
    }, [])

    const fetchScholarships = async () => {
        try {
            setLoading(true)

            // Query scholarships that are Activa or Contínua
            // Note: siguiente_deadline and ultima_deadline are text fields, not dates
            // So we can't filter by date range. We'll show active/continuous scholarships.
            const { data, error } = await supabase
                .from('scholarships_master')
                .select('*')
                .or('estado.eq.Activa,estado.eq.Contínua')
                .eq('status_validacion', 'active')
                .order('created_at', { ascending: false })
                .limit(12)

            if (error) throw error

            setScholarships(data || [])
        } catch (error) {
            console.error('Error fetching scholarships for content ideas:', error)
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'No especificada'
        // Return as-is since siguiente_deadline and ultima_deadline are text fields
        return dateString
    }

    const getStatusBadge = (estado) => {
        const badges = {
            'Activa': 'bg-green-100 text-green-800',
            'Cerrada': 'bg-red-100 text-red-800',
            'Contínua': 'bg-blue-100 text-blue-800'
        }
        return badges[estado] || 'bg-gray-100 text-gray-800'
    }

    if (loading) {
        return (
            <div className="p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#4B50D0' }}></div>
                <p className="mt-4 text-gray-600">Cargando becas...</p>
            </div>
        )
    }

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2" style={{ color: '#312C8E' }}>
                    🗺️ Ideas desde BecaMap
                </h2>
                <p className="text-gray-600">
                    12 becas activas o continuas para generar contenido rápidamente
                </p>
            </div>

            {scholarships.length === 0 ? (
                <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
                    <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#D5ED86' }}>
                        <span className="text-3xl">🔍</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay becas activas</h3>
                    <p className="text-sm text-gray-500">No se encontraron becas activas o próximas a abrir</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {scholarships.map((scholarship) => (
                        <div
                            key={scholarship.id}
                            onClick={() => setSelectedScholarship(scholarship)}
                            className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer p-6"
                        >
                            {/* Header with Status Badge */}
                            <div className="flex items-start justify-between mb-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(scholarship.estado)}`}>
                                    {scholarship.estado}
                                </span>
                                {scholarship.cobertura_porcentaje && (
                                    <span className="text-sm font-bold" style={{ color: '#4B50D0' }}>
                                        {scholarship.cobertura_porcentaje}% 💰
                                    </span>
                                )}
                            </div>

                            {/* Scholarship Name */}
                            <h3 className="font-bold text-lg mb-2 line-clamp-2" style={{ color: '#312C8E' }}>
                                {scholarship.beca_nombre}
                            </h3>

                            {/* University & Country */}
                            <div className="space-y-2 mb-4">
                                {scholarship.universidad && (
                                    <p className="text-sm text-gray-700 line-clamp-1">
                                        🏛️ {scholarship.universidad}
                                    </p>
                                )}
                                <p className="text-sm text-gray-600">
                                    🌍 {scholarship.pais}
                                </p>
                                <p className="text-sm text-gray-600">
                                    🎓 {scholarship.nivel}
                                </p>
                            </div>

                            {/* Dates */}
                            <div className="border-t border-gray-100 pt-3 space-y-1">
                                {scholarship.siguiente_deadline && (
                                    <p className="text-xs text-gray-500">
                                        <strong className="text-gray-700">Siguiente:</strong> {formatDate(scholarship.siguiente_deadline)}
                                    </p>
                                )}
                                {scholarship.ultima_deadline && (
                                    <p className="text-xs text-gray-500">
                                        <strong className="text-gray-700">Última:</strong> {formatDate(scholarship.ultima_deadline)}
                                    </p>
                                )}
                            </div>

                            {/* CTA */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedScholarship(scholarship)
                                }}
                                className="mt-4 w-full px-4 py-2 rounded-lg font-semibold text-white transition-all hover:scale-105"
                                style={{ backgroundColor: '#4B50D0' }}
                            >
                                Ver Detalles →
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Scholarship Editor Modal */}
            {selectedScholarship && (
                <ScholarshipEditor
                    scholarship={selectedScholarship}
                    onClose={() => setSelectedScholarship(null)}
                    onSave={async (updatedScholarship) => {
                        try {
                            const { data, error } = await supabase
                                .from('scholarships_master')
                                .update(updatedScholarship)
                                .eq('id', updatedScholarship.id)
                                .select()

                            if (error) throw error

                            await fetchScholarships()
                            setSelectedScholarship(null)
                            alert('✅ Scholarship updated successfully!')
                        } catch (error) {
                            console.error('Error updating scholarship:', error)
                            alert('❌ Error updating scholarship: ' + error.message)
                        }
                    }}
                />
            )}
        </div>
    )
}
