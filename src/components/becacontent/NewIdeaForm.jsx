import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import FileUpload from '../FileUpload'

export default function NewIdeaForm({ isOpen, onClose, onSuccess, prefilledData }) {
    const [formData, setFormData] = useState({
        // Sección 1: Información de la Beca
        beca_oportunidad: '',
        descripcion_beca: '',
        comentarios_extra: '',
        // Sección 2: Fechas y Documentos
        fecha_entrega: '',
        fecha_publicacion: '',
        documentos: [], // array of {type: 'file'|'url', value: '', name: ''}
        doc_urls: [''], // URL fields for Drive links
        // Sección 3: Clasificación
        content_status: 'Pendiente aprob.',
        brand: '@beca_lab',
        tipo_contenido: 'Post',
        servicio_producto: 'Contenido orgánico',
        pilar: 'Descubrimiento',
        // Sección 4: Contenido Creativo
        hook_text: '',
        format: 'Reel',
        enfoque: 'Educativo',
        caption_ai: '',
        manychat_keyword: '',
        micro_app_url: '',
        // Metadata
        correction_comments: '',
        priority: 2,
        scholarship_ids: [],
    })
    const [loading, setLoading] = useState(false)
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

    const defaultFormData = {
        beca_oportunidad: '',
        descripcion_beca: '',
        comentarios_extra: '',
        fecha_entrega: '',
        fecha_publicacion: '',
        documentos: [],
        doc_urls: [''],
        content_status: 'Pendiente aprob.',
        brand: '@beca_lab',
        tipo_contenido: 'Post',
        servicio_producto: 'Contenido orgánico',
        pilar: 'Descubrimiento',
        hook_text: '',
        format: 'Reel',
        enfoque: 'Educativo',
        caption_ai: '',
        manychat_keyword: '',
        micro_app_url: '',
        correction_comments: '',
        priority: 2,
        scholarship_ids: [],
    }

    useEffect(() => {
        if (!isOpen) return
        if (prefilledData) {
            setFormData({
                ...defaultFormData,
                brand: prefilledData.brand || defaultFormData.brand,
                beca_oportunidad: prefilledData.scholarship_name || prefilledData.idea_title || '',
                descripcion_beca: prefilledData.idea_description || '',
                doc_urls: prefilledData.inspiration_url ? [prefilledData.inspiration_url] : [''],
                scholarship_ids: prefilledData.scholarship_id ? [prefilledData.scholarship_id] : [],
            })
        } else {
            setFormData({ ...defaultFormData })
        }
        setHasUnsavedChanges(false)
    }, [isOpen, prefilledData])

    useEffect(() => {
        const hasChanges =
            formData.beca_oportunidad.trim() !== '' ||
            formData.descripcion_beca.trim() !== '' ||
            formData.hook_text.trim() !== '' ||
            formData.caption_ai.trim() !== '' ||
            formData.manychat_keyword.trim() !== '' ||
            formData.micro_app_url.trim() !== '' ||
            formData.fecha_entrega !== '' ||
            formData.doc_urls.some(url => url.trim() !== '') ||
            formData.documentos.length > 0

        setHasUnsavedChanges(hasChanges)
    }, [formData])

    if (!isOpen) return null

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => {
            const updated = { ...prev, [name]: value }
            // Auto-calculate fecha_publicacion (+7 days from fecha_entrega)
            if (name === 'fecha_entrega' && value) {
                const entregaDate = new Date(value)
                entregaDate.setDate(entregaDate.getDate() + 7)
                updated.fecha_publicacion = entregaDate.toISOString().split('T')[0]
            }
            return updated
        })
    }

    // Enter key on single-line inputs moves focus to next field
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
            e.preventDefault()
            const form = e.target.form
            if (!form) return
            const inputs = Array.from(form.querySelectorAll('input, select, textarea, button[type="submit"]'))
            const currentIdx = inputs.indexOf(e.target)
            if (currentIdx > -1 && currentIdx < inputs.length - 1) {
                inputs[currentIdx + 1].focus()
            }
        }
    }

    const handleAddDocUrl = () => {
        if (formData.doc_urls.length < 5) {
            setFormData(prev => ({
                ...prev,
                doc_urls: [...prev.doc_urls, '']
            }))
        }
    }

    const handleRemoveDocUrl = (index) => {
        setFormData(prev => ({
            ...prev,
            doc_urls: prev.doc_urls.filter((_, i) => i !== index)
        }))
    }

    const handleDocUrlChange = (index, value) => {
        setFormData(prev => ({
            ...prev,
            doc_urls: prev.doc_urls.map((url, i) => i === index ? value : url)
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

            const userData = localStorage.getItem('admin_user')
            const user = userData ? JSON.parse(userData) : null

            // Build documentos JSONB array from uploaded files + URLs
            const docsArray = [
                ...formData.documentos,
                ...formData.doc_urls
                    .filter(url => url.trim() !== '')
                    .map(url => ({ type: 'url', value: url, name: url.split('/').pop() || 'Link' }))
            ]

            const { data, error } = await supabase
                .from('becacontent_matrix')
                .insert([{
                    brand: formData.brand,
                    content_status: formData.content_status,
                    format: formData.format,
                    beca_oportunidad: formData.beca_oportunidad,
                    descripcion_beca: formData.descripcion_beca,
                    comentarios_extra: formData.comentarios_extra,
                    fecha_entrega: formData.fecha_entrega || null,
                    fecha_publicacion: formData.fecha_publicacion || null,
                    documentos: docsArray.length > 0 ? docsArray : null,
                    tipo_contenido: formData.tipo_contenido,
                    servicio_producto: formData.servicio_producto,
                    pilar: formData.pilar,
                    enfoque: formData.enfoque,
                    hook_text: formData.hook_text,
                    caption_ai: formData.caption_ai,
                    manychat_keyword: formData.manychat_keyword,
                    micro_app_url: formData.micro_app_url,
                    correction_comments: formData.correction_comments,
                    priority: formData.priority,
                    scholarship_ids: formData.scholarship_ids.length > 0 ? formData.scholarship_ids : null,
                    user_id: user?.id || null,
                }])
                .select()

            if (error) throw error

            setFormData({ ...defaultFormData })
            setHasUnsavedChanges(false)
            onSuccess?.()
            onClose()
        } catch (error) {
            console.error('Error creating content:', error)
            alert('❌ Error al crear contenido: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={handleBackdropClick}>
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10 rounded-t-xl">
                    <div>
                        <h2 className="text-2xl font-bold" style={{ color: '#312C8E' }}>+ Nuevo Contenido</h2>
                        <p className="text-sm text-gray-500 mt-1">Completa la ficha de contenido para redes sociales</p>
                    </div>
                    <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-8">

                    {/* ================================ */}
                    {/* SECCIÓN 1: Información de la Beca */}
                    {/* ================================ */}
                    <div>
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: '#312C8E' }}>
                            <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: '#4B50D0' }}>1</span>
                            Información de la Beca / Oportunidad
                        </h3>
                        <div className="space-y-4 pl-10">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Beca/Oportunidad a publicar</label>
                                <input
                                    type="text"
                                    name="beca_oportunidad"
                                    value={formData.beca_oportunidad}
                                    onChange={handleChange}
                                    placeholder="Nombre de la beca u oportunidad"
                                    onKeyDown={handleKeyDown}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción beca/oportunidad</label>
                                <textarea
                                    name="descripcion_beca"
                                    value={formData.descripcion_beca}
                                    onChange={handleChange}
                                    rows="3"
                                    placeholder="Cuál es la oportunidad, cómo funciona, deadlines, etc."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Comentarios extra</label>
                                <textarea
                                    name="comentarios_extra"
                                    value={formData.comentarios_extra}
                                    onChange={handleChange}
                                    rows="2"
                                    placeholder="Notas adicionales sobre la beca/oportunidad"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* ================================ */}
                    {/* SECCIÓN 2: Fechas y Documentos */}
                    {/* ================================ */}
                    <div>
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: '#312C8E' }}>
                            <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: '#4B50D0' }}>2</span>
                            Fechas y Documentos
                        </h3>
                        <div className="space-y-4 pl-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        📅 Fecha de Entrega
                                        <span className="text-xs text-gray-400 ml-1">(brief y copy al diseñador)</span>
                                    </label>
                                    <input
                                        type="date"
                                        name="fecha_entrega"
                                        value={formData.fecha_entrega}
                                        onChange={handleChange}
                                        onClick={(e) => e.target.showPicker?.()}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent cursor-pointer"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        📅 Fecha de Publicación
                                        <span className="text-xs text-gray-400 ml-1">(auto +7 días)</span>
                                    </label>
                                    <input
                                        type="date"
                                        name="fecha_publicacion"
                                        value={formData.fecha_publicacion}
                                        onChange={handleChange}
                                        onClick={(e) => e.target.showPicker?.()}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent cursor-pointer"
                                    />
                                </div>
                            </div>

                            {/* Documents upload + URLs */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        📎 Documentos
                                        <span className="text-xs text-gray-400 ml-1">(PDFs, fotos, archivos + links de Drive)</span>
                                    </label>
                                    <div className="flex gap-2">
                                        {formData.doc_urls.length < 5 && (
                                            <button
                                                type="button"
                                                onClick={handleAddDocUrl}
                                                className="px-3 py-1 text-sm rounded-lg font-semibold transition-all hover:scale-105"
                                                style={{ backgroundColor: '#D5ED86', color: '#312C8E' }}
                                            >
                                                + Agregar URL
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* File Upload */}
                                <FileUpload
                                    bucketName="becacontent-freebies"
                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                                    maxSizeMB={50}
                                    onUploadComplete={(data) => {
                                        setFormData(prev => ({
                                            ...prev,
                                            documentos: [...prev.documentos, { type: 'file', value: data.url, name: data.name || 'Archivo' }]
                                        }))
                                    }}
                                />
                                {formData.documentos.length > 0 && (
                                    <div className="mt-2 space-y-2">
                                        {formData.documentos.map((doc, idx) => {
                                            const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(doc.value || doc.name || '')
                                            return (
                                                <div key={idx} className="flex items-center gap-3 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-100">
                                                    {isImage ? (
                                                        <a href={doc.value} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                                                            <img src={doc.value} alt={doc.name} className="w-16 h-16 object-cover rounded-lg border border-gray-200 hover:opacity-80 transition-opacity" />
                                                        </a>
                                                    ) : (
                                                        <span className="text-lg">📎</span>
                                                    )}
                                                    <span className="flex-1 truncate">{doc.name}</span>
                                                    <button type="button" onClick={() => setFormData(prev => ({
                                                        ...prev,
                                                        documentos: prev.documentos.filter((_, i) => i !== idx)
                                                    }))} className="text-red-500 hover:text-red-700 ml-auto flex-shrink-0">✕</button>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}

                                {/* URL Links */}
                                <div className="space-y-2 mt-3">
                                    {formData.doc_urls.map((url, index) => (
                                        <div key={index} className="flex gap-2">
                                            <input
                                                type="url"
                                                value={url}
                                                onChange={(e) => handleDocUrlChange(index, e.target.value)}
                                                placeholder="https://drive.google.com/... o cualquier link"
                                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent text-sm"
                                            />
                                            {formData.doc_urls.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveDocUrl(index)}
                                                    className="px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-all"
                                                >
                                                    🗑️
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ================================ */}
                    {/* SECCIÓN 3: Clasificación */}
                    {/* ================================ */}
                    <div>
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: '#312C8E' }}>
                            <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: '#4B50D0' }}>3</span>
                            Clasificación
                        </h3>
                        <div className="space-y-4 pl-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
                                    <select name="content_status" value={formData.content_status} onChange={handleChange} required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent">
                                        <option value="Propuesta beca">🎓 Propuesta beca</option>
                                        <option value="Pendiente aprob.">⏳ Pendiente aprob.</option>
                                        <option value="Aprobado">✅ Aprobado</option>
                                        <option value="Corregir">✏️ Corregir</option>
                                        <option value="Publicado">📤 Publicado</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cuenta *</label>
                                    <select name="brand" value={formData.brand} onChange={handleChange} required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent">
                                        <option value="@beca_lab">@beca_lab</option>
                                        <option value="@ana.cosmica">@ana.cosmica</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                                    <select name="tipo_contenido" value={formData.tipo_contenido} onChange={handleChange} required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent">
                                        <option value="Post">Post</option>
                                        <option value="Historia">Historia</option>
                                        <option value="Reel">Reel</option>
                                        <option value="Carrusel">Carrusel</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Servicio / Producto</label>
                                    <select name="servicio_producto" value={formData.servicio_producto} onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent">
                                        <option value="BecaBot WA">BecaBot WA</option>
                                        <option value="BecaBot WEB">BecaBot WEB</option>
                                        <option value="BecaMatch gratis">BecaMatch gratis</option>
                                        <option value="BecaMatch PRO">BecaMatch PRO</option>
                                        <option value="Extensión Chrome">Extensión Chrome</option>
                                        <option value="Freebie">Freebie</option>
                                        <option value="Asesoría aislada">Asesoría aislada</option>
                                        <option value="webinar">webinar</option>
                                        <option value="taller propio">taller propio</option>
                                        <option value="publicidad">publicidad</option>
                                        <option value="BecaLab+">BecaLab+</option>
                                        <option value="Contenido orgánico">Contenido orgánico</option>
                                        <option value="otros">otros</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Pilar</label>
                                    <select name="pilar" value={formData.pilar} onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent">
                                        <option value="Descubrimiento">Descubrimiento</option>
                                        <option value="Consideración">Consideración</option>
                                        <option value="Activación">Activación</option>
                                        <option value="Conversión">Conversión</option>
                                        <option value="Fidelización">Fidelización</option>
                                    </select>
                                </div>
                            </div>

                            {/* Correction comments - only show when status = Corregir */}
                            {(formData.content_status === 'Corregir' || formData.content_status === 'Pendiente aprob.') && (
                                <div className={`p-4 rounded-lg border ${formData.content_status === 'Corregir' ? 'bg-orange-50 border-orange-200' : 'bg-yellow-50 border-yellow-200'}`}>
                                    <label className={`block text-sm font-medium mb-1 ${formData.content_status === 'Corregir' ? 'text-orange-800' : 'text-yellow-800'}`}>✏️ Comentarios de corrección</label>
                                    <div className="flex gap-2">
                                        <textarea
                                            name="correction_comments"
                                            value={formData.correction_comments}
                                            onChange={handleChange}
                                            rows="2"
                                            placeholder="¿Qué se necesita corregir?"
                                            className="flex-1 px-4 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:border-transparent bg-white"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault()
                                                    // Save the comment — move on to next field
                                                    const form = e.target.form
                                                    if (!form) return
                                                    const inputs = Array.from(form.querySelectorAll('input, select, textarea, button[type="submit"]'))
                                                    const currentIdx = inputs.indexOf(e.target)
                                                    if (currentIdx > -1 && currentIdx < inputs.length - 1) {
                                                        inputs[currentIdx + 1].focus()
                                                    }
                                                }
                                            }}
                                        />
                                        <div className="flex flex-col justify-end">
                                            <span className="text-xs text-orange-500 mb-1">Enter ↵</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ================================ */}
                    {/* SECCIÓN 4: Contenido Creativo */}
                    {/* ================================ */}
                    <div>
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: '#312C8E' }}>
                            <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: '#4B50D0' }}>4</span>
                            Contenido Creativo
                        </h3>
                        <div className="space-y-4 pl-10">
                            {/* Gemini AI Link */}
                            <div className="flex items-center gap-3 p-4 rounded-lg" style={{ backgroundColor: '#D5ED86' }}>
                                <span className="text-2xl">🤖</span>
                                <div className="flex-1">
                                    <p className="font-semibold" style={{ color: '#312C8E' }}>Generador de Ideas con IA</p>
                                    <p className="text-sm" style={{ color: '#312C8E', opacity: 0.8 }}>
                                        Usa Gemini para generar ideas de contenido y captions
                                    </p>
                                </div>
                                <a href="https://gemini.google.com/" target="_blank" rel="noopener noreferrer"
                                    className="px-4 py-2 rounded-lg font-semibold text-white transition-all hover:scale-105"
                                    style={{ backgroundColor: '#4B50D0' }}>
                                    ✨ Ir a Gemini
                                </a>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    🎣 Gancho
                                    <span className="text-xs text-gray-400 ml-1">(primeros 2 seg del Reel o primera slide del carrusel)</span>
                                </label>
                                <textarea
                                    name="hook_text"
                                    value={formData.hook_text}
                                    onChange={handleChange}
                                    rows="2"
                                    placeholder="El hook que captura atención inmediatamente"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Formato *</label>
                                    <select name="format" value={formData.format} onChange={handleChange} required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent">
                                        <option value="Reel">Reel</option>
                                        <option value="Carrusel">Carrusel</option>
                                        <option value="Imagen">Imagen</option>
                                        <option value="Story">Story</option>
                                        <option value="Video largo">Video largo</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Enfoque</label>
                                    <select name="enfoque" value={formData.enfoque} onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent">
                                        <option value="Emocional">Emocional</option>
                                        <option value="Educativo">Educativo</option>
                                        <option value="Prueba Social">Prueba Social</option>
                                        <option value="Promocional">Promocional</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    📝 Caption
                                    <span className="text-xs text-gray-400 ml-1">(texto completo con hashtags fijos y rotativos)</span>
                                </label>
                                <textarea
                                    name="caption_ai"
                                    value={formData.caption_ai}
                                    onChange={handleChange}
                                    rows="5"
                                    placeholder="El copy completo para el post, incluyendo CTA y hashtags"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        💬 Keyword ManyChat
                                        <span className="text-xs text-gray-400 ml-1">(activa el flujo de DM)</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="manychat_keyword"
                                        value={formData.manychat_keyword}
                                        onChange={handleChange}
                                        placeholder="ej: EXTENSIÓN"
                                        onKeyDown={handleKeyDown}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        🔗 Micro App URL
                                        <span className="text-xs text-gray-400 ml-1">(link para flujo ManyChat)</span>
                                    </label>
                                    <input
                                        type="url"
                                        name="micro_app_url"
                                        value={formData.micro_app_url}
                                        onChange={handleChange}
                                        placeholder="https://..."
                                        onKeyDown={handleKeyDown}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit */}
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
                            className="flex-1 px-6 py-3 rounded-lg font-semibold text-white transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ backgroundColor: '#4B50D0' }}
                        >
                            {loading ? 'Creando...' : '✅ Crear Contenido'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
