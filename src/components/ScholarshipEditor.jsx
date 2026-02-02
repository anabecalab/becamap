import { useState } from 'react'

export default function ScholarshipEditor({ scholarship, onClose, onSave }) {
    const [formData, setFormData] = useState({ ...scholarship })

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleCheckboxChange = (field, checked) => {
        setFormData(prev => ({ ...prev, [field]: checked }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        onSave(formData)
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                    <h2 className="text-xl font-bold text-gray-900">Edit Scholarship: {scholarship.id}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Basic Information */}
                        <div className="col-span-2">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">📋 Basic Information</h3>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ID (Código)</label>
                            <input
                                type="text"
                                value={formData.id}
                                disabled
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Country (País) *</label>
                            <input
                                type="text"
                                value={formData.pais || ''}
                                onChange={(e) => handleChange('pais', e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Region (Región)</label>
                            <input
                                type="text"
                                value={formData.region || ''}
                                onChange={(e) => handleChange('region', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Scholarship Name (Beca) *</label>
                            <input
                                type="text"
                                value={formData.beca_nombre || ''}
                                onChange={(e) => handleChange('beca_nombre', e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">University (Universidad)</label>
                            <input
                                type="text"
                                value={formData.universidad || ''}
                                onChange={(e) => handleChange('universidad', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Academic Information */}
                        <div className="col-span-2">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2 mt-4">🎓 Academic Information</h3>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Level (Nivel) *</label>
                            <select
                                value={formData.nivel || ''}
                                onChange={(e) => handleChange('nivel', e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select Level</option>
                                <option value="Pregrado">Pregrado</option>
                                <option value="Maestría">Maestría</option>
                                <option value="Doctorado">Doctorado</option>
                                <option value="Posgrado">Posgrado</option>
                                <option value="Posdoctorado">Posdoctorado</option>
                                <option value="Formación continua">Formación continua</option>
                                <option value="Investigación">Investigación</option>
                                <option value="Idioma">Idioma</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Modality (Modalidad)</label>
                            <select
                                value={formData.modalidad || ''}
                                onChange={(e) => handleChange('modalidad', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-500"
                            >
                                <option value="">Select Modality</option>
                                <option value="Presencial">Presencial</option>
                                <option value="Online">Online</option>
                                <option value="Híbrido">Híbrido</option>
                            </select>
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Area (Área)</label>
                            <input
                                type="text"
                                value={formData.area || ''}
                                onChange={(e) => handleChange('area', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., Ingeniería y Tecnología, Ciencias de la Salud"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Discipline (Disciplina)</label>
                            <input
                                type="text"
                                value={formData.disciplina || ''}
                                onChange={(e) => handleChange('disciplina', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Career (Carrera)</label>
                            <input
                                type="text"
                                value={formData.carrera || ''}
                                onChange={(e) => handleChange('carrera', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Exceptions (Excepciones)</label>
                            <input
                                type="text"
                                value={formData.excepciones || ''}
                                onChange={(e) => handleChange('excepciones', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Flags */}
                        <div className="col-span-2 flex gap-6">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.excelencia || false}
                                    onChange={(e) => handleCheckboxChange('excelencia', e.target.checked)}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm font-medium text-gray-700">🏆 Excellence (Excelencia)</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.mujeres || false}
                                    onChange={(e) => handleCheckboxChange('mujeres', e.target.checked)}
                                    className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
                                />
                                <span className="text-sm font-medium text-gray-700">👩‍🎓 Women Only (Mujeres)</span>
                            </label>
                        </div>

                        {/* Requirements & Details */}
                        <div className="col-span-2">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2 mt-4">📝 Requirements & Details</h3>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Language (Idioma)</label>
                            <input
                                type="text"
                                value={formData.idioma || ''}
                                onChange={(e) => handleChange('idioma', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., Inglés, Español, Francés"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cooperating (Cooperante)</label>
                            <input
                                type="text"
                                value={formData.cooperante || ''}
                                onChange={(e) => handleChange('cooperante', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., Universidad, DAAD, ARES"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Eligible Nationalities (Nacionalidad)</label>
                            <textarea
                                value={formData.nacionalidad || ''}
                                onChange={(e) => handleChange('nacionalidad', e.target.value)}
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., Argentina, Bolivia, Brasil, Chile..."
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Benefits (Beneficios)</label>
                            <textarea
                                value={formData.beneficios || ''}
                                onChange={(e) => handleChange('beneficios', e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Requirements (Requisitos)</label>
                            <textarea
                                value={formData.requisitos || ''}
                                onChange={(e) => handleChange('requisitos', e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Information (Adicional)</label>
                            <textarea
                                value={formData.adicional || ''}
                                onChange={(e) => handleChange('adicional', e.target.value)}
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Deadlines & Status */}
                        <div className="col-span-2">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2 mt-4">📅 Deadlines & Status</h3>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Next Deadline (Siguiente)</label>
                            <input
                                type="text"
                                value={formData.siguiente_deadline || ''}
                                onChange={(e) => handleChange('siguiente_deadline', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., Septiembre, 2025"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Final Deadline (Última)</label>
                            <input
                                type="text"
                                value={formData.ultima_deadline || ''}
                                onChange={(e) => handleChange('ultima_deadline', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., 31/03/2025"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status (Estado)</label>
                            <select
                                value={formData.estado || ''}
                                onChange={(e) => handleChange('estado', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select Status</option>
                                <option value="Activa">Activa</option>
                                <option value="Cerrada">Cerrada</option>
                                <option value="Contínua">Contínua</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Validation Status *</label>
                            <select
                                value={formData.status_validacion || 'pending'}
                                onChange={(e) => handleChange('status_validacion', e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="active">✓ Active</option>
                                <option value="broken_link">✗ Broken Link</option>
                                <option value="pending">⋯ Pending</option>
                            </select>
                        </div>

                        {/* URL */}
                        <div className="col-span-2">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2 mt-4">🔗 URL</h3>
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Scholarship URL *</label>
                            <input
                                type="url"
                                value={formData.url_origen || ''}
                                onChange={(e) => handleChange('url_origen', e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="https://..."
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
