import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function BulkUrlUpdate({ isOpen, onClose, onSuccess }) {
    const [mode, setMode] = useState('name') // 'name', 'ids', 'url'
    const [nameSearch, setNameSearch] = useState('')
    const [idsInput, setIdsInput] = useState('')
    const [oldUrl, setOldUrl] = useState('')
    const [newUrl, setNewUrl] = useState('')
    const [matches, setMatches] = useState([])
    const [selectedIds, setSelectedIds] = useState(new Set())
    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState('search') // 'search', 'preview', 'done'
    const [result, setResult] = useState(null)

    const resetForm = () => {
        setMode('name')
        setNameSearch('')
        setIdsInput('')
        setOldUrl('')
        setNewUrl('')
        setMatches([])
        setSelectedIds(new Set())
        setStep('search')
        setResult(null)
        setLoading(false)
    }

    const handleClose = () => {
        resetForm()
        onClose()
    }

    const handleSearch = async () => {
        setLoading(true)
        try {
            let query = supabase
                .from('scholarships_master')
                .select('id, beca_nombre, url_origen, url_status, pais, universidad, nivel')

            if (mode === 'name') {
                if (!nameSearch.trim()) return alert('Escribe un nombre para buscar')
                query = query.ilike('beca_nombre', `%${nameSearch.trim()}%`)
            } else if (mode === 'ids') {
                const ids = idsInput.split(/[,\n\s]+/).map(id => id.trim()).filter(Boolean)
                if (ids.length === 0) return alert('Ingresa al menos un ID')
                query = query.in('id', ids)
            } else if (mode === 'url') {
                if (!oldUrl.trim()) return alert('Ingresa la URL antigua')
                query = query.eq('url_origen', oldUrl.trim())
            }

            const { data, error } = await query.order('id')
            if (error) throw error

            if (!data || data.length === 0) {
                alert('No se encontraron becas con ese criterio')
                return
            }

            setMatches(data)
            setSelectedIds(new Set(data.map(d => d.id)))
            setStep('preview')
        } catch (error) {
            console.error('Error searching:', error)
            alert('Error: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    const toggleId = (id) => {
        const next = new Set(selectedIds)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        setSelectedIds(next)
    }

    const toggleAll = () => {
        if (selectedIds.size === matches.length) {
            setSelectedIds(new Set())
        } else {
            setSelectedIds(new Set(matches.map(m => m.id)))
        }
    }

    const handleApply = async () => {
        if (!newUrl.trim()) return alert('Ingresa la nueva URL')
        if (selectedIds.size === 0) return alert('Selecciona al menos una beca')

        setLoading(true)
        try {
            const idsArray = Array.from(selectedIds)

            const { error: updateError } = await supabase
                .from('scholarships_master')
                .update({
                    url_origen: newUrl.trim(),
                    url_status: 'working',
                    url_last_checked: new Date().toISOString()
                })
                .in('id', idsArray)

            if (updateError) throw updateError

            // Log changes
            const logEntries = matches
                .filter(m => selectedIds.has(m.id))
                .map(m => ({
                    scholarship_id: m.id,
                    field_changed: 'url_status',
                    old_value: m.url_status || 'unknown',
                    new_value: 'working',
                    notes: `Bulk update: URL changed from ${m.url_origen} to ${newUrl.trim()}`,
                    changed_at: new Date().toISOString()
                }))

            await supabase.from('deadline_updates').insert(logEntries)

            setResult({
                count: idsArray.length,
                ids: idsArray
            })
            setStep('done')
            onSuccess?.()
        } catch (error) {
            console.error('Error updating:', error)
            alert('Error actualizando: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={handleClose}>
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200" style={{ background: 'linear-gradient(135deg, #312C8E 0%, #4B50D0 100%)' }}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                🔗 Actualizar URLs en masa
                            </h2>
                            <p className="text-sm text-white/70 mt-1">
                                Cambia el link de varias becas similares a la vez
                            </p>
                        </div>
                        <button onClick={handleClose} className="text-white/70 hover:text-white text-2xl leading-none">×</button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {step === 'search' && (
                        <div className="space-y-5">
                            {/* Mode selector */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Buscar becas por:</label>
                                <div className="flex gap-2">
                                    {[
                                        { key: 'name', label: '📝 Nombre', desc: 'Ej: Amsterdam Merit' },
                                        { key: 'ids', label: '🔢 IDs', desc: 'Ej: NL-01, NL-02' },
                                        { key: 'url', label: '🔗 URL antigua', desc: 'Misma URL rota' }
                                    ].map(m => (
                                        <button
                                            key={m.key}
                                            onClick={() => setMode(m.key)}
                                            className={`flex-1 p-3 rounded-lg border-2 transition-all text-sm font-medium ${mode === m.key
                                                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                                }`}
                                        >
                                            <div>{m.label}</div>
                                            <div className="text-xs opacity-60 mt-1">{m.desc}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Search input */}
                            <div>
                                {mode === 'name' && (
                                    <>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la beca (parcial)</label>
                                        <input
                                            type="text"
                                            value={nameSearch}
                                            onChange={e => setNameSearch(e.target.value)}
                                            placeholder="Ej: Amsterdam Merit Scholarship"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            onKeyDown={e => e.key === 'Enter' && handleSearch()}
                                        />
                                    </>
                                )}
                                {mode === 'ids' && (
                                    <>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">IDs (separados por coma o salto de línea)</label>
                                        <textarea
                                            value={idsInput}
                                            onChange={e => setIdsInput(e.target.value)}
                                            placeholder="NL-01, NL-02, NL-03&#10;o uno por línea"
                                            rows={3}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        />
                                    </>
                                )}
                                {mode === 'url' && (
                                    <>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">URL antigua (exacta)</label>
                                        <input
                                            type="url"
                                            value={oldUrl}
                                            onChange={e => setOldUrl(e.target.value)}
                                            placeholder="https://old-broken-url.com/..."
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            onKeyDown={e => e.key === 'Enter' && handleSearch()}
                                        />
                                    </>
                                )}
                            </div>

                            <button
                                onClick={handleSearch}
                                disabled={loading}
                                className="w-full py-3 rounded-lg font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                                style={{ background: 'linear-gradient(135deg, #312C8E 0%, #4B50D0 100%)' }}
                            >
                                {loading ? '⏳ Buscando...' : '🔍 Buscar becas'}
                            </button>
                        </div>
                    )}

                    {step === 'preview' && (
                        <div className="space-y-5">
                            {/* Match results */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-gray-800">
                                        📋 {matches.length} beca{matches.length !== 1 ? 's' : ''} encontrada{matches.length !== 1 ? 's' : ''}
                                    </h3>
                                    <button
                                        onClick={toggleAll}
                                        className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                                    >
                                        {selectedIds.size === matches.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
                                    </button>
                                </div>

                                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
                                    {matches.map(m => (
                                        <label
                                            key={m.id}
                                            className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${selectedIds.has(m.id) ? 'bg-indigo-50/50' : ''
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.has(m.id)}
                                                onChange={() => toggleId(m.id)}
                                                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-600">{m.id}</span>
                                                    <span className="text-sm font-medium text-gray-800 truncate">{m.beca_nombre}</span>
                                                </div>
                                                <div className="text-xs text-gray-500 mt-0.5 truncate">
                                                    {m.pais} · {m.universidad || 'Sin universidad'} · {m.url_origen ? m.url_origen.substring(0, 50) + '...' : 'Sin URL'}
                                                </div>
                                            </div>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${m.url_status === 'working' ? 'bg-green-100 text-green-700' :
                                                    m.url_status === 'broken' ? 'bg-red-100 text-red-700' :
                                                        'bg-gray-100 text-gray-600'
                                                }`}>
                                                {m.url_status || '?'}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    ✅ {selectedIds.size} seleccionada{selectedIds.size !== 1 ? 's' : ''} de {matches.length}
                                </p>
                            </div>

                            {/* New URL */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Nueva URL para todas</label>
                                <input
                                    type="url"
                                    value={newUrl}
                                    onChange={e => setNewUrl(e.target.value)}
                                    placeholder="https://www.university.edu/scholarships/..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Este link reemplazará la URL de todas las becas seleccionadas
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => { setStep('search'); setMatches([]); setSelectedIds(new Set()) }}
                                    className="flex-1 py-3 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all"
                                >
                                    ← Volver a buscar
                                </button>
                                <button
                                    onClick={handleApply}
                                    disabled={loading || !newUrl.trim() || selectedIds.size === 0}
                                    className="flex-1 py-3 rounded-lg font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                                    style={{ background: 'linear-gradient(135deg, #312C8E 0%, #4B50D0 100%)' }}
                                >
                                    {loading ? '⏳ Actualizando...' : `🔄 Actualizar ${selectedIds.size} beca${selectedIds.size !== 1 ? 's' : ''}`}
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'done' && result && (
                        <div className="text-center py-8 space-y-4">
                            <div className="text-6xl">✅</div>
                            <h3 className="text-xl font-bold text-gray-800">
                                ¡{result.count} beca{result.count !== 1 ? 's' : ''} actualizada{result.count !== 1 ? 's' : ''}!
                            </h3>
                            <p className="text-gray-600">
                                IDs actualizados: <span className="font-mono text-sm">{result.ids.join(', ')}</span>
                            </p>
                            <p className="text-sm text-gray-500">
                                Todas las URLs fueron cambiadas y marcadas como "working"
                            </p>
                            <div className="flex gap-3 justify-center mt-6">
                                <button
                                    onClick={resetForm}
                                    className="px-6 py-2 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-50"
                                >
                                    Hacer otra actualización
                                </button>
                                <button
                                    onClick={handleClose}
                                    className="px-6 py-2 rounded-lg font-semibold text-white"
                                    style={{ background: 'linear-gradient(135deg, #312C8E 0%, #4B50D0 100%)' }}
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
