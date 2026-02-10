import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function DashboardHome() {
    const [scholarshipStats, setScholarshipStats] = useState(null)
    const [contentStats, setContentStats] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchStats()
    }, [])

    const fetchStats = async () => {
        try {
            setLoading(true)

            // Fetch scholarship stats
            const { data: schStats, error: schError } = await supabase
                .from('scholarships_stats')
                .select('*')
                .single()

            if (schError) console.error('Error fetching scholarship stats:', schError)
            else setScholarshipStats(schStats)

            // Fetch content stats
            const { data: contStats, error: contError } = await supabase
                .from('becacontent_stats')
                .select('*')
                .single()

            if (contError) console.error('Error fetching content stats:', contError)
            else setContentStats(contStats)

        } catch (error) {
            console.error('Error loading stats:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#4B50D0' }}></div>
                    <p className="mt-4 text-gray-600">Cargando dashboard...</p>
                </div>
            </div>
        )
    }

    const monthlyGoal = 30
    const publishedThisMonth = contentStats?.published_this_month || 0
    const progressPercentage = Math.round((publishedThisMonth / monthlyGoal) * 100)
    const progressColor = progressPercentage >= 75 ? '#10B981' : progressPercentage >= 40 ? '#F59E0B' : '#EF4444'

    return (
        <div className="flex-1 overflow-auto">
            {/* Header */}
            <header className="shadow-sm border-b border-gray-200" style={{ backgroundColor: '#312C8E' }}>
                <div className="px-6 py-6">
                    <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                    <p className="mt-1 text-sm" style={{ color: '#D5ED86' }}>Vista general del sistema BecaLab</p>
                </div>
            </header>

            <div className="p-6 space-y-6">
                {/* Content Tracker Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">🎯 Tracker de Contenido</h2>
                            <p className="text-sm text-gray-500">Progreso mensual del equipo</p>
                        </div>
                        <div className="text-right">
                            <p className="text-3xl font-bold" style={{ color: progressColor }}>
                                {publishedThisMonth}/{monthlyGoal}
                            </p>
                            <p className="text-sm text-gray-500">piezas este mes</p>
                        </div>
                    </div>

                    <div className="mb-2">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Progreso</span>
                            <span>{progressPercentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                                className="h-3 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(progressPercentage, 100)}%`, backgroundColor: progressColor }}
                            />
                        </div>
                    </div>

                    {contentStats && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                            <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-2xl font-bold" style={{ color: '#312C8E' }}>{contentStats.total_pieces}</p>
                                <p className="text-xs text-gray-600">Total Ideas</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-2xl font-bold" style={{ color: '#4B50D0' }}>{contentStats.in_production}</p>
                                <p className="text-xs text-gray-600">En Producción</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-2xl font-bold" style={{ color: '#312C8E' }}>{contentStats.becalab_count}</p>
                                <p className="text-xs text-gray-600">BecaLab</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-2xl font-bold" style={{ color: '#4B50D0' }}>{contentStats.ana_cosmica_count}</p>
                                <p className="text-xs text-gray-600">Ana Cosmica</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* BecaMap Stats */}
                {scholarshipStats && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">🗺️ BecaMap Overview</h2>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-2xl font-bold" style={{ color: '#312C8E' }}>{scholarshipStats.total_scholarships}</p>
                                <p className="text-xs text-gray-600">Total Becas</p>
                            </div>
                            <div className="bg-green-50 rounded-lg p-4">
                                <p className="text-2xl font-bold text-green-700">{scholarshipStats.active_count}</p>
                                <p className="text-xs text-gray-600">Activas</p>
                            </div>
                            <div className="bg-red-50 rounded-lg p-4">
                                <p className="text-2xl font-bold text-red-700">{scholarshipStats.broken_count}</p>
                                <p className="text-xs text-gray-600">Links Rotos</p>
                            </div>
                            <div className="bg-yellow-50 rounded-lg p-4">
                                <p className="text-2xl font-bold text-yellow-700">{scholarshipStats.pending_count}</p>
                                <p className="text-xs text-gray-600">Pendientes</p>
                            </div>
                            <div className="bg-blue-50 rounded-lg p-4">
                                <p className="text-2xl font-bold text-blue-700">{scholarshipStats.total_countries}</p>
                                <p className="text-xs text-gray-600">Países</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">⚡ Acciones Rápidas</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <a
                            href="/becacontent"
                            className="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 hover:border-becalab-blue hover:bg-gray-50 transition-all"
                        >
                            <span className="text-2xl">✨</span>
                            <div>
                                <p className="font-semibold text-gray-900">Nueva Idea</p>
                                <p className="text-xs text-gray-500">Crear contenido</p>
                            </div>
                        </a>
                        <a
                            href="/becamap"
                            className="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 hover:border-becalab-blue hover:bg-gray-50 transition-all"
                        >
                            <span className="text-2xl">🎓</span>
                            <div>
                                <p className="font-semibold text-gray-900">Añadir Beca</p>
                                <p className="text-xs text-gray-500">Gestionar BecaMap</p>
                            </div>
                        </a>
                        <a
                            href="/recursos"
                            className="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 hover:border-becalab-blue hover:bg-gray-50 transition-all"
                        >
                            <span className="text-2xl">📚</span>
                            <div>
                                <p className="font-semibold text-gray-900">Ver Recursos</p>
                                <p className="text-xs text-gray-500">Biblioteca de assets</p>
                            </div>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}
