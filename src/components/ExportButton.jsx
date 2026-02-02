import { useState } from 'react'
import { } from '../lib/supabase'
import jsPDF from 'jspdf'

export default function ExportButton({ scholarships }) {
    const [showMenu, setShowMenu] = useState(false)
    const [exporting, setExporting] = useState(false)
    const [levelFilter, setLevelFilter] = useState('all')

    // Filter scholarships by level
    const getFilteredScholarships = () => {
        if (levelFilter === 'all') return scholarships

        const levelMap = {
            'pregrado': 'Pregrado',
            'maestria': 'Maestría',
            'doctorado': 'Doctorado'
        }

        return scholarships.filter(s => s.nivel === levelMap[levelFilter])
    }

    const handleExportJSON = async () => {
        console.log('🔵 Starting JSON export...')
        try {
            setExporting(true)

            const filteredData = getFilteredScholarships()
            console.log(`📊 Exporting ${filteredData.length} of ${scholarships.length} scholarships (filter: ${levelFilter})`)

            if (!filteredData || filteredData.length === 0) {
                alert('❌ No scholarships available for this level')
                return
            }

            console.log('✅ Found', filteredData.length, 'scholarships')

            // Transform to Chrome Extension format
            const exportData = filteredData.map(s => ({
                id: s.id,
                codigo: s.codigo || s.id,
                titulo: s.beca_nombre,
                pais: s.pais,
                region: s.region,
                nivel: s.nivel,
                link: s.url_origen,
                active: s.status_validacion === 'active',
                universidad: s.universidad,
                area: s.area,
                disciplina: s.disciplina,
                carrera: s.carrera,
                excepciones: s.excepciones,
                modalidad: s.modalidad,
                idioma: s.idioma,
                cooperante: s.cooperante,
                nacionalidad: s.nacionalidad,
                beneficios: s.beneficios,
                requisitos: s.requisitos,
                siguiente_deadline: s.siguiente_deadline,
                ultima_deadline: s.ultima_deadline,
                estado: s.estado,
                adicional: s.adicional,
                excelencia: s.excelencia,
                mujeres: s.mujeres
            }))

            console.log('📦 Export data prepared:', exportData.length, 'items')

            // Create JSON blob
            const jsonString = JSON.stringify(exportData, null, 2)
            console.log('📝 JSON string length:', jsonString.length)

            const blob = new Blob([jsonString], {
                type: 'application/json;charset=utf-8'
            })

            console.log('💾 Blob created, size:', blob.size)

            // Download
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            const filename = `becas_${new Date().toISOString().split('T')[0]}.json`
            a.download = filename
            console.log('📥 Downloading as:', filename)

            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)

            console.log('✅ JSON export completed successfully')
            alert(`✅ Exported ${exportData.length} scholarships to JSON!`)
        } catch (error) {
            console.error('❌ Export error:', error)
            console.error('Error stack:', error.stack)
            alert('❌ Export failed: ' + error.message)
        } finally {
            setExporting(false)
            setShowMenu(false)
        }
    }

    const handleExportTXT = async () => {
        console.log('🔵 Starting TXT export...')
        try {
            setExporting(true)

            const filteredData = getFilteredScholarships()
            console.log(`📊 Exporting ${filteredData.length} of ${scholarships.length} scholarships (filter: ${levelFilter})`)

            if (!filteredData || filteredData.length === 0) {
                alert('❌ No scholarships available for this level')
                return
            }

            console.log('✅ Found', filteredData.length, 'scholarships for TXT export')

            // Group by region
            const regions = {}
            filteredData.forEach(s => {
                const region = s.region || 'Sin Región'
                if (!regions[region]) {
                    regions[region] = {}
                }
                const country = s.pais || 'Sin País'
                if (!regions[region][country]) {
                    regions[region][country] = []
                }
                regions[region][country].push(s)
            })

            console.log('📂 Grouped into', Object.keys(regions).length, 'regions')

            // Generate markdown content
            let markdown = `# BecaMap - Complete Scholarship Database\n\n`
            markdown += `**Total Scholarships**: ${scholarships.length}\n`
            markdown += `**Generated**: ${new Date().toLocaleDateString()}\n\n`
            markdown += `---\n\n`

            Object.entries(regions).forEach(([region, countries]) => {
                markdown += `## ${region}\n\n`

                Object.entries(countries).forEach(([country, scholarshipList]) => {
                    markdown += `### ${country}\n\n`

                    scholarshipList.forEach((s, index) => {
                        markdown += `#### ${index + 1}. ${s.beca_nombre || 'Sin nombre'} (${s.id})\n\n`
                        markdown += `- **Universidad**: ${s.universidad || 'N/A'}\n`
                        markdown += `- **Nivel**: ${s.nivel || 'N/A'}\n`
                        if (s.modalidad) markdown += `- **Modalidad**: ${s.modalidad}\n`
                        if (s.idioma) markdown += `- **Idioma**: ${s.idioma}\n`
                        if (s.area) markdown += `- **Área**: ${s.area}\n`
                        if (s.disciplina) markdown += `- **Disciplina**: ${s.disciplina}\n`
                        if (s.excelencia) markdown += `- **🏆 Beca de Excelencia**\n`
                        if (s.mujeres) markdown += `- **👩‍🎓 Solo Mujeres**\n`
                        if (s.nacionalidad) markdown += `- **Nacionalidades Elegibles**: ${s.nacionalidad}\n`
                        if (s.beneficios) markdown += `- **Beneficios**: ${s.beneficios}\n`
                        if (s.requisitos) markdown += `- **Requisitos**: ${s.requisitos}\n`
                        if (s.siguiente_deadline) markdown += `- **Próximo Deadline**: ${s.siguiente_deadline}\n`
                        if (s.ultima_deadline) markdown += `- **Deadline Final**: ${s.ultima_deadline}\n`
                        if (s.estado) markdown += `- **Estado**: ${s.estado}\n`
                        if (s.adicional) markdown += `- **Información Adicional**: ${s.adicional}\n`
                        markdown += `- **URL**: ${s.url_origen || 'No disponible'}\n`
                        markdown += `- **Status**: ${s.status_validacion === 'active' ? '✅ Active' : '❌ Inactive'}\n\n`
                    })
                })
            })

            console.log('📝 Markdown generated, length:', markdown.length)

            // Create TXT blob
            const blob = new Blob([markdown], {
                type: 'text/plain;charset=utf-8'
            })

            console.log('💾 Blob created, size:', blob.size)

            // Download
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            const filename = `becas_${new Date().toISOString().split('T')[0]}.txt`
            a.download = filename
            console.log('📥 Downloading as:', filename)

            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)

            console.log('✅ TXT export completed successfully')
            alert(`✅ Exported ${filteredData.length} scholarships to TXT (Markdown)!`)
        } catch (error) {
            console.error('❌ Export error:', error)
            console.error('Error stack:', error.stack)
            alert('❌ Export failed: ' + error.message)
        } finally {
            setExporting(false)
            setShowMenu(false)
        }
    }

    const handleExportPDF = async () => {
        console.log('🔵 Starting PDF export...')
        try {
            setExporting(true)

            const filteredData = getFilteredScholarships()
            console.log(`📊 Exporting ${filteredData.length} of ${scholarships.length} scholarships (filter: ${levelFilter})`)

            if (!filteredData || filteredData.length === 0) {
                alert('❌ No scholarships available for this level')
                return
            }

            console.log('✅ Found', filteredData.length, 'scholarships for PDF export')

            // Create PDF document (same as original)
            const doc = new jsPDF('p', 'mm', 'a4')
            const pageWidth = doc.internal.pageSize.getWidth()
            const pageHeight = doc.internal.pageSize.getHeight()
            const margin = 25 // Standard margins like original
            const lineHeight = 5 // Tight line height

            let yPos = margin

            // Helper function to add new page if needed
            const checkPageBreak = (height = 10) => {
                if (yPos + height > pageHeight - margin) {
                    doc.addPage()
                    yPos = margin
                    return true
                }
                return false
            }

            // Helper function to add a field (label + value)
            const addField = (label, value) => {
                if (!value) return

                checkPageBreak(lineHeight)

                // Label in bold
                doc.setFont('times', 'bold')
                doc.setFontSize(11)
                doc.text(`${label}:`, margin, yPos)

                // Value in normal
                doc.setFont('times', 'normal')
                const lines = doc.splitTextToSize(String(value), pageWidth - margin * 2)
                lines.forEach(line => {
                    checkPageBreak(lineHeight)
                    doc.text(line, margin + 30, yPos)
                    yPos += lineHeight
                })

                // Reset to label position for next field
                yPos -= lineHeight
                yPos += lineHeight
            }

            // Sort scholarships by ID (like original: AE-01, AE-03, etc.)
            const sortedScholarships = [...filteredData].sort((a, b) => {
                return a.id.localeCompare(b.id)
            })

            // Generate PDF content - exactly like original format
            sortedScholarships.forEach((s, index) => {
                // Add each field in the exact order from original PDF
                addField('CÓDIGO', s.id)
                addField('PAÍS', s.pais)
                addField('REGIÓN', s.region)
                addField('BECA', s.beca_nombre)
                addField('UNIVERSIDAD', s.universidad)
                addField('NIVEL', s.nivel)
                addField('EXCELENCIA', s.excelencia ? 'TRUE' : 'FALSE')
                addField('MUJERES', s.mujeres ? 'TRUE' : 'FALSE')
                addField('ÁREA', s.area)
                addField('DISCIPLINA', s.disciplina)
                addField('CARRERA', s.carrera)
                addField('EXCEPCIONES', s.excepciones)
                addField('MODALIDAD', s.modalidad)
                addField('IDIOMA', s.idioma)
                addField('COOPERANTE', s.cooperante)
                addField('NACIONALIDAD', s.nacionalidad)
                addField('BENEFICIOS', s.beneficios)
                addField('REQUISITOS', s.requisitos)
                addField('SIGUIENTE', s.siguiente_deadline)
                addField('ÚLTIMA', s.ultima_deadline)
                addField('ESTADO', s.estado)
                addField('ADICIONAL', s.adicional)
                addField('URL', s.url_origen)

                // Add separator line (like original: -----)
                yPos += lineHeight
                checkPageBreak(lineHeight)
                doc.setFont('times', 'normal')
                doc.text('-----', margin, yPos)
                yPos += lineHeight * 2 // Extra space before next scholarship

                // Progress logging every 50 scholarships
                if ((index + 1) % 50 === 0) {
                    console.log(`📄 Processed ${index + 1}/${sortedScholarships.length} scholarships`)
                }
            })

            // Save PDF
            const filename = `becas_${new Date().toISOString().split('T')[0]}.pdf`
            doc.save(filename)

            console.log('✅ PDF export completed successfully')
            alert(`✅ Exported ${filteredData.length} scholarships to PDF!`)
        } catch (error) {
            console.error('❌ Export error:', error)
            console.error('Error stack:', error.stack)
            alert('❌ Export failed: ' + error.message)
        } finally {
            setExporting(false)
            setShowMenu(false)
        }
    }

    return (
        <div className="relative">
            <button
                onClick={() => setShowMenu(!showMenu)}
                disabled={exporting}
                className="text-white font-medium px-6 py-2 rounded-lg shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#4B50D0' }}
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {exporting ? 'Exporting...' : 'Export Data'}
            </button>

            {showMenu && !exporting && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                        {/* Level Filter */}
                        <div className="px-4 py-3 border-b border-gray-200">
                            <label className="block text-xs font-medium text-gray-700 mb-2">
                                Filter by Level
                            </label>
                            <select
                                value={levelFilter}
                                onChange={(e) => setLevelFilter(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:border-transparent"
                                style={{ outlineColor: '#4B50D0' }}
                            >
                                <option value="all">All Levels ({scholarships.length})</option>
                                <option value="pregrado">
                                    Pregrado ({scholarships.filter(s => s.nivel === 'Pregrado').length})
                                </option>
                                <option value="maestria">
                                    Maestría ({scholarships.filter(s => s.nivel === 'Maestría').length})
                                </option>
                                <option value="doctorado">
                                    Doctorado ({scholarships.filter(s => s.nivel === 'Doctorado').length})
                                </option>
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                {levelFilter === 'all'
                                    ? `Exporting all ${scholarships.length} scholarships`
                                    : `Exporting ${getFilteredScholarships().length} scholarships`
                                }
                            </p>
                        </div>

                        {/* Export Options */}
                        <button
                            onClick={handleExportJSON}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3"
                        >
                            <span className="text-2xl">📦</span>
                            <div>
                                <div className="font-medium text-gray-900">Export as JSON</div>
                                <div className="text-xs text-gray-500">Chrome Extension format</div>
                            </div>
                        </button>

                        <button
                            onClick={handleExportTXT}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3"
                        >
                            <span className="text-2xl">📝</span>
                            <div>
                                <div className="font-medium text-gray-900">Export as TXT</div>
                                <div className="text-xs text-gray-500">Markdown format</div>
                            </div>
                        </button>

                        <button
                            onClick={handleExportPDF}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3"
                        >
                            <span className="text-2xl">📄</span>
                            <div>
                                <div className="font-medium text-gray-900">Export as PDF</div>
                                <div className="text-xs text-gray-500">Formatted document</div>
                            </div>
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}
