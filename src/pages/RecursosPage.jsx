import { useState } from 'react'
import FileUpload from '../components/FileUpload'

export default function RecursosPage() {
    const [showUploadSection, setShowUploadSection] = useState(null) // 'guias', 'infografias', 'imagenes', or null

    const guides = [
        {
            title: 'Guía Carta de Motivación BL+',
            type: 'PDF',
            url: '/guias/Guía Carta de Motivación BL+.pdf'
        },
        {
            title: 'Guía para Entrevista BL+',
            type: 'PDF',
            url: '/guias/Guía para Entrevista BL+.pdf'
        },
        {
            title: 'Guía Entrevista STEM BL+',
            type: 'PDF',
            url: '/guias/Guía Entrevista STEM BL+.pdf'
        },
        {
            title: 'Guía para CV Europass BL+',
            type: 'PDF',
            url: '/guias/Guía para CV Europass BL+ (1).pdf'
        },
        {
            title: 'Guía Carta de Recomendación BL+',
            type: 'PDF',
            url: '/guias/Guía Carta de Recomendación BL+.pdf'
        }
    ]

    const handleUploadComplete = (type) => (data) => {
        alert(`✅ ${type} subido exitosamente!\nURL: ${data.url}`)
        setShowUploadSection(null)
        // Aquí podrías agregar el recurso a una base de datos o actualizar el estado
    }

    return (
        <div className="flex-1 overflow-auto">
            {/* Header */}
            <header className="shadow-sm border-b border-gray-200" style={{ backgroundColor: '#312C8E' }}>
                <div className="px-6 py-6">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Recursos</h1>
                        <p className="mt-1 text-sm" style={{ color: '#D5ED86' }}>
                            Biblioteca de guías, infografías e imágenes para BecaLab
                        </p>
                    </div>
                </div>
            </header>

            <div className="p-6 space-y-8">
                {/* Guías BecaLab */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold" style={{ color: '#312C8E' }}>📚 Guías BecaLab</h2>
                        <button
                            onClick={() => setShowUploadSection(showUploadSection === 'guias' ? null : 'guias')}
                            className="px-4 py-2 rounded-lg font-semibold text-white transition-all hover:scale-105"
                            style={{ backgroundColor: '#4B50D0' }}
                        >
                            {showUploadSection === 'guias' ? '✖ Cancelar' : '📤 Subir Guía'}
                        </button>
                    </div>

                    {/* Upload Section for Guías */}
                    {showUploadSection === 'guias' && (
                        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-4">
                            <h3 className="text-lg font-bold mb-3" style={{ color: '#312C8E' }}>
                                📤 Subir Nueva Guía
                            </h3>
                            <FileUpload
                                bucketName="recursos-guias"
                                accept=".pdf,.doc,.docx"
                                maxSizeMB={50}
                                onUploadComplete={handleUploadComplete('Guía')}
                            />
                            <p className="text-sm text-gray-600 mt-4">
                                💡 Formatos aceptados: PDF, Word (DOC, DOCX)
                            </p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {guides.map((guide, idx) => (
                            <a
                                key={idx}
                                href={guide.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all group cursor-pointer"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#D5ED86' }}>
                                        <span className="font-bold" style={{ color: '#312C8E' }}>PDF</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900 group-hover:text-becalab-blue transition-colors">
                                            {guide.title}
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-1">{guide.type}</p>
                                    </div>
                                    <svg className="w-5 h-5 text-gray-400 group-hover:text-becalab-blue transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </a>
                        ))}
                    </div>
                </section>

                {/* Infografías */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold" style={{ color: '#312C8E' }}>📊 Infografías</h2>
                        <button
                            onClick={() => setShowUploadSection(showUploadSection === 'infografias' ? null : 'infografias')}
                            className="px-4 py-2 rounded-lg font-semibold text-white transition-all hover:scale-105"
                            style={{ backgroundColor: '#4B50D0' }}
                        >
                            {showUploadSection === 'infografias' ? '✖ Cancelar' : '📤 Subir Infografía'}
                        </button>
                    </div>

                    {/* Upload Section for Infografías */}
                    {showUploadSection === 'infografias' && (
                        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-4">
                            <h3 className="text-lg font-bold mb-3" style={{ color: '#312C8E' }}>
                                📤 Subir Nueva Infografía
                            </h3>
                            <FileUpload
                                bucketName="recursos-infografias"
                                accept=".png,.jpg,.jpeg,.webp,.svg"
                                maxSizeMB={20}
                                onUploadComplete={handleUploadComplete('Infografía')}
                            />
                            <p className="text-sm text-gray-600 mt-4">
                                💡 Formatos aceptados: PNG, JPG, WEBP, SVG
                            </p>
                        </div>
                    )}

                    <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
                        <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#D5ED86' }}>
                            <span className="text-2xl">📊</span>
                        </div>
                        <p className="text-gray-500">No hay infografías disponibles</p>
                        <p className="text-sm text-gray-400 mt-2">Usa el botón de arriba para subir la primera infografía</p>
                    </div>
                </section>

                {/* Imágenes y Logos */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold" style={{ color: '#312C8E' }}>🖼️ Imágenes y Logos</h2>
                        <button
                            onClick={() => setShowUploadSection(showUploadSection === 'imagenes' ? null : 'imagenes')}
                            className="px-4 py-2 rounded-lg font-semibold text-white transition-all hover:scale-105"
                            style={{ backgroundColor: '#4B50D0' }}
                        >
                            {showUploadSection === 'imagenes' ? '✖ Cancelar' : '📤 Subir Imagen'}
                        </button>
                    </div>

                    {/* Upload Section for Imágenes y Logos */}
                    {showUploadSection === 'imagenes' && (
                        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-4">
                            <h3 className="text-lg font-bold mb-3" style={{ color: '#312C8E' }}>
                                📤 Subir Nueva Imagen o Logo
                            </h3>
                            <FileUpload
                                bucketName="recursos-imagenes"
                                accept=".png,.jpg,.jpeg,.webp,.svg"
                                maxSizeMB={10}
                                onUploadComplete={handleUploadComplete('Imagen')}
                            />
                            <p className="text-sm text-gray-600 mt-4">
                                💡 Formatos aceptados: PNG, JPG, WEBP, SVG
                            </p>
                        </div>
                    )}

                    <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
                        <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#D5ED86' }}>
                            <span className="text-2xl">🖼️</span>
                        </div>
                        <p className="text-gray-500">No hay imágenes disponibles</p>
                        <p className="text-sm text-gray-400 mt-2">Usa el botón de arriba para subir la primera imagen</p>
                    </div>
                </section>
            </div>
        </div>
    )
}
