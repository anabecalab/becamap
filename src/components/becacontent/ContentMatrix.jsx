import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import * as XLSX from 'xlsx'

export default function ContentMatrix({ onEditClick }) {
    const [content, setContent] = useState([])
    const [filteredContent, setFilteredContent] = useState([])
    const [loading, setLoading] = useState(true)
    const [brandFilter, setBrandFilter] = useState('all')
    const [funnelFilter, setFunnelFilter] = useState('all')
    const [statusFilter, setStatusFilter] = useState('all')

    useEffect(() => {
        fetchContent()
    }, [])

    useEffect(() => {
        let filtered = content

        if (brandFilter !== 'all') {
            filtered = filtered.filter(c => c.brand === brandFilter)
        }
        if (funnelFilter !== 'all') {
            filtered = filtered.filter(c => c.funnel_stage === funnelFilter)
        }
        if (statusFilter !== 'all') {
            filtered = filtered.filter(c => c.content_status === statusFilter)
        }

        setFilteredContent(filtered)
    }, [brandFilter, funnelFilter, statusFilter, content])

    const fetchContent = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('becacontent_matrix')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setContent(data || [])
            setFilteredContent(data || [])
        } catch (error) {
            console.error('Error fetching content:', error)
        } finally {
            setLoading(false)
        }
    }

    const exportToExcel = () => {
        // Prepare data for Excel - flatten all columns
        const excelData = filteredContent.map(item => ({
            'ID': item.id,
            'Marca': item.brand,
            'Estado': item.content_status,
            'Formato': item.format,
            'Red Social': item.red_social || '',
            'Etapa Embudo': item.funnel_stage,
            'Pilar Objetivo': item.goal_pillar,
            'Producto': item.producto || '',
            'Hook/Título': item.hook_text || '',
            'Caption/Descripción': item.caption_ai || '',
            'ManyChat Keyword': item.manychat_keyword || '',
            'ManyChat Automation': item.manychat_automation || '',
            'Freebie Link': item.freebie_link || '',
            'URL Referencia': item.ref_url || '',
            'Upsell Target': item.upsell_target || '',
            'Fecha Programada': item.scheduled_date ? new Date(item.scheduled_date).toLocaleDateString() : '',
            'Prioridad': item.priority || 0,
            'Fecha Creación': item.created_at ? new Date(item.created_at).toLocaleDateString() : '',
        }))

        // Create workbook and worksheet
        const wb = XLSX.utils.book_new()
        const ws = XLSX.utils.json_to_sheet(excelData)

        // Set column widths for better readability
        ws['!cols'] = [
            { wch: 10 },  // ID
            { wch: 15 },  // Marca
            { wch: 15 },  // Estado
            { wch: 12 },  // Formato
            { wch: 12 },  // Red Social
            { wch: 15 },  // Etapa Embudo
            { wch: 15 },  // Pilar Objetivo
            { wch: 15 },  // Producto
            { wch: 40 },  // Hook/Título
            { wch: 50 },  // Caption/Descripción
            { wch: 20 },  // ManyChat Keyword
            { wch: 25 },  // ManyChat Automation
            { wch: 30 },  // Freebie Link
            { wch: 40 },  // URL Referencia
            { wch: 20 },  // Upsell Target
            { wch: 15 },  // Fecha Programada
            { wch: 10 },  // Prioridad
            { wch: 15 },  // Fecha Creación
        ]

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Contenido BecaLab')

        // Generate filename with current date
        const date = new Date().toISOString().split('T')[0]
        const filename = `BecaContent_Export_${date}.xlsx`

        // Download the file
        XLSX.writeFile(wb, filename)
    }

    const getStatusColor = (status) => {
        const colors = {
            'Idea': 'bg-gray-100 text-gray-800',
            'Guionizado': 'bg-blue-100 text-blue-800',
            'En Grabación': 'bg-orange-100 text-orange-800',
            'Edición': 'bg-yellow-100 text-yellow-800',
            'Programado': 'bg-purple-100 text-purple-800',
            'Publicado': 'bg-green-100 text-green-800',
        }
        return colors[status] || 'bg-gray-100 text-gray-800'
    }

    if (loading) {
        return (
            <div className="p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#4B50D0' }}></div>
                <p className="mt-4 text-gray-600">Cargando contenido...</p>
            </div>
        )
    }

    return (
        <div>
            {/* Filters + Export Button */}
            <div className="mb-6 flex items-end gap-4">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
                        <select
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-becalab-blue focus:border-transparent"
                            value={brandFilter}
                            onChange={(e) => setBrandFilter(e.target.value)}
                        >
                            <option value="all">Todas las marcas</option>
                            <option value="BecaLab">BecaLab</option>
                            <option value="Ana Cosmica">Ana Cosmica</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Etapa del Embudo</label>
                        <select
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-becalab-blue focus:border-transparent"
                            value={funnelFilter}
                            onChange={(e) => setFunnelFilter(e.target.value)}
                        >
                            <option value="all">Todas las etapas</option>
                            <option value="TOFU">TOFU (Viral)</option>
                            <option value="MOFU">MOFU (Valor/Freebie)</option>
                            <option value="BOFU">BOFU (Venta/Upsell)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                        <select
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-becalab-blue focus:border-transparent"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">Todos los estados</option>
                            <option value="Idea">Idea</option>
                            <option value="Guionizado">Guionizado</option>
                            <option value="En Grabación">En Grabación</option>
                            <option value="Edición">Edición</option>
                            <option value="Programado">Programado</option>
                            <option value="Publicado">Publicado</option>
                        </select>
                    </div>
                </div>

                <button
                    onClick={exportToExcel}
                    disabled={filteredContent.length === 0}
                    className="px-6 py-2 rounded-lg font-semibold text-white transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    style={{ backgroundColor: '#4B50D0' }}
                    title="Exportar datos visibles a Excel"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Exportar a Excel
                </button>
            </div>

            <div className="text-sm text-gray-600 mb-4">
                Mostrando {filteredContent.length} de {content.length} piezas
            </div>

            {/* Content Table */}
            {filteredContent.length === 0 ? (
                <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
                    <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#D5ED86' }}>
                        <span className="text-3xl">✨</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay contenido aún</h3>
                    <p className="text-sm text-gray-500">Comienza creando tu primera idea de contenido</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marca</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título o Hook</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Formato</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Embudo</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prioridad</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredContent.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => onEditClick?.(item)}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${item.brand === 'BecaLab' ? 'bg-purple-100 text-purple-800' : 'bg-pink-100 text-pink-800'}`}>
                                                {item.brand}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 max-w-xs truncate text-sm text-gray-900">{item.hook_text || '—'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.format}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.funnel_stage}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.content_status)}`}>
                                                {item.content_status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {item.scheduled_date ? new Date(item.scheduled_date).toLocaleDateString() : '—'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <span key={i} className={i < (item.priority || 0) ? 'text-yellow-400' : 'text-gray-300'}>★</span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    onEditClick?.(item)
                                                }}
                                                className="font-medium hover:opacity-80"
                                                style={{ color: '#4B50D0' }}
                                            >
                                                Editar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}
