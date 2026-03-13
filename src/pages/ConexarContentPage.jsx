import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const COLORS = {
    deepPurple: '#312C8E',
    brightBlue: '#4B50D0',
    lime: '#D5ED86',
    lavender: '#b1a2d2',
    gold: '#eab10b',
    white: '#FFFFFF',
}

const STATUS_COLORS = {
    'Idea': 'bg-gray-100 text-gray-800',
    'Guionizado': 'bg-blue-100 text-blue-800',
    'En Grabación': 'bg-orange-100 text-orange-800',
    'Edición': 'bg-yellow-100 text-yellow-800',
    'Programado': 'bg-purple-100 text-purple-800',
    'Publicado': 'bg-green-100 text-green-800',
}

const APPROVAL_COLORS = {
    'Pendiente': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '⏳' },
    'En Revisión': { bg: 'bg-blue-100', text: 'text-blue-800', icon: '👁️' },
    'Aprobado': { bg: 'bg-green-100', text: 'text-green-800', icon: '✅' },
    'Rechazado': { bg: 'bg-red-100', text: 'text-red-800', icon: '❌' },
}

export default function ConexarContentPage() {
    const [content, setContent] = useState([])
    const [loading, setLoading] = useState(true)
    const [showNewForm, setShowNewForm] = useState(false)
    const [filter, setFilter] = useState('all')
    const [expandedRow, setExpandedRow] = useState(null)

    // Form state
    const [form, setForm] = useState({
        brand: 'BecaLab',
        format: 'Reel',
        red_social: 'Instagram',
        funnel_stage: 'TOFU',
        goal_pillar: 'Awareness',
        hook_text: '',
        caption_ai: '',
        drive_url: '',
        priority: 2,
    })

    useEffect(() => {
        fetchContent()
    }, [])

    const fetchContent = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('becacontent_matrix')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setContent(data || [])
        } catch (error) {
            console.error('Error fetching content:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const { data, error } = await supabase
                .from('becacontent_matrix')
                .insert([{
                    ...form,
                    content_status: 'Idea',
                    approval_status: 'Pendiente',
                    submitted_by: 'CONEXAR',
                }])
                .select()

            if (error) throw error

            alert('✅ Pieza de contenido creada y enviada para aprobación')
            setShowNewForm(false)
            setForm({
                brand: 'BecaLab',
                format: 'Reel',
                red_social: 'Instagram',
                funnel_stage: 'TOFU',
                goal_pillar: 'Awareness',
                hook_text: '',
                caption_ai: '',
                drive_url: '',
                priority: 2,
            })
            await fetchContent()
        } catch (error) {
            console.error('Error creating content:', error)
            alert('❌ Error al crear: ' + error.message)
        }
    }

    const filteredContent = filter === 'all'
        ? content
        : content.filter(c => c.approval_status === filter)

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: COLORS.brightBlue }}></div>
                    <p className="mt-4 text-gray-600">Cargando contenido...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex-1 overflow-auto">
            {/* Header */}
            <header className="sticky top-0 z-10 shadow-sm border-b border-gray-200" style={{ background: `linear-gradient(135deg, ${COLORS.deepPurple} 0%, ${COLORS.brightBlue} 100%)` }}>
                <div className="px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-white">BecaContent — CONEXAR</h1>
                            <p className="mt-1 text-sm" style={{ color: COLORS.lime }}>
                                Gestión de contenido para RRSS • Propuestas y Aprobaciones
                            </p>
                        </div>
                        <button
                            onClick={() => setShowNewForm(!showNewForm)}
                            className="px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105"
                            style={{ backgroundColor: COLORS.lime, color: COLORS.deepPurple }}
                        >
                            {showNewForm ? '✖ Cancelar' : '🎨 Nueva Propuesta'}
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="mt-4 flex gap-2 flex-wrap">
                        {['all', 'Pendiente', 'En Revisión', 'Aprobado', 'Rechazado'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f ? 'text-white' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
                                style={filter === f ? { backgroundColor: COLORS.brightBlue } : {}}
                            >
                                {f === 'all' ? 'Todas' : `${APPROVAL_COLORS[f]?.icon || ''} ${f}`}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <div className="p-6">
                {/* New Content Form */}
                {showNewForm && (
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
                        <h2 className="text-xl font-bold mb-4" style={{ color: COLORS.deepPurple }}>
                            🎨 Nueva Propuesta de Contenido
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
                                    <select
                                        value={form.brand}
                                        onChange={(e) => setForm({ ...form, brand: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg"
                                    >
                                        <option value="BecaLab">BecaLab</option>
                                        <option value="Ana Cosmica">Ana Cosmica</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Formato</label>
                                    <select
                                        value={form.format}
                                        onChange={(e) => setForm({ ...form, format: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg"
                                    >
                                        <option value="Reel">Reel</option>
                                        <option value="Carrusel">Carrusel</option>
                                        <option value="Estático">Estático</option>
                                        <option value="Story">Story</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Red Social</label>
                                    <select
                                        value={form.red_social}
                                        onChange={(e) => setForm({ ...form, red_social: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg"
                                    >
                                        <option value="Instagram">Instagram</option>
                                        <option value="TikTok">TikTok</option>
                                        <option value="LinkedIn">LinkedIn</option>
                                        <option value="Otro">Otro</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Etapa del Embudo</label>
                                    <select
                                        value={form.funnel_stage}
                                        onChange={(e) => setForm({ ...form, funnel_stage: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg"
                                    >
                                        <option value="TOFU">TOFU (Viral)</option>
                                        <option value="MOFU">MOFU (Valor/Freebie)</option>
                                        <option value="BOFU">BOFU (Venta/Upsell)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Pilar Objetivo</label>
                                    <select
                                        value={form.goal_pillar}
                                        onChange={(e) => setForm({ ...form, goal_pillar: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg"
                                    >
                                        <option value="Awareness">Awareness</option>
                                        <option value="Educación">Educación</option>
                                        <option value="Engagement">Engagement</option>
                                        <option value="Venta Directa">Venta Directa</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
                                    <select
                                        value={form.priority}
                                        onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 border rounded-lg"
                                    >
                                        <option value={1}>🔴 Alta</option>
                                        <option value={2}>🟡 Media</option>
                                        <option value={3}>🟢 Baja</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Hook / Título</label>
                                <input
                                    type="text"
                                    value={form.hook_text}
                                    onChange={(e) => setForm({ ...form, hook_text: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    placeholder="Ej: 3 becas que nadie conoce para estudiar en Europa 🇪🇺"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Caption / Body</label>
                                <textarea
                                    value={form.caption_ai}
                                    onChange={(e) => setForm({ ...form, caption_ai: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    rows={3}
                                    placeholder="Descripción o caption sugerido..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">🔗 Link de Google Drive / Canva (materiales)</label>
                                <input
                                    type="url"
                                    value={form.drive_url}
                                    onChange={(e) => setForm({ ...form, drive_url: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    placeholder="https://drive.google.com/... o https://www.canva.com/..."
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 rounded-lg font-semibold text-white transition-all hover:scale-[1.02]"
                                style={{ backgroundColor: COLORS.brightBlue }}
                            >
                                📤 Enviar Propuesta para Aprobación
                            </button>
                        </form>
                    </div>
                )}

                {/* Stats Banner */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {Object.entries(APPROVAL_COLORS).map(([status, style]) => {
                        const count = content.filter(c => c.approval_status === status).length
                        return (
                            <div key={status} className={`${style.bg} rounded-lg p-4 cursor-pointer hover:opacity-80 transition-all`}
                                onClick={() => setFilter(status)}
                            >
                                <p className={`text-2xl font-bold ${style.text}`}>{count}</p>
                                <p className={`text-xs ${style.text}`}>{style.icon} {status}</p>
                            </div>
                        )
                    })}
                </div>

                {/* Content Table */}
                <div className="text-sm text-gray-600 mb-3">
                    Mostrando {filteredContent.length} de {content.length} piezas
                </div>

                {filteredContent.length === 0 ? (
                    <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
                        <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: COLORS.lime }}>
                            <span className="text-3xl">🎨</span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {filter !== 'all' ? `No hay contenido con estado "${filter}"` : 'Sin propuestas de contenido aún'}
                        </h3>
                        <p className="text-sm text-gray-500">Usa el botón "Nueva Propuesta" para crear tu primera pieza</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marca</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Título / Hook</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Formato</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Embudo</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aprobación</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Drive</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredContent.map((item) => {
                                        const approval = APPROVAL_COLORS[item.approval_status] || APPROVAL_COLORS['Pendiente']
                                        return (
                                            <>
                                                <tr
                                                    key={item.id}
                                                    className="hover:bg-gray-50 cursor-pointer"
                                                    onClick={() => setExpandedRow(expandedRow === item.id ? null : item.id)}
                                                >
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${item.brand === 'BecaLab' ? 'bg-purple-100 text-purple-800' : 'bg-pink-100 text-pink-800'}`}>
                                                            {item.brand}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 max-w-xs truncate text-sm text-gray-900">{item.hook_text || '—'}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{item.format}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{item.funnel_stage}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[item.content_status] || 'bg-gray-100 text-gray-800'}`}>
                                                            {item.content_status}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${approval.bg} ${approval.text}`}>
                                                            {approval.icon} {item.approval_status}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        {item.drive_url ? (
                                                            <a
                                                                href={item.drive_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="text-xs hover:underline"
                                                                style={{ color: COLORS.brightBlue }}
                                                            >
                                                                📁 Ver
                                                            </a>
                                                        ) : (
                                                            <span className="text-xs text-gray-400">—</span>
                                                        )}
                                                    </td>
                                                </tr>
                                                {/* Expanded detail row */}
                                                {expandedRow === item.id && (
                                                    <tr key={`${item.id}-detail`}>
                                                        <td colSpan={7} className="px-4 py-4 bg-gray-50">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div>
                                                                    <p className="text-xs font-medium text-gray-500 mb-1">Caption / Body</p>
                                                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{item.caption_ai || 'Sin caption'}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs font-medium text-gray-500 mb-1">Feedback de Aprobación</p>
                                                                    {item.approval_feedback ? (
                                                                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                                                                            <p className="text-sm text-gray-700">{item.approval_feedback}</p>
                                                                        </div>
                                                                    ) : (
                                                                        <p className="text-sm text-gray-400 italic">Sin feedback aún</p>
                                                                    )}

                                                                    {item.drive_url && (
                                                                        <div className="mt-3">
                                                                            <p className="text-xs font-medium text-gray-500 mb-1">Enlace de materiales</p>
                                                                            <a
                                                                                href={item.drive_url}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="text-sm hover:underline break-all"
                                                                                style={{ color: COLORS.brightBlue }}
                                                                            >
                                                                                {item.drive_url}
                                                                            </a>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
