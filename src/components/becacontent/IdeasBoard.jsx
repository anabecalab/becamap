import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function IdeasBoard({ onConvertToContent }) {
    const [ideas, setIdeas] = useState([])
    const [loading, setLoading] = useState(true)
    const [showNewForm, setShowNewForm] = useState(false)
    const [newIdea, setNewIdea] = useState({
        brand: 'BecaLab',
        idea_title: '',
        idea_description: '',
        inspiration_url: '',
        tags: [],
        priority: 3
    })
    const [tagInput, setTagInput] = useState('')

    useEffect(() => {
        fetchIdeas()
    }, [])

    const fetchIdeas = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('becacontent_ideas_board')
                .select('*')
                .eq('converted_to_content', false)
                .order('priority', { ascending: false })
                .order('created_at', { ascending: false })

            if (error) throw error
            setIdeas(data || [])
        } catch (error) {
            console.error('Error fetching ideas:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleAddIdea = async (e) => {
        e.preventDefault()

        try {
            const userData = localStorage.getItem('admin_user')
            const user = userData ? JSON.parse(userData) : null

            const { error } = await supabase
                .from('becacontent_ideas_board')
                .insert([{
                    ...newIdea,
                    user_id: user?.id || null
                }])

            if (error) throw error

            alert('✅ Idea agregada al mood board!')
            setNewIdea({
                brand: 'BecaLab',
                idea_title: '',
                idea_description: '',
                inspiration_url: '',
                tags: [],
                priority: 3
            })
            setTagInput('')
            setShowNewForm(false)
            fetchIdeas()
        } catch (error) {
            console.error('Error adding idea:', error)
            alert('❌ Error al agregar idea: ' + error.message)
        }
    }

    const handleConvert = async (idea) => {
        if (window.confirm('¿Convertir esta idea en contenido nuevo?')) {
            try {
                // Update idea as converted
                const { error } = await supabase
                    .from('becacontent_ideas_board')
                    .update({
                        converted_to_content: true,
                        converted_at: new Date().toISOString()
                    })
                    .eq('id', idea.id)

                if (error) throw error

                // Trigger Nueva Idea form with prefilled data
                onConvertToContent?.(idea)
                fetchIdeas()
            } catch (error) {
                console.error('Error converting idea:', error)
                alert('❌ Error al convertir idea: ' + error.message)
            }
        }
    }

    const handleDeleteIdea = async (id) => {
        if (window.confirm('¿Eliminar esta idea del mood board?')) {
            try {
                const { error } = await supabase
                    .from('becacontent_ideas_board')
                    .delete()
                    .eq('id', id)

                if (error) throw error
                fetchIdeas()
            } catch (error) {
                console.error('Error deleting idea:', error)
                alert('❌ Error al eliminar idea: ' + error.message)
            }
        }
    }

    const handleAddTag = () => {
        if (tagInput.trim() && !newIdea.tags.includes(tagInput.trim())) {
            setNewIdea(prev => ({
                ...prev,
                tags: [...prev.tags, tagInput.trim()]
            }))
            setTagInput('')
        }
    }

    const handleRemoveTag = (tagToRemove) => {
        setNewIdea(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }))
    }

    if (loading) {
        return (
            <div className="p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#4B50D0' }}></div>
                <p className="mt-4 text-gray-600">Cargando ideas...</p>
            </div>
        )
    }

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <p className="text-sm text-gray-600">Mood board de ideas que aún no hemos creado como contenido</p>
                <button
                    onClick={() => setShowNewForm(!showNewForm)}
                    className="px-4 py-2 rounded-lg font-semibold text-white transition-all hover:scale-105"
                    style={{ backgroundColor: '#4B50D0' }}
                >
                    {showNewForm ? 'Cancelar' : '➕ Agregar Idea'}
                </button>
            </div>

            {/* New Idea Form */}
            {showNewForm && (
                <form onSubmit={handleAddIdea} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <h3 className="text-lg font-bold mb-4" style={{ color: '#312C8E' }}>Nueva Idea para Mood Board</h3>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Marca *</label>
                                <select
                                    value={newIdea.brand}
                                    onChange={(e) => setNewIdea(prev => ({ ...prev, brand: e.target.value }))}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-becalab-blue focus:border-transparent"
                                >
                                    <option value="BecaLab">BecaLab</option>
                                    <option value="Ana Cosmica">Ana Cosmica</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
                                <select
                                    value={newIdea.priority}
                                    onChange={(e) => setNewIdea(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
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

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Título de la Idea *</label>
                            <input
                                type="text"
                                value={newIdea.idea_title}
                                onChange={(e) => setNewIdea(prev => ({ ...prev, idea_title: e.target.value }))}
                                required
                                placeholder="ej: Tutorial de cómo usar ChatGPT para becas"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-becalab-blue focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                            <textarea
                                value={newIdea.idea_description}
                                onChange={(e) => setNewIdea(prev => ({ ...prev, idea_description: e.target.value }))}
                                rows="3"
                                placeholder="Detalles adicionales sobre la idea..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-becalab-blue focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">URL de Inspiración</label>
                            <input
                                type="url"
                                value={newIdea.inspiration_url}
                                onChange={(e) => setNewIdea(prev => ({ ...prev, inspiration_url: e.target.value }))}
                                placeholder="https://..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-becalab-blue focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                                    placeholder="Agregar tag"
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-becalab-blue focus:border-transparent"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddTag}
                                    className="px-4 py-2 rounded-lg font-semibold text-white"
                                    style={{ backgroundColor: '#4B50D0' }}
                                >
                                    Agregar
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {newIdea.tags.map((tag, idx) => (
                                    <span
                                        key={idx}
                                        className="px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2"
                                        style={{ backgroundColor: '#D5ED86', color: '#312C8E' }}
                                    >
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveTag(tag)}
                                            className="hover:opacity-70"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full px-6 py-2 rounded-lg font-semibold text-white transition-all hover:scale-105"
                            style={{ backgroundColor: '#4B50D0' }}
                        >
                            ✅ Agregar al Mood Board
                        </button>
                    </div>
                </form>
            )}

            {/* Ideas Grid */}
            {ideas.length === 0 ? (
                <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
                    <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#D5ED86' }}>
                        <span className="text-3xl">💡</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay ideas en el mood board</h3>
                    <p className="text-sm text-gray-500">Agrega ideas de contenido que aún no has creado</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {ideas.map((idea) => (
                        <div key={idea.id} className="bg-white rounded-lg shadow-sm border-2 p-4 hover:shadow-md transition-all" style={{ borderColor: idea.brand === 'BecaLab' ? '#4B50D0' : '#FF6B9D' }}>
                            <div className="flex items-start justify-between mb-3">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${idea.brand === 'BecaLab' ? 'bg-purple-100 text-purple-800' : 'bg-pink-100 text-pink-800'}`}>
                                    {idea.brand}
                                </span>
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <span key={i} className={i < (idea.priority || 0) ? 'text-yellow-400 text-sm' : 'text-gray-300 text-sm'}>★</span>
                                    ))}
                                </div>
                            </div>

                            <h3 className="font-bold text-gray-900 mb-2">{idea.idea_title}</h3>
                            {idea.idea_description && (
                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{idea.idea_description}</p>
                            )}

                            {idea.tags && idea.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-3">
                                    {idea.tags.map((tag, idx) => (
                                        <span key={idx} className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {idea.inspiration_url && (
                                <a
                                    href={idea.inspiration_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:underline block mb-3 truncate"
                                >
                                    🔗 Ver inspiración
                                </a>
                            )}

                            <div className="flex gap-2 mt-4 pt-3 border-t border-gray-200">
                                <button
                                    onClick={() => handleConvert(idea)}
                                    className="flex-1 px-3 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:scale-105"
                                    style={{ backgroundColor: '#4B50D0' }}
                                >
                                    ✨ Convertir a Contenido
                                </button>
                                <button
                                    onClick={() => handleDeleteIdea(idea.id)}
                                    className="px-3 py-2 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 transition-all"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
