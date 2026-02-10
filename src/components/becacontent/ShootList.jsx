import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function ShootList() {
    const [shootItems, setShootItems] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchShootList()
    }, [])

    const fetchShootList = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('becacontent_matrix')
                .select('*')
                .eq('content_status', 'En Grabación')
                .order('scheduled_date', { ascending: true })

            if (error) throw error
            setShootItems(data || [])
        } catch (error) {
            console.error('Error fetching shoot list:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#4B50D0' }}></div>
                <p className="mt-4 text-gray-600">Cargando lista de producción...</p>
            </div>
        )
    }

    if (shootItems.length === 0) {
        return (
            <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
                <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#D5ED86' }}>
                    <span className="text-3xl">🎬</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay piezas en grabación</h3>
                <p className="text-sm text-gray-500">Las piezas marcadas "En Grabación" aparecerán aquí</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {shootItems.map((item) => {
                const notes = item.production_notes || {}
                return (
                    <div key={item.id} className="bg-white rounded-lg shadow-sm border-2 border-orange-200 p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${item.brand === 'BecaLab' ? 'bg-purple-100 text-purple-800' : 'bg-pink-100 text-pink-800'}`}>
                                        {item.brand}
                                    </span>
                                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                                        {item.format}
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">{item.hook_text || 'Sin hook definido'}</h3>
                                {item.scheduled_date && (
                                    <p className="text-sm text-gray-500 mt-1">
                                        📅 Fecha: {new Date(item.scheduled_date).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                            <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <span key={i} className={i < (item.priority || 0) ? 'text-yellow-400 text-lg' : 'text-gray-300 text-lg'}>★</span>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">📦 Props</p>
                                {notes.props && notes.props.length > 0 ? (
                                    <ul className="space-y-1">
                                        {notes.props.map((prop, idx) => (
                                            <li key={idx} className="text-sm text-gray-700">• {prop}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-gray-400">No definidos</p>
                                )}
                            </div>

                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">👤 Modelos</p>
                                {notes.models && notes.models.length > 0 ? (
                                    <ul className="space-y-1">
                                        {notes.models.map((model, idx) => (
                                            <li key={idx} className="text-sm text-gray-700">• {model}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-gray-400">No definidos</p>
                                )}
                            </div>

                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">📍 Locación</p>
                                <p className="text-sm text-gray-700">{notes.location || 'No definida'}</p>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
