import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function NewIdeaForm({ isOpen, onClose, onSuccess, prefilledData }) {
    const [formData, setFormData] = useState({
        brand: 'BecaLab',
        content_status: 'Idea',
        format: 'Reel',
        funnel_stage: 'TOFU',
        goal_pillar: 'Awareness',
        producto: 'BecaLab+',
        red_social: 'Instagram',
        manychat_automation: 'Simple (solo responder comentarios)',
        hook_text: '',
        caption_ai: '',
        manychat_keyword: '',
        freebie_items: [{ type: 'link', value: '' }],
        canva_link: '',
        ref_urls: [''],
        upsell_target: 'BecaLab+',
        scheduled_date: '',
        priority: 3,
    })
    const [loading, setLoading] = useState(false)
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

    useEffect(() => {
        if (prefilledData) {
            setFormData(prev => ({
                ...prev,
                brand: prefilledData.brand || prev.brand,
                hook_text: prefilledData.idea_title || prev.hook_text,
                caption_ai: prefilledData.idea_description || prev.caption_ai,
                ref_urls: prefilledData.inspiration_url ? [prefilledData.inspiration_url] : prev.ref_urls,
            }))
        }
    }, [prefilledData])

    useEffect(() => {
        // Track unsaved changes - check if any meaningful data has been entered
        const hasChanges =
            formData.hook_text.trim() !== '' ||
            formData.caption_ai.trim() !== '' ||
            formData.manychat_keyword.trim() !== '' ||
            formData.freebie_items.some(item => item.value.trim() !== '') ||
            formData.canva_link.trim() !== '' ||
            formData.ref_urls.some(url => url.trim() !== '') ||
            formData.scheduled_date !== ''

        setHasUnsavedChanges(hasChanges)
    }, [formData])

    if (!isOpen) return null

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleAddFreebieItem = (type) => {
        if (formData.freebie_items.length < 5) {
            setFormData(prev => ({
                ...prev,
                freebie_items: [...prev.freebie_items, { type, value: '' }]
            }))
        }
    }

    const handleRemoveFreebieItem = (index) => {
        setFormData(prev => ({
            ...prev,
            freebie_items: prev.freebie_items.filter((_, i) => i !== index)
        }))
    }

    const handleFreebieItemChange = (index, value) => {
        setFormData(prev => ({
            ...prev,
            freebie_items: prev.freebie_items.map((item, i) =>
                i === index ? { ...item, value } : item
            )
        }))
    }

    const handleAddRefUrl = () => {
        if (formData.ref_urls.length < 5) {
            setFormData(prev => ({
                ...prev,
                ref_urls: [...prev.ref_urls, '']
            }))
        }
    }

    const handleRemoveRefUrl = (index) => {
        setFormData(prev => ({
            ...prev,
            ref_urls: prev.ref_urls.filter((_, i) => i !== index)
        }))
    }

    const handleRefUrlChange = (index, value) => {
        setFormData(prev => ({
            ...prev,
            ref_urls: prev.ref_urls.map((url, i) => i === index ? value : url)
        }))
    }

    const handleClose = () => {
        if (hasUnsavedChanges) {
            if (window.confirm('Tienes cambios sin guardar. ¿Deseas cerrar sin guardar?')) {
                setHasUnsavedChanges(false)
                onClose()
            }
        } else {
            onClose()
        }
    }

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            handleClose()
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            setLoading(true)

            // Get current user from localStorage
            const userData = localStorage.getItem('admin_user')
            const user = userData ? JSON.parse(userData) : null

            // Combine ref_urls into single string (comma-separated)
            const refUrlsString = formData.ref_urls.filter(url => url.trim() !== '').join(',')

            // Combine freebie items into comma-separated string
            const freebieString = formData.freebie_items
                .filter(item => item.value.trim() !== '')
                .map(item => item.type === 'file' ? `file:${item.value}` : item.value)
                .join(',')

            const { data, error } = await supabase
                .from('becacontent_matrix')
                .insert([{
                    brand: formData.brand,
                    content_status: formData.content_status,
                    format: formData.format,
                    funnel_stage: formData.funnel_stage,
                    goal_pillar: formData.goal_pillar,
                    producto: formData.producto,
                    red_social: formData.red_social,
                    manychat_automation: formData.manychat_automation,
                    hook_text: formData.hook_text,
                    caption_ai: formData.caption_ai,
                    manychat_keyword: formData.manychat_keyword,
                    freebie_link: freebieString,
                    canva_link: formData.canva_link,
                    ref_url: refUrlsString,
                    upsell_target: formData.upsell_target,
                    scheduled_date: formData.scheduled_date || null,
                    priority: formData.priority,
                    user_id: user?.id || null,
                    production_notes: { props: [], models: [], location: '' }
                }])
                .select()

            if (error) throw error

            alert('✅ Idea creada exitosamente!')
            setHasUnsavedChanges(false)
            onSuccess?.()
            onClose()
        } catch (error) {
            console.error('Error creating content:', error)
            alert('❌ Error al crear idea: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={handleBackdropClick}>
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
                    <h2 className="text-2xl font-bold" style={{ color: '#312C8E' }}>✨ Nueva Idea de Contenido</h2>
                    <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Marca *</label>
                            <select
                                name="brand"
                                value={formData.brand}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-becalab-blue focus:border-transparent"
                            >
                                <option value="BecaLab">BecaLab</option>
                                <option value="Ana Cosmica">Ana Cosmica</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Formato *</label>
                            <select
                                name="format"
                                value={formData.format}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-becalab-blue focus:border-transparent"
                            >
                                <option value="Reel">Reel</option>
                                <option value="Carrusel">Carrusel</option>
                                <option value="Estático">Estático</option>
                                <option value="Story">Story</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Red Social *</label>
                            <select
                                name="red_social"
                                value={formData.red_social}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-becalab-blue focus:border-transparent"
                            >
                                <option value="Instagram">Instagram</option>
                                <option value="TikTok">TikTok</option>
                                <option value="LinkedIn">LinkedIn</option>
                                <option value="Otro">Otro</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Etapa del Embudo *</label>
                            <select
                                name="funnel_stage"
                                value={formData.funnel_stage}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-becalab-blue focus:border-transparent"
                            >
                                <option value="TOFU">TOFU (Viral)</option>
                                <option value="MOFU">MOFU (Valor/Freebie)</option>
                                <option value="BOFU">BOFU (Venta/Upsell)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Pilar de Objetivo *</label>
                            <select
                                name="goal_pillar"
                                value={formData.goal_pillar}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-becalab-blue focus:border-transparent"
                            >
                                <option value="Awareness">Awareness</option>
                                <option value="Educación">Educación</option>
                                <option value="Engagement">Engagement</option>
                                <option value="Venta Directa">Venta Directa</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Producto *</label>
                            <select
                                name="producto"
                                value={formData.producto}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-becalab-blue focus:border-transparent"
                            >
                                <option value="BecaBot WA">BecaBot WA</option>
                                <option value="BecaBot WEB">BecaBot WEB</option>
                                <option value="BecaLab+">BecaLab+</option>
                                <option value="BecaMatch">BecaMatch</option>
                                <option value="Taller">Taller</option>
                                <option value="Evento">Evento</option>
                                <option value="Ferias">Ferias</option>
                                <option value="Publicidad">Publicidad</option>
                                <option value="Otros">Otros</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
                            <select
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-becalab-blue focus:border-transparent"
                            >
                                <option value="1">1 - Baja</option>
                                <option value="2">2</option>
                                <option value="3">3 - Media</option>
                                <option value="4">4</option>
                                <option value="5">5 - Crítica</option>
                            </select>
                        </div>
                    </div>

                    {/* Gemini Link Section */}
                    <div className="flex items-center gap-3 p-4 rounded-lg" style={{ backgroundColor: '#D5ED86' }}>
                        <span className="text-2xl">🤖</span>
                        <div className="flex-1">
                            <p className="font-semibold" style={{ color: '#312C8E' }}>Generador de Ideas con IA</p>
                            <p className="text-sm" style={{ color: '#312C8E', opacity: 0.8 }}>
                                Usa Gemini para generar ideas de contenido
                            </p>
                        </div>
                        <a
                            href="https://gemini.google.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 rounded-lg font-semibold text-white transition-all hover:scale-105"
                            style={{ backgroundColor: '#4B50D0' }}
                        >
                            ✨ Ir a Gemini
                        </a>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Título o Hook</label>
                        <textarea
                            name="hook_text"
                            value={formData.hook_text}
                            onChange={handleChange}
                            rows="2"
                            placeholder="El gancho inicial que captura atención en los primeros 3 segundos"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-becalab-blue focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Caption o descripción para post</label>
                        <textarea
                            name="caption_ai"
                            value={formData.caption_ai}
                            onChange={handleChange}
                            rows="4"
                            placeholder="El copy completo para el post, incluyendo CTA"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-becalab-blue focus:border-transparent"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ManyChat Keyword</label>
                            <input
                                type="text"
                                name="manychat_keyword"
                                value={formData.manychat_keyword}
                                onChange={handleChange}
                                placeholder="ej: EXTENSIÓN"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-becalab-blue focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Automatización ManyChat</label>
                            <select
                                name="manychat_automation"
                                value={formData.manychat_automation}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-becalab-blue focus:border-transparent"
                            >
                                <option value="Simple (solo responder comentarios)">Simple (solo responder comentarios)</option>
                                <option value="Workflow">Workflow</option>
                            </select>
                        </div>
                    </div>

                    {/* Multiple Freebies */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-700">Freebies</label>
                            {formData.freebie_items.length < 5 && (
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleAddFreebieItem('link')}
                                        className="px-3 py-1 text-sm rounded-lg font-semibold transition-all hover:scale-105"
                                        style={{ backgroundColor: '#D5ED86', color: '#312C8E' }}
                                    >
                                        + Agregar Link
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleAddFreebieItem('file')}
                                        className="px-3 py-1 text-sm rounded-lg font-semibold transition-all hover:scale-105"
                                        style={{ backgroundColor: '#D5ED86', color: '#312C8E' }}
                                    >
                                        + Agregar Archivo
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="space-y-2">
                            {formData.freebie_items.map((item, index) => (
                                <div key={index} className="flex gap-2 items-center">
                                    <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600 min-w-[70px] text-center">
                                        {item.type === 'file' ? '📎 Archivo' : '🔗 Link'}
                                    </span>
                                    <input
                                        type={item.type === 'link' ? 'url' : 'text'}
                                        value={item.value}
                                        onChange={(e) => handleFreebieItemChange(index, e.target.value)}
                                        placeholder={item.type === 'link' ? 'https://...' : 'nombre_archivo.pdf'}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-becalab-blue focus:border-transparent"
                                    />
                                    {formData.freebie_items.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveFreebieItem(index)}
                                            className="px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-all"
                                        >
                                            🗑️
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Agrega links o nombres de archivos de freebies</p>
                    </div>

                    {/* Canva Link */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Artes en Canva</label>
                        <input
                            type="url"
                            name="canva_link"
                            value={formData.canva_link}
                            onChange={handleChange}
                            placeholder="https://canva.com/design/..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-becalab-blue focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">Link al diseño del post o carrusel en Canva</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Programada</label>
                        <input
                            type="date"
                            name="scheduled_date"
                            value={formData.scheduled_date}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-becalab-blue focus:border-transparent"
                        />
                    </div>

                    {/* Multiple Reference URLs */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-700">URLs de Referencia</label>
                            {formData.ref_urls.length < 5 && (
                                <button
                                    type="button"
                                    onClick={handleAddRefUrl}
                                    className="px-3 py-1 text-sm rounded-lg font-semibold transition-all hover:scale-105"
                                    style={{ backgroundColor: '#D5ED86', color: '#312C8E' }}
                                >
                                    + Agregar URL
                                </button>
                            )}
                        </div>
                        <div className="space-y-2">
                            {formData.ref_urls.map((url, index) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="url"
                                        value={url}
                                        onChange={(e) => handleRefUrlChange(index, e.target.value)}
                                        placeholder={`https://instagram.com/... (${index + 1})`}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-becalab-blue focus:border-transparent"
                                    />
                                    {formData.ref_urls.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveRefUrl(index)}
                                            className="px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-all"
                                        >
                                            🗑️
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-6 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-2 rounded-lg font-semibold text-white transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ backgroundColor: '#4B50D0' }}
                        >
                            {loading ? 'Creando...' : '✅ Crear Idea'}
                        </button>
                    </div>
                </form>
            </div >
        </div >
    )
}
