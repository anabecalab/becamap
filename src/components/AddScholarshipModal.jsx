import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function AddScholarshipModal({ isOpen, onClose, onSuccess }) {
    const [loading, setLoading] = useState(false)
    const [generatingId, setGeneratingId] = useState(false)
    const [scholarship, setScholarship] = useState({
        pais: '',
        region: '',
        beca_nombre: '',
        universidad: '',
        nivel: '',
        excelencia: false,
        mujeres: false,
        area: '',
        disciplina: '',
        carrera: '',
        excepciones: '',
        modalidad: '',
        idioma: '',
        cooperante: '',
        nacionalidad: '',
        beneficios: '',
        requisitos: '',
        siguiente_deadline: '',
        ultima_deadline: '',
        estado: 'Por confirmar',
        adicional: '',
        url_origen: '',
        status_validacion: 'pending'
    })
    const [generatedId, setGeneratedId] = useState('')
    const [error, setError] = useState('')

    // Country options with codes
    const countries = [
        { code: 'AR', name: 'Argentina' },
        { code: 'AU', name: 'Australia' },
        { code: 'AT', name: 'Austria' },
        { code: 'BE', name: 'Belgium' },
        { code: 'BR', name: 'Brazil' },
        { code: 'CA', name: 'Canada' },
        { code: 'CL', name: 'Chile' },
        { code: 'CN', name: 'China' },
        { code: 'CO', name: 'Colombia' },
        { code: 'CR', name: 'Costa Rica' },
        { code: 'CZ', name: 'Czech Republic' },
        { code: 'DK', name: 'Denmark' },
        { code: 'EC', name: 'Ecuador' },
        { code: 'EG', name: 'Egypt' },
        { code: 'FI', name: 'Finland' },
        { code: 'FR', name: 'France' },
        { code: 'DE', name: 'Germany' },
        { code: 'GR', name: 'Greece' },
        { code: 'HK', name: 'Hong Kong' },
        { code: 'HU', name: 'Hungary' },
        { code: 'IN', name: 'India' },
        { code: 'ID', name: 'Indonesia' },
        { code: 'IE', name: 'Ireland' },
        { code: 'IL', name: 'Israel' },
        { code: 'IT', name: 'Italy' },
        { code: 'JP', name: 'Japan' },
        { code: 'KR', name: 'South Korea' },
        { code: 'MX', name: 'Mexico' },
        { code: 'NL', name: 'Netherlands' },
        { code: 'NZ', name: 'New Zealand' },
        { code: 'NO', name: 'Norway' },
        { code: 'PE', name: 'Peru' },
        { code: 'PL', name: 'Poland' },
        { code: 'PT', name: 'Portugal' },
        { code: 'RU', name: 'Russia' },
        { code: 'SA', name: 'Saudi Arabia' },
        { code: 'SG', name: 'Singapore' },
        { code: 'ZA', name: 'South Africa' },
        { code: 'ES', name: 'Spain' },
        { code: 'SE', name: 'Sweden' },
        { code: 'CH', name: 'Switzerland' },
        { code: 'TW', name: 'Taiwan' },
        { code: 'TH', name: 'Thailand' },
        { code: 'TR', name: 'Turkey' },
        { code: 'AE', name: 'United Arab Emirates' },
        { code: 'UK', name: 'United Kingdom' },
        { code: 'US', name: 'United States' }
    ]

    const levels = ['Pregrado', 'Maestría', 'Doctorado', 'Posdoctorado', 'Investigación', 'Curso corto']
    const states = ['Abierto', 'Cerrado', 'Por abrir', 'Por confirmar', 'Permanente']

    // Generate ID when country changes
    useEffect(() => {
        if (scholarship.pais) {
            generateScholarshipId()
        }
    }, [scholarship.pais])

    const generateScholarshipId = async () => {
        setGeneratingId(true)
        try {
            const countryCode = countries.find(c => c.name === scholarship.pais)?.code
            if (!countryCode) return

            // Get max number for this country
            const { data, error } = await supabase
                .from('scholarships_master')
                .select('id')
                .like('id', `${countryCode}-%`)
                .order('id', { ascending: false })
                .limit(1)

            if (error) throw error

            let nextNumber = 1
            if (data && data.length > 0) {
                const lastId = data[0].id
                const lastNumber = parseInt(lastId.split('-')[1])
                nextNumber = lastNumber + 1
            }

            const newId = `${countryCode}-${String(nextNumber).padStart(2, '0')}`
            setGeneratedId(newId)
        } catch (err) {
            console.error('Error generating ID:', err)
            setError('Error generando ID de beca')
        } finally {
            setGeneratingId(false)
        }
    }

    const handleChange = (field, value) => {
        setScholarship(prev => ({ ...prev, [field]: value }))
        setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        // Validation
        if (!scholarship.pais || !scholarship.beca_nombre || !scholarship.nivel || !scholarship.url_origen) {
            setError('Por favor completa todos los campos obligatorios')
            return
        }

        if (!generatedId) {
            setError('Error generando ID. Por favor intenta de nuevo.')
            return
        }

        setLoading(true)

        try {
            const scholarshipData = {
                id: generatedId,
                ...scholarship,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }

            const { error: insertError } = await supabase
                .from('scholarships_master')
                .insert([scholarshipData])

            if (insertError) throw insertError

            console.log('✅ Scholarship added successfully:', generatedId)
            onSuccess()
            handleClose()
        } catch (err) {
            console.error('Error adding scholarship:', err)
            setError('Error al agregar la beca: ' + err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        setScholarship({
            pais: '',
            region: '',
            beca_nombre: '',
            universidad: '',
            nivel: '',
            excelencia: false,
            mujeres: false,
            area: '',
            disciplina: '',
            carrera: '',
            excepciones: '',
            modalidad: '',
            idioma: '',
            cooperante: '',
            nacionalidad: '',
            beneficios: '',
            requisitos: '',
            siguiente_deadline: '',
            ultima_deadline: '',
            estado: 'Por confirmar',
            adicional: '',
            url_origen: '',
            status_validacion: 'pending'
        })
        setGeneratedId('')
        setError('')
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200" style={{ backgroundColor: '#312C8E' }}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-white">Agregar Nueva Beca</h2>
                            {generatedId && (
                                <p className="text-sm mt-1" style={{ color: '#D5ED86' }}>
                                    ID generado: <span className="font-mono font-bold">{generatedId}</span>
                                </p>
                            )}
                        </div>
                        <button
                            onClick={handleClose}
                            className="text-white hover:text-gray-200 text-2xl"
                        >
                            ×
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-6 py-6 max-h-[70vh] overflow-y-auto">
                    {error && (
                        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* País * */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                País <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={scholarship.pais}
                                onChange={(e) => handleChange('pais', e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                                <option value="">Seleccionar país...</option>
                                {countries.map(country => (
                                    <option key={country.code} value={country.name}>
                                        {country.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Región */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Región
                            </label>
                            <input
                                type="text"
                                value={scholarship.region}
                                onChange={(e) => handleChange('region', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Ej: América Latina, Europa, etc."
                            />
                        </div>

                        {/* Nombre de la Beca * */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nombre de la Beca <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={scholarship.beca_nombre}
                                onChange={(e) => handleChange('beca_nombre', e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Nombre completo de la beca"
                            />
                        </div>

                        {/* Universidad */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Universidad / Institución
                            </label>
                            <input
                                type="text"
                                value={scholarship.universidad}
                                onChange={(e) => handleChange('universidad', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Universidad o institución que ofrece la beca"
                            />
                        </div>

                        {/* Nivel * */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nivel <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={scholarship.nivel}
                                onChange={(e) => handleChange('nivel', e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                                <option value="">Seleccionar nivel...</option>
                                {levels.map(level => (
                                    <option key={level} value={level}>{level}</option>
                                ))}
                            </select>
                        </div>

                        {/* Estado */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Estado
                            </label>
                            <select
                                value={scholarship.estado}
                                onChange={(e) => handleChange('estado', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                                {states.map(state => (
                                    <option key={state} value={state}>{state}</option>
                                ))}
                            </select>
                        </div>

                        {/* Checkboxes */}
                        <div className="flex items-center space-x-6">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={scholarship.excelencia}
                                    onChange={(e) => handleChange('excelencia', e.target.checked)}
                                    className="mr-2 h-4 w-4"
                                    style={{ accentColor: '#4B50D0' }}
                                />
                                <span className="text-sm text-gray-700">Beca de Excelencia</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={scholarship.mujeres}
                                    onChange={(e) => handleChange('mujeres', e.target.checked)}
                                    className="mr-2 h-4 w-4"
                                    style={{ accentColor: '#4B50D0' }}
                                />
                                <span className="text-sm text-gray-700">Solo Mujeres</span>
                            </label>
                        </div>

                        {/* Área */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Área
                            </label>
                            <input
                                type="text"
                                value={scholarship.area}
                                onChange={(e) => handleChange('area', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Ej: Ciencias, Ingeniería, Artes, etc."
                            />
                        </div>

                        {/* Modalidad */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Modalidad
                            </label>
                            <input
                                type="text"
                                value={scholarship.modalidad}
                                onChange={(e) => handleChange('modalidad', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Presencial, Virtual, Híbrida"
                            />
                        </div>

                        {/* Idioma */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Idioma
                            </label>
                            <input
                                type="text"
                                value={scholarship.idioma}
                                onChange={(e) => handleChange('idioma', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Español, Inglés, etc."
                            />
                        </div>

                        {/* Nacionalidad */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nacionalidad Requerida
                            </label>
                            <input
                                type="text"
                                value={scholarship.nacionalidad}
                                onChange={(e) => handleChange('nacionalidad', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Cualquier país, LATAM, etc."
                            />
                        </div>

                        {/* Deadlines */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Próximo Deadline
                            </label>
                            <input
                                type="text"
                                value={scholarship.siguiente_deadline}
                                onChange={(e) => handleChange('siguiente_deadline', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Ej: Marzo 2025"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Último Deadline
                            </label>
                            <input
                                type="text"
                                value={scholarship.ultima_deadline}
                                onChange={(e) => handleChange('ultima_deadline', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Ej: 15-03-2025"
                            />
                        </div>

                        {/* URL Origen * */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                URL Oficial <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="url"
                                value={scholarship.url_origen}
                                onChange={(e) => handleChange('url_origen', e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="https://..."
                            />
                        </div>

                        {/* Beneficios */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Beneficios
                            </label>
                            <textarea
                                value={scholarship.beneficios}
                                onChange={(e) => handleChange('beneficios', e.target.value)}
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Qué incluye la beca (matrícula, manutención, etc.)"
                            />
                        </div>

                        {/* Requisitos */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Requisitos
                            </label>
                            <textarea
                                value={scholarship.requisitos}
                                onChange={(e) => handleChange('requisitos', e.target.value)}
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Requisitos principales para aplicar"
                            />
                        </div>

                        {/* Información Adicional */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Información Adicional
                            </label>
                            <textarea
                                value={scholarship.adicional}
                                onChange={(e) => handleChange('adicional', e.target.value)}
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Cualquier otra información relevante"
                            />
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || generatingId || !generatedId}
                        className="px-6 py-2 rounded-lg font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ backgroundColor: '#4B50D0' }}
                    >
                        {loading ? 'Guardando...' : generatingId ? 'Generando ID...' : 'Agregar Beca'}
                    </button>
                </div>
            </div>
        </div>
    )
}
