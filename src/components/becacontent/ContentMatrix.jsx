import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import * as XLSX from 'xlsx'

export default function ContentMatrix({ onEditClick }) {
    const [content, setContent] = useState([])
    const [filteredContent, setFilteredContent] = useState([])
    const [loading, setLoading] = useState(true)
    const [deletingId, setDeletingId] = useState(null)
    const [confirmDeleteId, setConfirmDeleteId] = useState(null)
    const [cuentaFilter, setCuentaFilter] = useState('all')
    const [estadoFilter, setEstadoFilter] = useState('all')
    const [pilarFilter, setPilarFilter] = useState('all')
    const [tipoFilter, setTipoFilter] = useState('all')
    const [formatoFilter, setFormatoFilter] = useState('all')
    const [becaSearch, setBecaSearch] = useState('')
    const [entregaFilter, setEntregaFilter] = useState('')
    const [publicacionFilter, setPublicacionFilter] = useState('')
    const [showImportHelp, setShowImportHelp] = useState(false)

    useEffect(() => {
        fetchContent()
    }, [])

    useEffect(() => {
        let filtered = content

        if (cuentaFilter !== 'all') {
            filtered = filtered.filter(c => c.brand === cuentaFilter)
        }
        if (estadoFilter !== 'all') {
            filtered = filtered.filter(c => c.content_status === estadoFilter)
        }
        if (pilarFilter !== 'all') {
            filtered = filtered.filter(c => c.pilar === pilarFilter)
        }
        if (tipoFilter !== 'all') {
            filtered = filtered.filter(c => c.tipo_contenido === tipoFilter)
        }
        if (formatoFilter !== 'all') {
            filtered = filtered.filter(c => c.format === formatoFilter)
        }
        if (becaSearch.trim()) {
            const term = becaSearch.toLowerCase()
            filtered = filtered.filter(c =>
                (c.beca_oportunidad || '').toLowerCase().includes(term) ||
                (c.hook_text || '').toLowerCase().includes(term)
            )
        }
        if (entregaFilter) {
            filtered = filtered.filter(c => c.fecha_entrega && c.fecha_entrega >= entregaFilter)
        }
        if (publicacionFilter) {
            filtered = filtered.filter(c => c.fecha_publicacion && c.fecha_publicacion >= publicacionFilter)
        }

        setFilteredContent(filtered)
    }, [cuentaFilter, estadoFilter, pilarFilter, tipoFilter, formatoFilter, becaSearch, entregaFilter, publicacionFilter, content])

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

    const importFromExcel = async (event) => {
        const file = event.target.files[0]
        if (!file) return

        try {
            const reader = new FileReader()
            reader.onload = async (e) => {
                try {
                    const data = new Uint8Array(e.target.result)
                    const workbook = XLSX.read(data, { type: 'array' })
                    const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
                    const jsonData = XLSX.utils.sheet_to_json(firstSheet)

                    if (jsonData.length === 0) {
                        alert('❌ El archivo Excel está vacío')
                        return
                    }

                    const recordsToInsert = jsonData.map(row => ({
                        brand: row['Cuenta'] || '@beca_lab',
                        content_status: row['Estado'] || 'Pendiente aprob.',
                        format: row['Formato'] || 'Reel',
                        beca_oportunidad: row['Beca/Oportunidad'] || '',
                        descripcion_beca: row['Descripción'] || '',
                        tipo_contenido: row['Tipo'] || 'Post',
                        pilar: row['Pilar'] || 'Descubrimiento',
                        enfoque: row['Enfoque'] || 'Educativo',
                        servicio_producto: row['Servicio/Producto'] || '',
                        hook_text: row['Gancho'] || '',
                        caption_ai: row['Caption'] || '',
                        manychat_keyword: row['Keyword ManyChat'] || '',
                        micro_app_url: row['Micro App URL'] || '',
                        fecha_entrega: row['Fecha Entrega'] || null,
                        fecha_publicacion: row['Fecha Publicación'] || null,
                        comentarios_extra: row['Comentarios'] || '',
                        correction_comments: row['Correcciones'] || '',
                        priority: row['Prioridad'] || 2,
                    }))

                    const { data: insertedData, error } = await supabase
                        .from('becacontent_matrix')
                        .insert(recordsToInsert)
                        .select()

                    if (error) throw error

                    alert(`✅ ${insertedData.length} piezas importadas exitosamente!`)
                    await fetchContent()
                } catch (error) {
                    console.error('Error parsing Excel:', error)
                    alert('❌ Error al procesar el archivo: ' + error.message)
                }
            }
            reader.readAsArrayBuffer(file)
        } catch (error) {
            console.error('Error importing Excel:', error)
            alert('❌ Error al importar: ' + error.message)
        }

        event.target.value = ''
    }

    const exportToExcel = () => {
        const excelData = filteredContent.map(item => ({
            'Cuenta': item.brand,
            'Beca/Oportunidad': item.beca_oportunidad || '',
            'Tipo': item.tipo_contenido || '',
            'Formato': item.format || '',
            'Estado': item.content_status,
            'Pilar': item.pilar || '',
            'Enfoque': item.enfoque || '',
            'Servicio/Producto': item.servicio_producto || '',
            'Gancho': item.hook_text || '',
            'Caption': item.caption_ai || '',
            'Keyword ManyChat': item.manychat_keyword || '',
            'Micro App URL': item.micro_app_url || '',
            'Fecha Entrega': item.fecha_entrega ? new Date(item.fecha_entrega).toLocaleDateString() : '',
            'Fecha Publicación': item.fecha_publicacion ? new Date(item.fecha_publicacion).toLocaleDateString() : '',
            'Descripción': item.descripcion_beca || '',
            'Comentarios': item.comentarios_extra || '',
            'Correcciones': item.correction_comments || '',
            'Fecha Creación': item.created_at ? new Date(item.created_at).toLocaleDateString() : '',
        }))

        const wb = XLSX.utils.book_new()
        const ws = XLSX.utils.json_to_sheet(excelData)

        ws['!cols'] = [
            { wch: 15 }, { wch: 30 }, { wch: 12 }, { wch: 12 },
            { wch: 12 }, { wch: 18 }, { wch: 15 }, { wch: 20 },
            { wch: 40 }, { wch: 50 }, { wch: 20 }, { wch: 30 },
            { wch: 15 }, { wch: 15 }, { wch: 40 }, { wch: 30 },
            { wch: 30 }, { wch: 15 },
        ]

        XLSX.utils.book_append_sheet(wb, ws, 'Contenido BecaLab')

        const date = new Date().toISOString().split('T')[0]
        const filename = `BecaContent_Export_${date}.xlsx`
        XLSX.writeFile(wb, filename)
    }

    const downloadTemplate = () => {
        const templateData = [{
            'Cuenta': '@beca_lab',
            'Beca/Oportunidad': 'Ejemplo: Beca Fulbright',
            'Tipo': 'Post',
            'Formato': 'Reel',
            'Estado': 'Pendiente aprob.',
            'Pilar': 'Descubrimiento',
            'Enfoque': 'Educativo',
            'Servicio/Producto': 'Contenido orgánico',
            'Gancho': '¿Sabías que...?',
            'Caption': 'El texto del post con #hashtags',
            'Keyword ManyChat': 'FULBRIGHT',
            'Micro App URL': 'https://...',
            'Fecha Entrega': '2026-03-20',
            'Fecha Publicación': '2026-03-27',
            'Descripción': 'Descripción de la beca',
            'Comentarios': '',
            'Correcciones': '',
        }]

        const wb = XLSX.utils.book_new()
        const ws = XLSX.utils.json_to_sheet(templateData)
        ws['!cols'] = [
            { wch: 15 }, { wch: 30 }, { wch: 12 }, { wch: 12 },
            { wch: 12 }, { wch: 18 }, { wch: 15 }, { wch: 20 },
            { wch: 40 }, { wch: 50 }, { wch: 20 }, { wch: 30 },
            { wch: 15 }, { wch: 15 }, { wch: 40 }, { wch: 30 },
            { wch: 30 },
        ]
        XLSX.utils.book_append_sheet(wb, ws, 'Plantilla BecaContent')
        XLSX.writeFile(wb, 'BecaContent_Plantilla.xlsx')
    }

    const getStatusStyle = (status) => {
        if (status === 'Aprobado') return { bg: 'bg-green-100', text: 'text-green-800', icon: '✅' }
        if (status === 'Corregir') return { bg: 'bg-orange-100', text: 'text-orange-800', icon: '✏️' }
        if (status === 'Pendiente aprob.') return { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '⏳' }
        if (status === 'Publicado') return { bg: 'bg-gray-100', text: 'text-gray-500', icon: '📤' }
        if (status === 'Propuesta beca') return { bg: 'bg-cyan-100', text: 'text-cyan-800', icon: '🎓' }
        return { bg: 'bg-gray-100', text: 'text-gray-800', icon: '📝' }
    }

    const getPilarStyle = (pilar) => {
        const styles = {
            'Descubrimiento': 'bg-blue-50 text-blue-700',
            'Consideración': 'bg-indigo-50 text-indigo-700',
            'Activación': 'bg-amber-50 text-amber-700',
            'Conversión': 'bg-emerald-50 text-emerald-700',
            'Fidelización': 'bg-purple-50 text-purple-700',
        }
        return styles[pilar] || 'bg-gray-50 text-gray-700'
    }

    const clearFilters = () => {
        setCuentaFilter('all')
        setEstadoFilter('all')
        setPilarFilter('all')
        setTipoFilter('all')
        setFormatoFilter('all')
        setBecaSearch('')
        setEntregaFilter('')
        setPublicacionFilter('')
    }

    const hasActiveFilters = cuentaFilter !== 'all' || estadoFilter !== 'all' || pilarFilter !== 'all' || tipoFilter !== 'all' || formatoFilter !== 'all' || becaSearch.trim() !== '' || entregaFilter !== '' || publicacionFilter !== ''

    const handleDeleteConfirm = async (item) => {
        try {
            setDeletingId(item.id)
            setConfirmDeleteId(null)
            const { error } = await supabase.from('becacontent_matrix').delete().eq('id', item.id)
            if (error) throw error
            setContent(prev => prev.filter(c => c.id !== item.id))
        } catch (error) {
            console.error('Error deleting content:', error)
            alert('❌ Error al eliminar: ' + error.message)
        } finally {
            setDeletingId(null)
        }
    }

    // Shared dropdown arrow SVG for header selects
    const dropdownArrowStyle = {
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%23ffffff99' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right',
        backgroundSize: '1.2em'
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
            {/* Unified Card: Toolbar + Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

                {/* Toolbar */}
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap" style={{ backgroundColor: '#f8f9fc' }}>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="font-semibold" style={{ color: '#312C8E' }}>{filteredContent.length}</span>
                        <span>de {content.length} piezas</span>
                        {hasActiveFilters && (
                            <button onClick={clearFilters} className="ml-2 text-xs px-2 py-1 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                                ✕ Limpiar filtros
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowImportHelp(!showImportHelp)}
                            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                            title="Instrucciones de importación"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </button>
                        <label className="px-4 py-2 rounded-lg font-medium text-sm cursor-pointer flex items-center gap-2 transition-all hover:scale-105" style={{ backgroundColor: '#D5ED86', color: '#312C8E' }}>
                            ⬆ Importar
                            <input type="file" accept=".xlsx,.xls" onChange={importFromExcel} className="hidden" />
                        </label>
                        <button
                            onClick={exportToExcel}
                            disabled={filteredContent.length === 0}
                            className="px-4 py-2 rounded-lg font-medium text-sm text-white transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            style={{ backgroundColor: '#4B50D0' }}
                        >
                            ⬇ Exportar
                        </button>
                    </div>
                </div>

                {/* Import Help Panel */}
                {showImportHelp && (
                    <div className="px-5 py-4 border-b border-gray-100 bg-blue-50/50">
                        <div className="flex items-start gap-3">
                            <span className="text-xl">📋</span>
                            <div className="flex-1">
                                <h4 className="font-semibold text-sm text-gray-900 mb-1">¿Cómo importar contenido?</h4>
                                <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
                                    <li><strong>Descarga la plantilla</strong> para tener el formato correcto con todos los campos.</li>
                                    <li>Llena la plantilla en Excel con el contenido que deseas importar.</li>
                                    <li>Haz clic en <strong>"⬆ Importar"</strong> y selecciona tu archivo.</li>
                                    <li>El formato de la plantilla es idéntico al de la exportación, por lo que también puedes exportar tu base actual y usarla como referencia.</li>
                                </ol>
                                <div className="mt-3 flex gap-2">
                                    <button onClick={downloadTemplate}
                                        className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all hover:scale-105"
                                        style={{ backgroundColor: '#D5ED86', color: '#312C8E' }}>
                                        📥 Descargar Plantilla
                                    </button>
                                    <button onClick={exportToExcel}
                                        className="px-3 py-1.5 text-xs font-semibold rounded-lg text-white transition-all hover:scale-105"
                                        style={{ backgroundColor: '#4B50D0' }}>
                                        📤 Exportar base actual
                                    </button>
                                </div>
                            </div>
                            <button onClick={() => setShowImportHelp(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>
                    </div>
                )}

                {/* Table */}
                {filteredContent.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#D5ED86' }}>
                            <span className="text-3xl">✨</span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay contenido {hasActiveFilters ? 'con estos filtros' : 'aún'}</h3>
                        <p className="text-sm text-gray-500">{hasActiveFilters ? 'Intenta cambiar o limpiar los filtros' : 'Comienza creando tu primera pieza de contenido'}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr style={{ backgroundColor: '#312C8E' }}>
                                    {/* Cuenta filter */}
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-white/90 uppercase tracking-wider">
                                        <select value={cuentaFilter} onChange={(e) => setCuentaFilter(e.target.value)}
                                            className="bg-transparent text-white/90 text-xs uppercase tracking-wider font-semibold border-none outline-none cursor-pointer appearance-none pr-4 w-full"
                                            style={dropdownArrowStyle}>
                                            <option value="all" className="text-gray-900">Cuenta ▾</option>
                                            <option value="@beca_lab" className="text-gray-900">@beca_lab</option>
                                            <option value="@ana.cosmica" className="text-gray-900">@ana.cosmica</option>
                                        </select>
                                    </th>
                                    {/* Beca search */}
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-white/90 uppercase tracking-wider">
                                        <input
                                            type="text"
                                            value={becaSearch}
                                            onChange={(e) => setBecaSearch(e.target.value)}
                                            placeholder="🔍 Beca / Oportunidad"
                                            className="bg-transparent text-white/90 text-xs uppercase tracking-wider font-semibold border-none outline-none placeholder-white/50 w-full"
                                        />
                                    </th>
                                    {/* Tipo filter */}
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-white/90 uppercase tracking-wider">
                                        <select value={tipoFilter} onChange={(e) => setTipoFilter(e.target.value)}
                                            className="bg-transparent text-white/90 text-xs uppercase tracking-wider font-semibold border-none outline-none cursor-pointer appearance-none pr-4 w-full"
                                            style={dropdownArrowStyle}>
                                            <option value="all" className="text-gray-900">Tipo ▾</option>
                                            <option value="Post" className="text-gray-900">Post</option>
                                            <option value="Historia" className="text-gray-900">Historia</option>
                                            <option value="Reel" className="text-gray-900">Reel</option>
                                            <option value="Carrusel" className="text-gray-900">Carrusel</option>
                                        </select>
                                    </th>
                                    {/* Formato filter */}
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-white/90 uppercase tracking-wider">
                                        <select value={formatoFilter} onChange={(e) => setFormatoFilter(e.target.value)}
                                            className="bg-transparent text-white/90 text-xs uppercase tracking-wider font-semibold border-none outline-none cursor-pointer appearance-none pr-4 w-full"
                                            style={dropdownArrowStyle}>
                                            <option value="all" className="text-gray-900">Formato ▾</option>
                                            <option value="Reel" className="text-gray-900">Reel</option>
                                            <option value="Carrusel" className="text-gray-900">Carrusel</option>
                                            <option value="Imagen" className="text-gray-900">Imagen</option>
                                            <option value="Story" className="text-gray-900">Story</option>
                                            <option value="Video largo" className="text-gray-900">Video largo</option>
                                        </select>
                                    </th>
                                    {/* F. Entrega filter */}
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-white/90 uppercase tracking-wider">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] opacity-70">F. Entrega desde</span>
                                            <input
                                                type="date"
                                                value={entregaFilter}
                                                onChange={(e) => setEntregaFilter(e.target.value)}
                                                onClick={(e) => e.target.showPicker?.()}
                                                className="bg-transparent text-white/90 text-xs border-none outline-none cursor-pointer w-full"
                                                style={{ colorScheme: 'dark' }}
                                            />
                                        </div>
                                    </th>
                                    {/* F. Publicación filter */}
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-white/90 uppercase tracking-wider">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] opacity-70">F. Publicación desde</span>
                                            <input
                                                type="date"
                                                value={publicacionFilter}
                                                onChange={(e) => setPublicacionFilter(e.target.value)}
                                                onClick={(e) => e.target.showPicker?.()}
                                                className="bg-transparent text-white/90 text-xs border-none outline-none cursor-pointer w-full"
                                                style={{ colorScheme: 'dark' }}
                                            />
                                        </div>
                                    </th>
                                    {/* Estado filter */}
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-white/90 uppercase tracking-wider">
                                        <select value={estadoFilter} onChange={(e) => setEstadoFilter(e.target.value)}
                                            className="bg-transparent text-white/90 text-xs uppercase tracking-wider font-semibold border-none outline-none cursor-pointer appearance-none pr-4 w-full"
                                            style={dropdownArrowStyle}>
                                            <option value="all" className="text-gray-900">Estado ▾</option>
                                            <option value="Propuesta beca" className="text-gray-900">🎓 Propuesta beca</option>
                                            <option value="Pendiente aprob." className="text-gray-900">⏳ Pendiente aprob.</option>
                                            <option value="Aprobado" className="text-gray-900">✅ Aprobado</option>
                                            <option value="Corregir" className="text-gray-900">✏️ Corregir</option>
                                            <option value="Publicado" className="text-gray-900">📤 Publicado</option>
                                        </select>
                                    </th>
                                    {/* Pilar filter */}
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-white/90 uppercase tracking-wider">
                                        <select value={pilarFilter} onChange={(e) => setPilarFilter(e.target.value)}
                                            className="bg-transparent text-white/90 text-xs uppercase tracking-wider font-semibold border-none outline-none cursor-pointer appearance-none pr-4 w-full"
                                            style={dropdownArrowStyle}>
                                            <option value="all" className="text-gray-900">Pilar ▾</option>
                                            <option value="Descubrimiento" className="text-gray-900">Descubrimiento</option>
                                            <option value="Consideración" className="text-gray-900">Consideración</option>
                                            <option value="Activación" className="text-gray-900">Activación</option>
                                            <option value="Conversión" className="text-gray-900">Conversión</option>
                                            <option value="Fidelización" className="text-gray-900">Fidelización</option>
                                        </select>
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-white/90 uppercase tracking-wider">Micro App</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-white/90 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredContent.map((item, idx) => {
                                    const statusStyle = getStatusStyle(item.content_status)
                                    return (
                                        <tr key={item.id}
                                            className={`cursor-pointer transition-all border-l-4 border-transparent hover:border-indigo-400 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'} hover:bg-indigo-50/40`}
                                            onClick={() => onEditClick?.(item)}>
                                            <td className="px-4 py-3.5 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${item.brand === '@beca_lab' ? 'bg-purple-100 text-purple-800' : 'bg-pink-100 text-pink-800'}`}>
                                                    {item.brand}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 max-w-[220px] truncate text-sm text-gray-900 font-medium">
                                                {item.beca_oportunidad || item.hook_text || '—'}
                                            </td>
                                            <td className="px-4 py-3.5 whitespace-nowrap text-sm text-gray-500">{item.tipo_contenido || '—'}</td>
                                            <td className="px-4 py-3.5 whitespace-nowrap text-sm text-gray-500">{item.format || '—'}</td>
                                            <td className="px-4 py-3.5 whitespace-nowrap text-sm text-gray-500">
                                                {item.fecha_entrega ? new Date(item.fecha_entrega).toLocaleDateString() : '—'}
                                            </td>
                                            <td className="px-4 py-3.5 whitespace-nowrap text-sm text-gray-500">
                                                {item.fecha_publicacion ? new Date(item.fecha_publicacion).toLocaleDateString() : '—'}
                                            </td>
                                            <td className="px-4 py-3.5 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
                                                    {statusStyle.icon} {item.content_status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 whitespace-nowrap">
                                                {item.pilar ? (
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPilarStyle(item.pilar)}`}>
                                                        {item.pilar}
                                                    </span>
                                                ) : '—'}
                                            </td>
                                            <td className="px-4 py-3.5 whitespace-nowrap text-center">
                                                {item.micro_app_url ? (
                                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600" title={item.micro_app_url}>
                                                        ✓
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-50 text-gray-300">—</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3.5 whitespace-nowrap text-sm" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex items-center gap-4">
                                                    <button
                                                        onClick={() => onEditClick?.(item)}
                                                        className="font-medium hover:opacity-80 flex items-center gap-1"
                                                        style={{ color: '#4B50D0' }}
                                                    >
                                                        ✏️
                                                    </button>
                                                    {confirmDeleteId === item.id ? (
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => handleDeleteConfirm(item)}
                                                                disabled={deletingId === item.id}
                                                                className="bg-red-500 text-white px-2 py-0.5 rounded-md text-xs font-semibold animate-pulse hover:bg-red-600 transition-all disabled:opacity-50"
                                                            >
                                                                {deletingId === item.id ? '⏳' : '¿Seguro?'}
                                                            </button>
                                                            <button
                                                                onClick={() => setConfirmDeleteId(null)}
                                                                className="text-gray-400 hover:text-gray-600 text-xs"
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => {
                                                                setConfirmDeleteId(item.id)
                                                                setTimeout(() => setConfirmDeleteId(prev => prev === item.id ? null : prev), 4000)
                                                            }}
                                                            disabled={deletingId === item.id}
                                                            className="text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
                                                            title="Eliminar"
                                                        >
                                                            {deletingId === item.id ? '⏳' : '🗑️'}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
