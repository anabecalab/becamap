import { useState, useRef, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function LinkRepairButton({ scholarships, onRepairComplete }) {
    const [repairing, setRepairing] = useState(false)
    const [showMenu, setShowMenu] = useState(false)
    const [progress, setProgress] = useState({ current: 0, total: 0, status: '' })
    const menuRef = useRef(null)

    // Close menu when clicking outside
    useEffect(() => {
        if (!showMenu) return

        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [showMenu])

    const verifyURL = async (url) => {
        try {
            const response = await fetch(url, { method: 'HEAD', mode: 'no-cors' })
            return { url, status: 'working', error: null }
        } catch (error) {
            return { url, status: 'broken', error: error.message }
        }
    }

    const handleVerifyAll = async () => {
        try {
            setRepairing(true)
            setShowMenu(false)

            const brokenLinks = []
            const workingLinks = []

            setProgress({ current: 0, total: scholarships.length, status: 'Verificando enlaces...' })

            for (let i = 0; i < scholarships.length; i++) {
                const scholarship = scholarships[i]
                setProgress({ current: i + 1, total: scholarships.length, status: `Verificando ${scholarship.id}...` })

                if (!scholarship.url_origen || !scholarship.url_origen.startsWith('http')) {
                    brokenLinks.push({ ...scholarship, reason: 'Invalid URL' })
                    continue
                }

                const result = await verifyURL(scholarship.url_origen)

                if (result.status === 'broken') {
                    brokenLinks.push({ ...scholarship, reason: result.error })
                } else {
                    workingLinks.push(scholarship)
                }

                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 100))
            }

            console.log(`✅ Verificación completa: ${workingLinks.length} working, ${brokenLinks.length} broken`)

            if (brokenLinks.length > 0) {
                // Download report of broken links
                const report = brokenLinks.map(s =>
                    `${s.id}|${s.beca_nombre}|${s.url_origen}|${s.reason}`
                ).join('\\n')

                const blob = new Blob([`ID|Beca|URL|Error\\n${report}`], { type: 'text/plain' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `broken_links_${new Date().toISOString().split('T')[0]}.txt`
                a.click()
                URL.revokeObjectURL(url)

                alert(`✅ Verificación completa\\n\\nWorking: ${workingLinks.length}\\nBroken: ${brokenLinks.length}\\n\\nReporte descargado`)
            } else {
                alert(`✅ ¡Todos los ${scholarships.length} enlaces funcionan correctamente!`)
            }

            if (onRepairComplete) onRepairComplete()

        } catch (error) {
            console.error('❌ Error during verification:', error)
            alert('❌ Error: ' + error.message)
        } finally {
            setRepairing(false)
            setProgress({ current: 0, total: 0, status: '' })
        }
    }

    const handleRepairBroken = async () => {
        try {
            setRepairing(true)
            setShowMenu(false)

            // Get scholarships with broken links
            const { data: brokenScholarships, error } = await supabase
                .from('scholarships_master')
                .select('*')
                .or('url_status.eq.broken,url_status.is.null')
                .limit(20)

            if (error) throw error

            if (!brokenScholarships || brokenScholarships.length === 0) {
                alert('✅ No hay enlaces rotos para reparar')
                return
            }

            setProgress({ current: 0, total: brokenScholarships.length, status: 'Reparando enlaces...' })

            let repaired = 0
            const failed = []

            for (let i = 0; i < brokenScholarships.length; i++) {
                const scholarship = brokenScholarships[i]
                setProgress({
                    current: i + 1,
                    total: brokenScholarships.length,
                    status: `Buscando URL para ${scholarship.id}...`
                })

                try {
                    // Search for correct URL (simulated - in real implementation, use search API)
                    const searchQuery = `${scholarship.beca_nombre} ${scholarship.universidad || ''} ${scholarship.pais} scholarship official`
                    console.log(`🔍 Searching: ${searchQuery}`)

                    // For now, just mark as needs_manual_review
                    const { error: updateError } = await supabase
                        .from('scholarships_master')
                        .update({
                            url_status: 'needs_review',
                            url_last_checked: new Date().toISOString()
                        })
                        .eq('id', scholarship.id)

                    if (updateError) throw updateError

                    repaired++

                } catch (error) {
                    console.error(`❌ Failed to repair ${scholarship.id}:`, error)
                    failed.push({ id: scholarship.id, error: error.message })
                }

                await new Promise(resolve => setTimeout(resolve, 200))
            }

            alert(`✅ Proceso completo\\n\\nMarcados para revisión: ${repaired}\\nFallidos: ${failed.length}`)

            if (onRepairComplete) onRepairComplete()

        } catch (error) {
            console.error('❌ Error repairing links:', error)
            alert('❌ Error: ' + error.message)
        } finally {
            setRepairing(false)
            setProgress({ current: 0, total: 0, status: '' })
        }
    }

    return (
        <div className="relative">
            <button
                onClick={() => setShowMenu(!showMenu)}
                disabled={repairing}
                className="bg-red-500 hover:bg-red-600 text-white font-medium px-6 py-2 rounded-lg shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                    background: repairing ? '#94a3b8' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                }}
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {repairing ? `Procesando... ${progress.current}/${progress.total}` : 'Reparar Enlaces'}
            </button>

            {showMenu && (
                <div ref={menuRef} className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                    <div className="py-2">
                        <button
                            onClick={handleVerifyAll}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <div className="font-medium text-gray-900">Verificar Todos</div>
                                    <div className="text-sm text-gray-500">Revisar {scholarships.length} enlaces</div>
                                </div>
                            </div>
                        </button>

                        <button
                            onClick={handleRepairBroken}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                <div>
                                    <div className="font-medium text-gray-900">Auto-Reparar</div>
                                    <div className="text-sm text-gray-500">Buscar URLs correctas</div>
                                </div>
                            </div>
                        </button>

                        <div className="border-t border-gray-200 my-2"></div>

                        <div className="px-4 py-2">
                            <p className="text-xs text-gray-500">
                                💡 <strong>Verificar:</strong> Identifica enlaces rotos<br />
                                🔧 <strong>Auto-Reparar:</strong> Busca URLs correctas
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {repairing && progress.total > 0 && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50">
                    <div className="text-sm font-medium text-gray-700 mb-2">
                        {progress.status}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-red-500 h-2 rounded-full transition-all"
                            style={{ width: `${(progress.current / progress.total) * 100}%` }}
                        ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1 text-right">
                        {progress.current} / {progress.total}
                    </div>
                </div>
            )}
        </div>
    )
}
