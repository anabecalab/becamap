import { useState, useRef } from 'react'
import { supabase } from '../../lib/supabase'

export default function FileUpload({
    bucketName = 'becacontent-freebies',
    onUploadComplete,
    accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png,.webp',
    maxSizeMB = 50
}) {
    const [uploading, setUploading] = useState(false)
    const [dragActive, setDragActive] = useState(false)
    const fileInputRef = useRef(null)

    const handleDrag = (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true)
        } else if (e.type === 'dragleave') {
            setDragActive(false)
        }
    }

    const handleDrop = async (e) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            await uploadFile(e.dataTransfer.files[0])
        }
    }

    const handleChange = async (e) => {
        e.preventDefault()
        if (e.target.files && e.target.files[0]) {
            await uploadFile(e.target.files[0])
        }
    }

    const uploadFile = async (file) => {
        try {
            setUploading(true)

            // Validate file size
            const fileSizeMB = file.size / 1024 / 1024
            if (fileSizeMB > maxSizeMB) {
                alert(`❌ El archivo es muy grande. Máximo ${maxSizeMB}MB`)
                return
            }

            // Create unique filename
            const fileExt = file.name.split('.').pop()
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
            const filePath = fileName

            // Upload to Supabase Storage
            const { data, error } = await supabase.storage
                .from(bucketName)
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                })

            if (error) throw error

            // Get public URL
            const { data: urlData } = supabase.storage
                .from(bucketName)
                .getPublicUrl(filePath)

            const publicUrl = urlData.publicUrl

            // Call success callback with URL and original filename
            if (onUploadComplete) {
                onUploadComplete({
                    url: publicUrl,
                    fileName: file.name,
                    filePath: filePath
                })
            }

            alert('✅ Archivo subido exitosamente!')
        } catch (error) {
            console.error('Error uploading file:', error)
            alert('❌ Error al subir archivo: ' + error.message)
        } finally {
            setUploading(false)
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    return (
        <div
            className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all ${dragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                } ${uploading ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
        >
            <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                onChange={handleChange}
                className="hidden"
            />

            {uploading ? (
                <div className="space-y-2">
                    <svg className="w-12 h-12 mx-auto text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-sm text-gray-600">Subiendo archivo...</p>
                </div>
            ) : (
                <div className="space-y-2">
                    <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <div>
                        <p className="text-sm font-medium text-gray-700">
                            <span className="text-blue-600 hover:text-blue-500">Haz clic para seleccionar</span> o arrastra un archivo aquí
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            PDF, Word, Imágenes • Máximo {maxSizeMB}MB
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}
