import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const COLORS = {
    deepPurple: '#312C8E',
    brightBlue: '#4B50D0',
    lime: '#D5ED86',
    lavender: '#b1a2d2',
    gold: '#eab10b',
    white: '#FFFFFF',
    // New BecaMatchPRO specific colors
    proGradientStart: 'rgba(75, 80, 208, 0.15)',
    proGradientEnd: 'rgba(49, 44, 142, 0.08)',
    proAccentDark: '#c4dc75',
}

// ─── Logo & Asset Catalog ─────────────────────────────────
const LOGO_ASSETS = [
    {
        category: 'Logos Alta Resolución',
        icon: '🏷️',
        items: [
            { name: 'Original sobre transparente', file: 'Original sobre transparente.png' },
            { name: 'Blanco sobre transparente', file: 'Blanco sobre transparente .png' },
            { name: 'Negro sobre transparente', file: 'Negro sobre transparente.png' },
            { name: 'Original', file: 'Original.png' },
            { name: 'Sin slogan - morado', file: 'Sin slogan - morado.png' },
            { name: 'Sin slogan - blanco', file: 'Sin slogan - blanco.png' },
        ]
    },
    {
        category: 'Logo B (Ícono)',
        icon: '🅱️',
        items: [
            { name: 'Logo B - blanco', file: 'Logo B - blanco.png' },
            { name: 'Logo B - morado', file: 'Logo B - morado.png' },
            { name: 'Logo B - transparente', file: 'Logo B - transparente.png' },
        ]
    },
    {
        category: 'Logo BecaLab+',
        icon: '⭐',
        items: [
            { name: 'Logo blanco completo PLUS', file: 'Logo blanco completoPLUS.png' },
            { name: 'Logo morado completo PLUS', file: 'Logo morado completoPLUS.png' },
            { name: 'Logo B blanco PLUS', file: 'Logo B blancoPLUS.png' },
            { name: 'Logo B morado PLUS', file: 'Logo B moradoPLUS.png' },
        ]
    },
    {
        category: 'Logos de Productos',
        icon: '📦',
        items: [
            { name: 'BecaBot', file: 'BecaBot.png' },
            { name: 'BecaBot blanco', file: 'BecaBot blanco.png' },
            { name: 'BecaMap', file: 'BecaMap.png' },
            { name: 'BecaMap blanco', file: 'BecaMap blanco.png' },
            { name: 'BecaPrep', file: 'BecaPrep.png' },
            { name: 'BecaPrep blanco', file: 'BecaPrep blanco.png' },
        ]
    },
    {
        category: 'RRSS - Fotos de Perfil & Portadas',
        icon: '📱',
        items: [
            { name: 'Foto de perfil de Instagram', file: 'Foto de perfil de Instagram.jpg' },
            { name: 'Story/Reel de Instagram', file: 'Story reel de Instagram.jpg' },
            { name: 'Publicación cuadrada IG', file: 'Publicación cuadrada de Instagram.jpg' },
            { name: 'Publicación apaisada IG', file: 'Publicación apaisada de Instagram.jpg' },
        ]
    },
    {
        category: 'Negocios (Firma, Tarjeta, Marca de Agua)',
        icon: '💼',
        items: [
            { name: 'Firma de email original', file: 'Firma de email original.jpg' },
            { name: 'Marca de agua', file: 'Marca de agua.png' },
            { name: 'Presentación', file: 'Presentación.jpg' },
        ]
    },
]

// Color swatches for the brand manual
const COLOR_PALETTE = [
    { name: 'Deep Purple', hex: '#312C8E', usage: 'Fondos principales, headers, elementos ancla' },
    { name: 'Bright Blue', hex: '#4B50D0', usage: 'Botones, CTAs, acentos, gradientes' },
    { name: 'Lime Green', hex: '#D5ED86', usage: 'Highlights, estados activos, CTAs secundarios' },
    { name: 'Lavender', hex: '#b1a2d2', usage: 'Fondos suaves, secciones secundarias, cards' },
    { name: 'Gold', hex: '#eab10b', usage: 'Premium, alertas, badges especiales' },
    { name: 'White', hex: '#FFFFFF', usage: 'Texto sobre fondos oscuros, íconos, espacios' },
]

const PRO_COLOR_PALETTE = [
    { name: 'Pro Gradient Start', rgb: 'rgba(75, 80, 208, 0.15)', usage: 'Glassmorphism Backgrounds (BecaMatchPRO)' },
    { name: 'Pro Gradient End', rgb: 'rgba(49, 44, 142, 0.08)', usage: 'Glassmorphism Shadows (BecaMatchPRO)' },
    { name: 'Pro Accent Dark', hex: '#c4dc75', usage: 'Hover states on lime green buttons' },
]

function Section({ title, icon, children, defaultOpen = false }) {
    const [open, setOpen] = useState(defaultOpen)
    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8 transform transition-all hover:shadow-xl group backdrop-blur-sm bg-white/90">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-8 py-6 text-left transition-all relative overflow-hidden print:hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex items-center gap-4 relative z-10">
                    <span className="text-3xl bg-gray-50 p-2 rounded-xl shadow-sm border border-gray-100">{icon}</span>
                    <h2 className="text-2xl font-extrabold tracking-tight" style={{ color: COLORS.deepPurple }}>{title}</h2>
                </div>
                <svg
                    className={`w-8 h-8 transition-transform duration-500 relative z-10 ${open ? 'rotate-180' : ''}`}
                    fill="none" stroke={COLORS.brightBlue} viewBox="0 0 24 24"
                    strokeWidth={2.5}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            <div className={`print:block ${open ? 'block' : 'hidden'}`}>
                {/* Print Title Header (only visible when printing) */}
                <div className="hidden print:flex items-center gap-4 px-8 py-4 border-b-2 border-gray-900 mb-4">
                    <span className="text-2xl grayscale">{icon}</span>
                    <h2 className="text-2xl font-black text-black uppercase tracking-wider">{title}</h2>
                </div>
                <div className="px-8 pb-8 border-t border-gray-100 pt-6 animate-fadeIn">
                    {children}
                </div>
            </div>
        </div>
    )
}

function InfoCard({ title, children, accent = COLORS.brightBlue, glass = false }) {
    const bgStyle = glass
        ? { background: `linear-gradient(145deg, ${COLORS.proGradientStart} 0%, ${COLORS.proGradientEnd} 100%)`, backdropFilter: 'blur(10px)' }
        : { backgroundColor: '#f8fafc', borderLeftColor: accent };

    return (
        <div
            className={`rounded-xl p-6 border-l-4 transition-all hover:-translate-y-1 hover:shadow-md ${glass ? 'border-t border-white/50 border-l border-white/50 shadow-sm' : ''}`}
            style={bgStyle}
        >
            <h4 className={`font-bold text-lg mb-3 ${glass ? 'text-white drop-shadow-sm' : 'text-gray-900'}`}>{title}</h4>
            <div className={`text-sm space-y-2 leading-relaxed ${glass ? 'text-white/90' : 'text-gray-700'}`}>{children}</div>
        </div>
    )
}

function LinkEditor({ linkData, onUpdate }) {
    const [editing, setEditing] = useState(false)
    const [url, setUrl] = useState(linkData.url || '')

    const handleSave = async () => {
        await onUpdate(linkData.key, url)
        setEditing(false)
    }

    return (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-gray-50/80 p-4 rounded-xl border border-gray-100 hover:border-gray-300 transition-colors group print:hidden">
            <span className="text-xl shrink-0 p-2 bg-white rounded-lg shadow-sm">
                {linkData.key === 'logos_zip' ? '📦' : '📁'}
            </span>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-800">{linkData.label}</p>
                {editing ? (
                    <div className="flex gap-2 mt-2">
                        <input
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="https://..."
                        />
                        <button onClick={handleSave} className="px-3 py-1.5 bg-green-500 text-white rounded-md text-sm font-medium hover:bg-green-600 transition-colors">Guardar</button>
                        <button onClick={() => { setEditing(false); setUrl(linkData.url) }} className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors">Cancelar</button>
                    </div>
                ) : (
                    <div className="mt-1 flex items-center justify-between">
                        {linkData.url ? (
                            <a
                                href={linkData.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-medium hover:underline truncate mr-4 inline-flex items-center gap-1"
                                style={{ color: COLORS.brightBlue }}
                            >
                                {linkData.url} ↗
                            </a>
                        ) : (
                            <p className="text-sm text-gray-400 italic">No hay enlace configurado aún</p>
                        )}
                        <button
                            onClick={() => setEditing(true)}
                            className="text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-md shadow-sm font-semibold hover:bg-gray-50 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                            style={{ color: COLORS.deepPurple }}
                        >
                            ✏️ Editar URL
                        </button>
                    </div>
                )}
            </div>
            {linkData.key === 'logos_zip' && linkData.url && (
                <a href={linkData.url} target="_blank" rel="noopener noreferrer" className="ml-auto mt-2 sm:mt-0 flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-transform hover:scale-105 shadow-sm" style={{ backgroundColor: COLORS.lime, color: COLORS.deepPurple }}>
                    <span>⬇️</span> Descargar ZIP
                </a>
            )}
        </div>
    )
}

export default function ConexarOnboardingPage() {
    const [links, setLinks] = useState([])
    const [loadingLinks, setLoadingLinks] = useState(true)

    useEffect(() => {
        fetchLinks()
    }, [])

    const fetchLinks = async () => {
        try {
            const { data, error } = await supabase.from('conexar_links').select('*').order('label')
            if (error) throw error
            setLinks(data || [])
        } catch (error) {
            console.error('Error fetching links:', error)
        } finally {
            setLoadingLinks(false)
        }
    }

    const handleUpdateLink = async (key, newUrl) => {
        try {
            const { error } = await supabase
                .from('conexar_links')
                .update({ url: newUrl })
                .eq('key', key)
            if (error) throw error
            await fetchLinks()
            alert('✅ Enlace actualizado correctamente')
        } catch (error) {
            console.error('Error updating link:', error)
            alert('❌ Error al actualizar el enlace: ' + error.message)
        }
    }

    const printStrategy = () => {
        window.print()
    }

    return (
        <div className="flex-1 overflow-auto bg-[#312C8E] print:bg-white print:overflow-visible relative min-h-screen">
            {/* Background Decorative Elements (hidden in print) */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#312C8E] via-[#312C8E]/40 to-[#4B50D0]/20 -z-10 print:hidden opacity-90"></div>
            <div className="fixed top-20 right-20 w-96 h-96 bg-[#D5ED86] rounded-full mix-blend-multiply filter blur-[100px] opacity-10 -z-10 print:hidden animate-pulse-glow pointer-events-none"></div>

            {/* Print-Hidden Interactive App */}
            <div className="print:hidden">

                {/* Header / Hero Section */}
                <header className="pt-16 pb-12 px-8 print:pt-4 print:pb-4">
                    <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex-1">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-white text-sm font-semibold mb-6 border border-white/20 shadow-inner">
                                <span className="w-2 h-2 rounded-full bg-[#D5ED86] animate-pulse"></span>
                                Estrategia Oficial 2026
                            </div>
                            <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight mb-4 drop-shadow-md leading-tight">
                                Onboarding BecaLab
                            </h1>
                            <p className="text-gray-300 text-lg max-w-2xl leading-relaxed font-medium">
                                El blueprint completo para el manejo de contenido orgánico, captación de leads y estrategia comercial B2C/B2B a través de BecaLab, sus micro-apps y canales sociales.
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3 min-w-[240px] print:hidden bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 shadow-2xl">
                            <button
                                onClick={printStrategy}
                                className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl font-bold transition-all hover:-translate-y-1 shadow-md bg-white text-[#312C8E]"
                            >
                                <span className="text-xl">📄</span> Descargar PDF Estrategia
                            </button>
                            <div className="text-center mt-2 border-t border-white/20 pt-4">
                                <p className="text-white/80 text-xs font-bold uppercase tracking-wider mb-2">Descargas de Arte</p>
                                <div className="group relative flex flex-col items-center">
                                    <a
                                        href="/logos_becalab.zip"
                                        download="logos_becalab.zip"
                                        className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl font-bold transition-all hover:-translate-y-1 shadow-md cursor-pointer"
                                        style={{ backgroundColor: COLORS.lime, color: COLORS.deepPurple }}
                                    >
                                        <span className="text-xl">🗃️</span> Bajar Archivos Completos
                                    </a>
                                    <p className="text-[10px] text-white/80 mt-2 leading-tight text-left w-full bg-white/5 p-2 rounded">
                                        Incluye carpetas: Logos B, RRSS - FB IG, Logo BecaLabPLUS, Alta Resolución - Logo 2025, Products, Negocios. <br />
                                        <span className="text-[#D5ED86]">Nota: Falta hacer un par de logos como el del nuevo BecaMatchPRO que cambiará el original.</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-8 max-w-6xl mx-auto space-y-4 print:p-0 print:space-y-6 print:max-w-none">

                    {/* ════════ SECTION 1: ¿QUÉ ES BECALAB? ════════ */}
                    <Section title="¿Qué es BecaLab?" icon="🚀" defaultOpen={true}>
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            <div className="lg:col-span-8 flex flex-col gap-4">
                                <InfoCard title="🌟 La Visión General" accent={COLORS.deepPurple}>
                                    <p className="text-lg font-medium text-gray-800 mb-2">Transformar metas en realidades globales.</p>
                                    <p>BecaLab es un ecosistema educativo impulsado por IA que elimina la asimetría de información y el síndrome del impostor, conectando a latinoamericanos con becas internacionales y universidades globales (Nicho: Educación internacional + Becas).</p>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <a href="https://www.becalab.org" target="_blank" rel="noopener noreferrer" className="px-3 py-1 bg-gray-100 text-[#312C8E] rounded-md font-semibold text-xs hover:bg-gray-200 transition">🌐 www.becalab.org</a>
                                        <a href="https://instagram.com/beca_lab" target="_blank" rel="noopener noreferrer" className="px-3 py-1 bg-pink-50 text-pink-600 rounded-md font-semibold text-xs hover:bg-pink-100 transition">📱 @beca_lab</a>
                                        <a href="https://instagram.com/ana.cosmica" target="_blank" rel="noopener noreferrer" className="px-3 py-1 bg-purple-50 text-[#312C8E] rounded-md font-semibold text-xs hover:bg-purple-100 transition">📱 @ana.cosmica</a>
                                    </div>
                                </InfoCard>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                                    <InfoCard title="🎯 Problemas Centrales" accent={COLORS.lime}>
                                        <ul className="list-disc list-inside space-y-2 mt-2">
                                            <li><strong>Parálisis por análisis:</strong> Hay plataformas de búsqueda con 10,000 becas, pero ninguna indica si el perfil <em>realmente</em> aplica.</li>
                                            <li><strong>Síndrome del Impostor:</strong> Jóvenes que descartan excelentes oportunidades temiendo no ser "genios".</li>
                                            <li><strong>Desconexión B2B:</strong> Universidades foráneas batallan (y gastan muchísimo en Ferias/Ads) para llegar a estudiantes calificados en LATAM.</li>
                                        </ul>
                                    </InfoCard>
                                    <InfoCard title="👥 Audiencia Target" accent={COLORS.brightBlue}>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                                                <span className="font-semibold text-gray-500 text-xs uppercase">Edades</span>
                                                <span className="font-bold text-gray-800">18 - 35 años</span>
                                            </div>
                                            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                                                <span className="font-semibold text-gray-500 text-xs uppercase">Región</span>
                                                <span className="font-bold text-gray-800 text-right">Latinoamérica<br /><span className="text-[10px] font-normal text-gray-500">(Colombia, Perú, Mex, Ecu, etc)</span></span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold text-gray-500 text-xs uppercase">Idioma Base</span>
                                                <span className="font-bold text-gray-800">Español</span>
                                            </div>
                                        </div>
                                    </InfoCard>
                                </div>
                            </div>

                            <div className="lg:col-span-4 bg-[#312C8E] rounded-xl p-6 shadow-md text-white border-b-4 border-[#eab10b]">
                                <h4 className="text-xl font-black mb-4 flex items-center gap-2">
                                    <span className="bg-[#eab10b] w-2 h-6 inline-block rounded-full"></span>
                                    Metas 2026
                                </h4>
                                <ul className="space-y-4 font-medium text-sm">
                                    <li className="flex items-start gap-3">
                                        <span className="bg-white/20 p-1 rounded-md mt-0.5">🚀</span>
                                        <span>Posicionar a <strong>Ana Cosmica / BecaLab</strong> como el unicornio / hub #1 de movilidad educativa en LATAM.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="bg-white/20 p-1 rounded-md mt-0.5">💰</span>
                                        <span>Escalar significativamente las ventas orgánicas directas a <strong>BecaLab+</strong> (High Ticket).</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="bg-[#D5ED86]/30 p-1 rounded-md mt-0.5" style={{ color: COLORS.lime }}>🤝</span>
                                        <span>Lanzar agresivamente y monetizar el canal <strong>BecaLab Connect (B2B)</strong>.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="bg-[#b1a2d2]/30 p-1 rounded-md mt-0.5" style={{ color: COLORS.lavender }}>📣</span>
                                        <span>Que se conozca la marca <strong>BecaLab</strong> desanclando un poco la cuenta de Ana para posicionar la autoridad BecaLab en divulgación de becas. Así, posicionamos a Ana de un modo más corporativo como Founder, Autoridad Tech + IA + Academia.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </Section>

                    {/* ════════ SECTION 2: PRODUCTOS & ESTRATEGIA B2C ════════ */}
                    <Section title="Estrategia B2C & Ecosistema de Productos" icon="🛍️">
                        <div className="space-y-6">

                            {/* Core Products Grid (Bento Box style) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                <div className="col-span-1 md:col-span-2 lg:col-span-3">
                                    <h3 className="text-xl font-extrabold mb-1" style={{ color: COLORS.deepPurple }}>El Hub Tecnológico</h3>
                                    <p className="text-gray-600 text-sm mb-2">Herramientas freemium (Lead Magnets) + Producto High Ticket (Monetización).</p>
                                </div>

                                {/* BecaLab Plus (Core monetization) */}
                                <div className="col-span-1 md:col-span-2 lg:col-span-1 bg-gradient-to-br from-[#312C8E] to-[#1e1a5a] text-white p-6 rounded-2xl shadow-lg relative overflow-hidden group flex flex-col justify-between">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 transform group-hover:scale-110 transition-transform pointer-events-none"><span className="text-8xl">⭐</span></div>
                                    <div className="relative z-10">
                                        <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-[#eab10b] text-black rounded-sm mb-3 inline-block">Core Monetization</span>
                                        <h4 className="text-2xl font-black mb-2 gap-2 flex items-center">BecaLab<span style={{ color: COLORS.lime }}>+</span></h4>
                                        <p className="text-sm text-white/90 mb-2">Servicio integral High-Ticket (Portal en Circle). Incluye revisión de CV, cartas, ensayos y entrevistas. ¡Baja las guías bases con las que trabajamos aquí!</p>
                                        <div className="flex flex-wrap gap-1 mb-4 mt-2">
                                            <a href="/guias/Guía Carta de Motivación BL+.pdf" download className="text-[10px] bg-white/10 hover:bg-white/20 border border-white/20 px-2 py-1 rounded transition-colors whitespace-nowrap">📄 Carta de Motivación</a>
                                            <a href="/guias/Guía para CV Europass BL+ (1).pdf" download className="text-[10px] bg-white/10 hover:bg-white/20 border border-white/20 px-2 py-1 rounded transition-colors whitespace-nowrap">📄 CV Europass</a>
                                            <a href="/guias/Guía para Entrevista BL+.pdf" download className="text-[10px] bg-white/10 hover:bg-white/20 border border-white/20 px-2 py-1 rounded transition-colors whitespace-nowrap">📄 Entrevista</a>
                                            <a href="/guias/Guía Entrevista STEM BL+.pdf" download className="text-[10px] bg-white/10 hover:bg-white/20 border border-white/20 px-2 py-1 rounded transition-colors whitespace-nowrap">📄 Entrevista STEM</a>
                                            <a href="/guias/Guía Carta de Recomendación BL+.pdf" download className="text-[10px] bg-white/10 hover:bg-white/20 border border-white/20 px-2 py-1 rounded transition-colors whitespace-nowrap">📄 Carta Recomendación</a>
                                        </div>
                                    </div>
                                    <a href="https://plus.becalab.org/checkout/becalabplus" target="_blank" rel="noopener noreferrer" className="relative z-10 inline-flex w-full items-center justify-center py-2 bg-[#D5ED86] text-[#312C8E] hover:bg-[#c4dc75] rounded-lg text-sm font-bold transition-all shadow-sm">Ver Portal de Alumnos en Circle →</a>
                                </div>

                                {/* BecaMap */}
                                <div className="col-span-1 bg-white border border-gray-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
                                    <div>
                                        <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 rounded-sm mb-3 inline-block">Protected Database</span>
                                        <h4 className="text-xl font-bold mb-2 text-gray-900">🗺️ BecaMap</h4>
                                        <p className="text-sm text-gray-600 mb-4 h-16">El buscador y base de datos maestra con miles de becas filtrables. El núcleo de nuestra data general.</p>
                                    </div>
                                    <div className="text-sm font-bold text-gray-400 flex items-center gap-1 cursor-default"><span className="text-lg">🔒</span> Base de datos interna protegida</div>
                                </div>

                                {/* BecaBot */}
                                <div className="col-span-1 bg-white border border-gray-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
                                    <div>
                                        <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-[#D5ED86] text-[#312C8E] rounded-sm mb-3 inline-block">Conversational Lead Gen</span>
                                        <h4 className="text-xl font-bold mb-2 text-gray-900">🤖 BecaBot</h4>
                                        <p className="text-sm text-gray-600 mb-4 h-16">Asistente de IA (Web & WhatsApp) que recomienda becas y cualifica leads en automático 24/7.</p>
                                    </div>
                                    <a href="https://www.becalab.org/BecaBot" target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-[#4B50D0] hover:text-[#312C8E] transition-colors flex items-center gap-1">Probar BecaBot <span className="text-lg">→</span></a>
                                </div>

                                {/* BecaMatch (Gratis) */}
                                <div className="col-span-1 md:col-span-3 lg:col-span-1 bg-white border border-gray-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
                                    <div>
                                        <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 rounded-sm mb-3 inline-block">Free Lead Magnet</span>
                                        <h4 className="text-xl font-bold mb-2 text-gray-900">🎯 BecaMatch (Gratis)</h4>
                                        <p className="text-sm text-gray-600 mb-4">La herramienta gratuita estrella que nos permite recolectar los datos de perfil iniciales hacia nuestra BD 'BecaRuta' antes del upsell.</p>
                                    </div>
                                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
                                        <div className="text-xs font-bold text-gray-400">Integrado en embudos orgánicos</div>
                                        <a href="https://match.becalab.org" target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-[#4B50D0] hover:text-[#312C8E] transition-colors flex items-center gap-1">Visitar App <span className="text-lg">→</span></a>
                                    </div>
                                </div>

                                {/* BecaMatch PRO (New) */}
                                <div className="col-span-1 md:col-span-2 lg:col-span-2 relative overflow-hidden rounded-2xl p-0 shadow-sm border border-gray-200 group">
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 z-0"></div>
                                    <div className="relative z-10 p-6 bg-gradient-to-r from-[#312C8E] to-[#4B50D0] text-white h-full flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="text-2xl font-black tracking-tight" style={{ color: COLORS.lime }}>BecaMatch <span className="text-white font-light border border-white/30 px-1 rounded-sm text-sm ml-1">PRO</span></h4>
                                                <span className="px-2 py-1 text-[10px] font-black bg-white/20 text-white rounded-md">PAID TOOL</span>
                                            </div>
                                            <p className="text-gray-200 text-sm max-w-md">Test vocacional inmersivo impulsado por IA. Diagnostica fortalezas, arroja el <strong>Arquetipo de Personalidad y Anti-arquetipo</strong> así como un matching de becas pertinente usando la BD de BecaRuta (Crucial para B2B).</p>
                                        </div>
                                        <div className="mt-4 flex gap-3">
                                            <a href="https://matchpro.becalab.org" target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-white hover:text-[#D5ED86] transition-colors flex items-center gap-1">Página Web <span className="text-lg">→</span></a>
                                        </div>
                                    </div>
                                </div>

                                {/* Extension */}
                                <div className="col-span-1 md:col-span-3 lg:col-span-3 bg-white border border-gray-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                    <div className="max-w-xl">
                                        <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-gray-100 text-gray-600 rounded-sm mb-3 inline-block">Daily Habit Builder (Free Tool)</span>
                                        <h4 className="text-xl font-bold mb-2 text-gray-900">🔌 BecaLab Focus (Extensión Chrome)</h4>
                                        <p className="text-sm text-gray-600">Reemplaza la 'Nueva Pestaña' con recomendaciones de becas y deadlines. Micro-dosis de motivación diaria y anclaje a nuestra BD de estudiantes (BecaRuta).</p>
                                    </div>
                                    <a href="https://chromewebstore.google.com/detail/becalab-focus/jiackbefodcajgmihenmbanbinnmgfoh" target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-[#4B50D0] hover:text-[#312C8E] whitespace-nowrap transition-colors flex items-center gap-1">Ver en Chrome Store <span className="text-lg">→</span></a>
                                </div>
                            </div>

                            {/* Freebies & v0 Micro-apps Strategy */}
                            <div className="mt-8 border-t border-gray-200 pt-8">
                                <h3 className="text-xl font-extrabold mb-4" style={{ color: COLORS.deepPurple }}>📈 Pipeline Orgánico y Captación Creador/Producto</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="col-span-1 bg-pink-50 rounded-xl p-5 border border-pink-100">
                                        <div className="text-pink-500 mb-2 font-bold flex items-center gap-2"><span>1</span> El Gancho en RRSS</div>
                                        <p className="text-sm text-gray-700">Se crea un post viral resolviendo un dolor (usualmente contenido colaborativo entre Ana y BecaLab). El CTA invita a comentar una palabra clave (ej. <strong>"BECA"</strong>). ManyChat dispara un DM con el link.</p>
                                    </div>
                                    <div className="col-span-1 bg-blue-50 rounded-xl p-5 border border-blue-100">
                                        <div className="text-blue-500 mb-2 font-bold flex items-center gap-2"><span>2</span> Micro-App (La Verdadera Magia)</div>
                                        <p className="text-sm text-gray-700">El DM de ManyChat no da la guía directa, sino que lleva hacia una <strong>Micro-App</strong> desarrollada (ej: en V0 o Claude). El lead navega la app, llena un formulario interactivo dejando sus datos vitales y a cambio recibe el informe o freebie.</p>
                                    </div>
                                    <div className="col-span-1 bg-green-50 rounded-xl p-5 border border-green-100 relative">
                                        <div className="text-green-600 mb-2 font-bold flex items-center gap-2"><span>3</span> Supabase "RRSS" MKT</div>
                                        <p className="text-sm text-gray-700">Toda esa data proveniente de estos leads de marketing y micro-apps queda guardada y aislada en el proyecto Supabase especial de <strong>RRSS</strong>, listo para nutrirse y hacer el upsell orgánico a BecaLab+.</p>
                                    </div>
                                </div>
                                <div className="mt-6 bg-gray-50 p-5 rounded-lg border border-gray-200 flex flex-col sm:flex-row gap-4 items-center">
                                    <div className="text-4xl">🎁</div>
                                    <div>
                                        <h5 className="font-bold text-gray-900">Ejemplos de Freebies / Micro-Apps:</h5>
                                        <p className="text-sm text-gray-600 mt-1">Gemas orgánicas para leads: <em>Generador de Estructuras para Cartas de Motivación</em> • <em>Simuladores de Costos de Vida</em> • <em>Guías definitivas de CV Europass</em> • <em>Prompt builders para ChatGPT enfocados en becas</em>.</p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </Section>

                    {/* ════════ SECTION 3: MODELO B2B ════════ */}
                    <Section title="La Nueva Frontera B2B — BecaLab Connect" icon="🤝">
                        <div className="space-y-6">
                            <div className="bg-gradient-to-r from-[#eab10b]/10 to-transparent p-6 rounded-2xl border-l-4 border-[#eab10b] shadow-sm">
                                <h3 className="text-lg font-black text-[#b88c00] mb-2 uppercase tracking-tight">El Secreto del B2B empieza en el B2C</h3>
                                <p className="text-gray-800 leading-relaxed font-medium">BecaLab Connect conecta a universidades internacionales con talento latinoamericano altamente filtrado. ¿De dónde sacamos el talento? De nuestra mina de oro B2C.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                                <div>
                                    <h4 className="font-bold text-xl mb-3" style={{ color: COLORS.deepPurple }}>El Embudo de Data (Supabase)</h4>
                                    <ul className="space-y-4">
                                        <li className="flex items-start gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                                            <div className="bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center font-bold text-gray-500 shrink-0">1</div>
                                            <div>
                                                <p className="font-bold text-sm text-gray-900">Captura B2C (Freebies, Apps, Extensión)</p>
                                                <p className="text-xs text-gray-500 mt-1">Miles de estudiantes usan **BecaMatch**, la **Chrome Extension** o los diagnósticos gratuitos.</p>
                                            </div>
                                        </li>
                                        <li className="flex items-start gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden">
                                            <div className="absolute left-4 -top-4 w-1 h-4 bg-gray-200"></div>
                                            <div className="bg-blue-100 w-8 h-8 rounded-full flex items-center justify-center font-bold text-blue-600 shrink-0">2</div>
                                            <div>
                                                <p className="font-bold text-sm text-gray-900">Perfilado en Supabase</p>
                                                <p className="text-xs text-gray-600 mt-1">Al llenar formularios interactivos (GPA, carrera, país, presupuesto), se crea una base de datos de <em>Leads Estudiantiles Hiper-Segmentados</em> en Supabase.</p>
                                            </div>
                                        </li>
                                        <li className="flex items-start gap-3 bg-white p-3 rounded-xl shadow-md border-l-4 border-[#312C8E]">
                                            <div className="absolute left-4 -top-4 w-1 h-4 bg-gray-200"></div>
                                            <div className="bg-[#312C8E] w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shrink-0">3</div>
                                            <div>
                                                <p className="font-bold text-sm text-[#312C8E]">Matching B2B (BecaLab Connect)</p>
                                                <p className="text-xs text-gray-800 mt-1">Una universidad en España busca ingenerios colombianos con GPA +3.5. Nosotros tenemos la base de datos exacta y calificada para enviárselos. Las instituciones nos pagan por ese <em>pipeline</em> curado de aplicantes.</p>
                                            </div>
                                        </li>
                                    </ul>
                                </div>

                                <div className="bg-[#f8fafc] p-6 rounded-2xl border border-gray-200">
                                    <h4 className="font-bold text-lg mb-4 text-[#312C8E]">Estrategia de RRSS para el B2B</h4>
                                    <div className="space-y-4">
                                        <div className="flex gap-4 items-start">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-xl shrink-0">📈</div>
                                            <div>
                                                <p className="font-semibold text-sm">Posicionamiento Institucional</p>
                                                <p className="text-xs text-gray-600 mt-1">Las RRSS de BecaLab deben mostrar no solo becas, sino **Datos**. Infografías sobre "El talento tech en LATAM", historias de éxito de alumnos ubicados. Universidades extranjeras que vean el perfil deben pensar: "Ellos entienden el mercado latino".</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4 items-start">
                                            <div className="w-10 h-10 rounded-full bg-[#D5ED86]/40 flex items-center justify-center text-xl shrink-0">🌟</div>
                                            <div>
                                                <p className="font-semibold text-sm">Ana Cosmica como Experta</p>
                                                <p className="text-xs text-gray-600 mt-1">LinkedIn de Ana enfocado en B2B: Compartir milestones de la startup, análisis del ecosistema ed-tech, y alianzas con universidades.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Section>

                    {/* ════════ SECTION 3.5: ARQUITECTURA DE BD ════════ */}
                    <Section title="Estructura de Bases de Datos & Almacenamiento" icon="🗄️">
                        <div className="space-y-6">
                            <p className="text-sm text-gray-600">Tenemos dos grandes ecosistemas de bases de datos operando en <strong>Supabase</strong> para separar leads pasivos de leads tecnológicos cualificados. Esta separación nutre de forma distinta las estrategias B2C y B2B.</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InfoCard title="🗃️ Proyecto: Supabase 'RRSS'" accent={COLORS.brightBlue}>
                                    <p className="font-bold text-gray-800 text-sm mb-2">Para: Leads Orgánicos y Pipeline de Marketing.</p>
                                    <p className="text-sm text-gray-600 mb-2">Almacena la data resultante de los "gags" en redes sociales.</p>
                                    <ul className="list-disc list-inside space-y-1 text-xs text-gray-500 font-medium">
                                        <li>Micro-Apps creadas en v0 para regalar un freebie.</li>
                                        <li>Formularios vinculados a campañas específicas de ManyChat.</li>
                                        <li>Tráfico tibio (Lead MKT) sin validación extrema.</li>
                                        <li>Proposito: Retargeting masivo.</li>
                                    </ul>
                                </InfoCard>

                                <InfoCard title="🚀 Proyecto: Supabase 'BecaRuta'" accent={COLORS.lime}>
                                    <p className="font-bold text-gray-800 text-sm mb-2">Para: Core Tools, Hub Tecnológico B2B y Usuarios Pro.</p>
                                    <p className="text-sm text-gray-600 mb-2">Almacena a los estudiantes de nuestro ecosistema <em>interno</em>. Es el combustible para BecaLab Connect.</p>
                                    <ul className="list-disc list-inside space-y-1 text-xs text-gray-500 font-medium">
                                        <li><strong>BecaLab Focus:</strong> Data de la Extensión Chrome (Usuarios instalados).</li>
                                        <li><strong>BecaMatch (Free):</strong> Filtros básicos de carrera y edad.</li>
                                        <li><strong>BecaMatchPRO:</strong> Perfiles profundos, resultados de arquetipos psicológicos y test de ingreso.</li>
                                        <li>Proposito: Venta B2B a universidades extranjeras y perfiles VIP.</li>
                                    </ul>
                                </InfoCard>
                            </div>
                        </div>
                    </Section>

                    {/* ════════ SECTION 4: MANUAL DE MARCA Y ASSETS ════════ */}
                    <Section title="Manual de Marca (Brand Book) & Assets" icon="🎨">
                        <div className="space-y-10">
                            {/* Color Palettes Container */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Standard Palette */}
                                <div>
                                    <h3 className="text-xl font-black mb-1 tracking-tight" style={{ color: COLORS.deepPurple }}>
                                        Línea Gráfica Clásica
                                    </h3>
                                    <p className="text-xs text-gray-500 font-medium mb-4 uppercase tracking-wider">Web Principal • RRSS • BecaMap • BecaBot</p>

                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {COLOR_PALETTE.map((color) => (
                                            <div key={color.hex} className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all group">
                                                <div className="h-20 w-full relative" style={{ backgroundColor: color.hex, borderBottom: color.hex === '#FFFFFF' ? '1px solid #f3f4f6' : 'none' }}>
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <span className="bg-black/50 text-white text-[10px] px-2 py-1 rounded-full">{color.hex}</span>
                                                    </div>
                                                </div>
                                                <div className="p-3">
                                                    <p className="text-xs font-bold text-gray-900">{color.name}</p>
                                                    <p className="text-[10px] text-gray-500 mt-1 leading-tight">{color.usage}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Pro / Tech Palette */}
                                <div className="bg-[#f8fafc] p-6 rounded-2xl border border-gray-200">
                                    <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-[#312C8E] text-white rounded-sm mb-2 inline-block">NUEVA ESTÉTICA 2026</span>
                                    <h3 className="text-xl font-black mb-1 tracking-tight text-gray-900">
                                        Línea Gráfica "Tech / Pro"
                                    </h3>
                                    <p className="text-xs text-gray-500 font-medium mb-4 uppercase tracking-wider">Chrome Ext. • BecaMatch • BecaMatch PRO</p>

                                    <div className="space-y-4">
                                        <div className="text-sm text-gray-700 leading-relaxed mb-4 bg-white p-4 rounded-xl shadow-sm border border-[#312C8E]/10">
                                            <p className="mb-2"><strong>El salto a la era Tech-Education:</strong> Puesto que queremos separar a "Ana" la creadora, de "BecaLab" la Startup Tech, la línea gráfica "Pro" es crucial. Esto ya lo aplicamos masivamente en:</p>
                                            <ul className="list-disc pl-5 space-y-1">
                                                <li><strong>BecaLab Focus (Extensión):</strong> Usa widgets oscuros tipo Dashboard que generan inmersión. Modos oscuros como hábito diario.</li>
                                                <li><strong>BecaMatch PRO:</strong> Al ser el test que escupe perfiles hiper-detallados, lo diseñamos con <em>glassmorphism</em> interactivo y luces neón, creando una experiencia gamificada y exclusiva.</li>
                                            </ul>
                                            <p className="mt-2 text-xs text-gray-500 italic">"Las nuevas apps enfocadas en el usuario utilizan esta estética hiper-moderna: fondos inmersivos oscuros, blurs neón y tipografías grandes para dar la sensación de estar en una herramienta de IA premium de alto valor".</p>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            <div className="relative rounded-xl overflow-hidden glassmorphism-preview border border-[#312C8E]/20 shadow-md h-24 flex items-end p-2" style={{ background: `linear-gradient(145deg, ${COLORS.proGradientStart}, ${COLORS.proGradientEnd})` }}>
                                                <div>
                                                    <p className="text-xs font-bold text-gray-800">Gradient Start</p>
                                                    <p className="text-[9px] text-gray-500">rgba(75, 80, 208, 0.15)</p>
                                                </div>
                                                <div className="absolute inset-0 backdrop-blur-md -z-10"></div>
                                            </div>
                                            <div className="relative rounded-xl overflow-hidden shadow-inner h-24 flex items-end p-2 border border-gray-200" style={{ backgroundColor: COLORS.deepPurple }}>
                                                <div>
                                                    <p className="text-xs font-bold text-white">Dark Base</p>
                                                    <p className="text-[9px] text-gray-300">Fondos inmersivos UI</p>
                                                </div>
                                            </div>
                                            <div className="relative rounded-xl overflow-hidden h-24 flex items-end p-2 shadow-sm border border-gray-200" style={{ backgroundColor: COLORS.proAccentDark }}>
                                                <div>
                                                    <p className="text-xs font-bold text-[#312C8E]">Accent Dark</p>
                                                    <p className="text-[9px] text-gray-700">#c4dc75 (Hovers/Active)</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-4 p-3 bg-gradient-to-r from-[#312C8E] to-[#4B50D0] rounded-lg border border-[#b1a2d2]/30 text-white relative overflow-hidden">
                                            <div className="absolute -right-4 -top-4 w-16 h-16 bg-[#b1a2d2] rounded-full blur-xl opacity-30"></div>
                                            <p className="text-xs font-mono mb-1 text-gray-300">Ejemplo de contenedor Glass</p>
                                            <h4 className="font-bold mb-1">Tu perfil es: <span style={{ color: COLORS.lime }}>Pionero</span></h4>
                                            <button className="text-xs bg-white text-[#312C8E] px-3 py-1.5 rounded-md font-bold hover:bg-gray-200 mt-2">Acción interactiva</button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Typography */}
                            <div className="border-t border-gray-100 pt-8 mt-8">
                                <h3 className="text-xl font-black mb-4 tracking-tight" style={{ color: COLORS.deepPurple }}>
                                    ✏️ Familias Tipográficas
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center items-center text-center">
                                        <p className="text-[10px] font-bold tracking-widest text-gray-400 mb-2 uppercase">Primaria (UI & Web)</p>
                                        <p className="font-black text-4xl mb-1 text-gray-900 font-sans tracking-tight">Inter</p>
                                        <p className="text-sm font-medium text-gray-500">System UI / Sans-Serif</p>
                                        <div className="flex gap-2 mt-4 text-xs font-bold">
                                            <span className="font-normal text-gray-400">Regular</span>
                                            <span className="font-medium text-gray-600">Medium</span>
                                            <span className="font-extrabold text-gray-900">ExtraBold</span>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center items-center text-center">
                                        <p className="text-[10px] font-bold tracking-widest text-gray-400 mb-2 uppercase">Jerarquías Visuales</p>
                                        <div className="w-full text-left bg-white p-4 rounded-lg shadow-sm">
                                            <h1 className="text-2xl font-black mb-2 text-[#312C8E] tracking-tight">H1 - Títulos Grandes (Black)</h1>
                                            <h2 className="text-lg font-bold mb-2 text-gray-800">H2 - Subtítulos de sección (Bold)</h2>
                                            <p className="text-sm font-normal text-gray-600 leading-relaxed">P - Párrafos regulares para lectura (Regular, 14px-16px, leading-relaxed para dar aire).</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Visual Asset Reference Gallery (Read-only visual reminder) */}
                            <div className="border-t border-gray-100 pt-8 mt-8 print:hidden">
                                <h3 className="text-xl font-black mb-1 tracking-tight" style={{ color: COLORS.deepPurple }}>
                                    📂 Estructura del ZIP de Activos
                                </h3>
                                <p className="text-sm text-gray-500 mb-4">Esta es la estructura que se espera encontrar en la descarga agrupada de logos en el Panel de Links. Las subcarpetas deberían llamarse igual que los recuadros de abajo.</p>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                                    {LOGO_ASSETS.map((category) => (
                                        <div key={category.category} className="bg-white border border-gray-200 rounded-xl p-4 overflow-hidden shadow-sm">
                                            <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-sm border-b border-gray-100 pb-2">
                                                <span>{category.icon}</span> {category.category}
                                            </h4>
                                            <ul className="space-y-2">
                                                {category.items.map((item, idx) => (
                                                    <li key={idx} className="flex items-center text-xs text-gray-600 py-1 hover:bg-gray-50 rounded px-1 transition-colors">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mr-2 flex-shrink-0"></span>
                                                        <span className="break-words line-clamp-2 pr-2">{item.name}</span>
                                                        {item.file.includes('.png') && <span className="ml-auto text-[8px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded flex-shrink-0 self-start mt-0.5">PNG</span>}
                                                        {item.file.includes('.jpg') && <span className="ml-auto text-[8px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded flex-shrink-0 self-start mt-0.5">JPG</span>}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>

                                {/* Gestor de Links Dinámicos - Movido aquí abajo */}
                                <div className="bg-white p-6 rounded-2xl border-2 border-dashed border-gray-200 print:hidden relative overflow-hidden mt-8">
                                    <div className="absolute top-0 right-0 bg-[#D5ED86]/40 text-[#312C8E] text-[10px] font-black uppercase px-3 py-1 rounded-bl-lg">Panel Interactivo Administrativo</div>
                                    <h3 className="text-xl font-bold mb-2" style={{ color: COLORS.deepPurple }}>
                                        🔗 Gestor de Materiales Centralizados (Accesible a todos)
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-6 max-w-2xl">
                                        Todos los usuarios con acceso a este panel pueden actualizar o subir nuevas versiones a Drive/Canva y pegar el nuevo enlace abajo. Estas URLs son las que CONEXAR utilizará para descargar el material fuente.
                                    </p>
                                    <div className="flex flex-col gap-3">
                                        {loadingLinks ? (
                                            <div className="animate-pulse space-y-3">
                                                {[1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl w-full"></div>)}
                                            </div>
                                        ) : (
                                            links.map(link => (
                                                <LinkEditor key={link.id} linkData={link} onUpdate={handleUpdateLink} />
                                            ))
                                        )}
                                    </div>
                                </div>

                            </div>
                        </div>
                    </Section>

                    {/* ════════ SECTION 5: MANUAL DE COMUNICACIÓN ════════ */}
                    <Section title="Voz, Tono & Flujo de Contenidos" icon="💬">
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-xl font-black mb-4 text-[#312C8E]">El Ecosistema de Redes</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InfoCard title="👩‍💻 Ana Cosmica (Marca Personal)" accent={COLORS.lavender} glass={false}>
                                        <a href="https://www.instagram.com/ana.cosmica/" target="_blank" rel="noopener noreferrer" className="bg-purple-50 hover:bg-purple-100 transition-colors p-2 rounded-lg text-xs font-bold text-[#312C8E] mb-3 border border-purple-200 inline-flex items-center gap-1 shadow-sm"><span className="text-base">📱</span> @ana.cosmica <span className="text-[10px]">↗</span></a>
                                        <ul className="space-y-3 relative">
                                            <li className="flex items-start gap-2">
                                                <span className="mt-1 text-[#4B50D0]">&#x25B8;</span>
                                                <span><strong>Arquetipo:</strong> La mentora inspiradora, el caso de éxito (storytelling personal).</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="mt-1 text-[#4B50D0]">&#x25B8;</span>
                                                <span><strong>Objetivo del Perfil:</strong> Atraer masas, viralizar, generar confianza extrema. Es la cara humana que el usuario aspira a ser.</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="mt-1 text-[#4B50D0]">&#x25B8;</span>
                                                <span><strong>Contenido Pilar:</strong> Storytimes, 'vlogs' de la vida estudiando en el extranjero, vulnerabilidad, mentalidad y tips emocionales.</span>
                                            </li>
                                        </ul>
                                    </InfoCard>

                                    <InfoCard title="🏢 BecaLab (La Institución)" accent={COLORS.deepPurple} glass={false}>
                                        <a href="https://www.instagram.com/beca_lab/" target="_blank" rel="noopener noreferrer" className="bg-[#D5ED86]/30 hover:bg-[#D5ED86]/50 transition-colors p-2 rounded-lg text-xs font-bold text-[#312C8E] mb-3 border border-[#D5ED86] inline-flex items-center gap-1 shadow-sm"><span className="text-base">📱</span> @beca_lab <span className="text-[10px]">↗</span></a>
                                        <ul className="space-y-3 relative">
                                            <li className="flex items-start gap-2">
                                                <span className="mt-1 text-[#312C8E]">&#x25B8;</span>
                                                <span><strong>Arquetipo:</strong> El experto institucional, tecnológico, estructurado y la fuente de la verdad de los datos.</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="mt-1 text-[#312C8E]">&#x25B8;</span>
                                                <span><strong>Objetivo del Perfil:</strong> Dar credibilidad, proveer herramientas técnicas (Micro-Apps), capturar leads duros y cerrar ventas High-Ticket.</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="mt-1 text-[#312C8E]">&#x25B8;</span>
                                                <span><strong>Contenido Pilar:</strong> Carruseles densos educativos, infografías de requisitos, testimonios de clientes aprobados (prueba social), tutoriales de la app.</span>
                                            </li>
                                        </ul>
                                    </InfoCard>
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-gray-50 to-white p-6 rounded-2xl border border-gray-200">
                                <h3 className="font-bold text-lg mb-4 text-gray-900">🔄 Ciclo de Vida del Creador/Contenido</h3>
                                <div className="flex flex-col gap-6 w-full text-center relative">
                                    <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100 flex items-center justify-between text-left gap-4">
                                        <div className="text-2xl w-12 text-center">🎈</div>
                                        <div className="flex-1">
                                            <p className="font-bold text-sm text-[#312C8E]">Atención (RRSS Collab)</p>
                                            <p className="text-xs text-gray-500 mt-1">Ana y BecaLab postean un Collab viral requiriendo una interacción (comentar clave). Manychat envía un DM.</p>
                                        </div>
                                    </div>
                                    <div className="bg-white p-4 rounded-xl shadow-md border border-[#D5ED86] flex items-center justify-between text-left gap-4">
                                        <div className="text-2xl w-12 text-center">🎁</div>
                                        <div className="flex-1">
                                            <p className="font-bold text-sm text-[#312C8E]">Captación y Entrega (Micro-App)</p>
                                            <p className="text-xs text-gray-500 mt-1">El DM enlaza a una Micro-App. El lead llena un formulario, baja su freebie mientras los datos se instancian en la BD "RRSS" de marketing.</p>
                                        </div>
                                    </div>
                                    <div className="bg-[#312C8E] p-4 rounded-xl shadow-[0_0_20px_rgba(49,44,142,0.3)] border border-[#4B50D0] flex items-center justify-between text-left gap-4 text-white">
                                        <div className="text-2xl w-12 text-center">💼</div>
                                        <div className="flex-1">
                                            <p className="font-bold text-sm text-[#D5ED86]">Conversión BecaLab+</p>
                                            <p className="text-xs text-white/80 mt-1">Esos leads nutridos pasan a venta High Ticket en BecaLab+; los de BD 'BecaRuta' van a perfiles B2B.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </Section>
                </div>

                {/* Print Footer */}
                <div className="hidden text-center pt-8 text-gray-400 text-xs border-t border-gray-200 mt-8 mb-8 pb-4">
                    <p>Propiedad Intelectual Limitada. Este documento representa la estrategia oficial BecaLab × CONEXAR para el año 2026.</p>
                    <p>Generado automáticamente desde el BecaLab Admin Panel.</p>
                </div>
            </div> {/* End Print-Hidden Interactive App */}

            {/* Print-Only Plain Text Document */}
            <div className="hidden print:block p-12 max-w-5xl mx-auto bg-white mb-20 shadow-none border-none" style={{ color: COLORS.deepPurple }}>
                <div className="text-center mb-16 pb-8 border-b-2" style={{ borderColor: COLORS.brightBlue }}>
                    <h1 className="text-5xl font-black mb-3">Onboarding BecaLab</h1>
                    <p className="text-2xl font-bold opacity-80 uppercase tracking-widest text-gray-600">Estrategia Oficial 2026 x CONEXAR</p>
                </div>

                <div className="space-y-10">
                    {/* Sección 1 */}
                    <section>
                        <h2 className="text-3xl font-black flex items-center gap-3 pb-3 mb-4 text-[#312C8E] border-b-2 border-gray-100">
                            <span className="text-[#4B50D0] text-xl">01.</span> ¿Qué es BecaLab?
                        </h2>

                        <div className="pl-8 border-l-4 border-gray-100 ml-4 space-y-4 text-justify">
                            <p className="text-[17px] leading-relaxed">
                                <strong className="font-bold text-black text-lg">La Visión General:</strong> Transformar metas en realidades globales. BecaLab es un robusto ecosistema educativo impulsado por Inteligencia Artificial que elimina la asimetría de información y el síndrome del impostor, conectando directamente a talento latinoamericano con grandes becas internacionales y universidades globales. Ocupamos el nicho especializado de Educación Internacional + Becas.
                            </p>

                            <p className="text-[17px] leading-relaxed">
                                <strong className="font-bold text-black text-lg">Problemas Centrales que resolvemos:</strong><br />
                                <span className="pl-4 block mt-2">• <strong>Parálisis por análisis:</strong> Hay plataformas con 10,000 becas, pero ninguna indica si el perfil realmente aplica o no.</span>
                                <span className="pl-4 block mt-1">• <strong>Síndrome del Impostor:</strong> Jóvenes que descartan excelentes oportunidades temiendo no ser "genios".</span>
                                <span className="pl-4 block mt-1">• <strong>El lado B2B:</strong> Universidades foráneas batallan, gastando miles en publicidad dispersa, para encontrar talento genuinamente calificado en LATAM.</span>
                            </p>

                            <p className="text-[17px] leading-relaxed">
                                <strong className="font-bold text-black text-lg">Audiencia Target:</strong> 18 a 35 años, procedentes exclusivamente de Hispanoamérica (Colombia, Perú, México, Ecuador y afines), nativos en idioma Español.
                            </p>
                        </div>

                        <div className="mt-6 bg-gray-50 p-6 rounded-lg ml-12">
                            <strong className="text-xl font-bold block mb-4 text-black border-b border-gray-200 pb-2">🎯 Metas Estratégicas 2026:</strong>
                            <ul className="list-none space-y-3 font-medium text-[16px]">
                                <li className="flex items-start"><span className="text-[#312C8E] font-bold mr-2">✓</span> Posicionar a Ana Cosmica y BecaLab como el Hub Nº1 de movilidad educativa en Latinoamérica.</li>
                                <li className="flex items-start"><span className="text-[#312C8E] font-bold mr-2">✓</span> Escalar contundentemente las ventas orgánicas directas a nuestro producto estelar BecaLab+ (Servicio High Ticket).</li>
                                <li className="flex items-start"><span className="text-[#312C8E] font-bold mr-2">✓</span> Lanzar masivamente y comenzar la monetización institucional del canal B2B "BecaLab Connect".</li>
                                <li className="flex items-start"><span className="text-[#312C8E] font-bold mr-2">✓</span> Afianzar la autoridad corporativa de la marca. Desanclaremos parcialmente la dependencia de la cuenta personal, mutando a Ana hacia un perfil más corporativo como Founder experta en Ed-Tech e IA.</li>
                            </ul>
                        </div>
                    </section>

                    {/* Sección 2 */}
                    <section>
                        <h2 className="text-3xl font-black flex items-center gap-3 pb-3 mb-4 text-[#312C8E] border-b-2 border-gray-100">
                            <span className="text-[#4B50D0] text-xl">02.</span> Ecosistema B2C
                        </h2>

                        <div className="pl-8 border-l-4 border-gray-100 ml-4">
                            <ul className="space-y-5 text-[17px] leading-relaxed">
                                <li>
                                    <h3 className="font-bold text-xl text-black inline">BecaLab+ (Core Monetization):</h3><br />
                                    Servicio integral High-Ticket anclado operativamente dentro del Portal en la plataforma Circle. Otorga al usuario mentoría uno-a-uno, simulaciones de entrevistas, y todos los recursos premium de uso interno (Guías oficiales para CV Europass, Cartas de Recomendación y Motivacionales, y Entrevistas STEM).
                                </li>
                                <li>
                                    <h3 className="font-bold text-xl text-black inline">BecaMap:</h3><br />
                                    La base de datos maestra y pilar de la compañía. Miles de becas filtrables alojadas en un entorno protegido.
                                </li>
                                <li>
                                    <h3 className="font-bold text-xl text-black inline">BecaBot:</h3><br />
                                    Asistente entrenado con Inteligencia Artificial que atiende (Vía web y automatizaciones de WhatsApp), recomienda becas precisas, resuelve dudas y cualifica al lead orgánicamente 24/7.
                                </li>
                                <li>
                                    <h3 className="font-bold text-xl text-black inline">BecaMatch (Gratuito):</h3><br />
                                    Herramienta web optimizada para ser el Lead Magnet inicial perfecto. Recolecta información fundamental del estudiante y puebla nuestra base de datos.
                                </li>
                                <li>
                                    <h3 className="font-bold text-xl text-black inline">BecaMatch PRO:</h3><br />
                                    El formato inmersivo y pago (Tech-App) tipo test vocacional gamificado. Diagnostica Arquetipos y Anti-Arquetipos psicológicos y perfila al candidato de manera clínica.
                                </li>
                                <li>
                                    <h3 className="font-bold text-xl text-black inline">BecaLab Focus (Extensión de Chrome):</h3><br />
                                    Herramienta gamificada que secuestra la "nueva pestaña" del usuario. Brinda micro-dosis motivacionales, recuerda deadlines vitales y absorbe constantemente perfiles activos diarios a nuestra Base de Datos matriz.
                                </li>
                            </ul>

                            <div className="mt-8 bg-gray-50 border border-gray-200 p-6 rounded-lg">
                                <h3 className="font-bold text-lg text-black mb-2 flex items-center gap-2"><span className="text-[#312C8E] text-2xl">⚡</span> Pipeline Orgánico y Captación Interactiva:</h3>
                                <p className="text-[16px] leading-relaxed">Buscamos "Viralidad Colaborativa" en Redes. El Creador resuelve un dolor mediante un Reel y suelta el gancho (Ej. "Comenta la palabra BECA"). Detrás de cámara, ManyChat atrapa al usuario vía DM redirigiéndolo, sin fricción, hacia una <strong>Micro-App interactiva (Landing)</strong>. Ahí el usuario se ve forzado a depositar su información (correo, edad, meta) para que el funnel de venta posterior recolecte sus datos, terminando directamente en nuestra Base de Datos principal y dándole inicio al Upsell.</p>
                            </div>
                        </div>
                    </section>

                    {/* Sección 3 */}
                    <section>
                        <h2 className="text-3xl font-black flex items-center gap-3 pb-3 mb-4 text-[#312C8E] border-b-2 border-gray-100">
                            <span className="text-[#4B50D0] text-xl">03.</span> Frontera B2B y Arquitectura Data-Driven
                        </h2>

                        <div className="pl-8 border-l-4 border-gray-100 ml-4 space-y-4 text-justify">
                            <p className="text-[17px] leading-relaxed mb-4">
                                "BecaLab Connect" se encarga de capitalizar comercialmente toda nuestra captación de leads conectando al talento hispano con Universidades en demanda. Para esto usamos una potente bifurcación en Supabase (Nuestros clústeres de almacenamiento):
                            </p>

                            <ol className="list-decimal pl-5 space-y-4 text-[17px] leading-relaxed">
                                <li className="pl-2">
                                    <strong className="text-lg text-black">Clúster "RRSS" (Foco de Marketing y Volumen):</strong><br />
                                    Recopila el tráfico tibio. Todos los usuarios que pasaron por una Micro-App generada para regalar algo. Ideal para embudos pasivos, leads masivos y ventas de bajo valor (Retargeting directo).
                                </li>
                                <li className="pl-2">
                                    <strong className="text-lg text-black">Clúster "BecaRuta" (Core Talent y Datos Finos):</strong><br />
                                    El núcleo valioso de la empresa. Colecciona todos los movimientos exhaustivos de los ecosistemas BecaLab Focus, BecaMatch y los arquetipos avanzados de BecaMatch PRO. Es la materia prima pura que utilizaremos para empaquetar, filtrar minuciosamente y venderle al mercado B2B Internacional.
                                </li>
                                <li className="pl-2">
                                    <strong className="text-lg text-black">El Pitch de Venta Institucional:</strong><br />
                                    Nuestras Redes Sociales mostrarán Data, estadísticas, casos de éxitos absolutos y seriedad corporativa. Esto permite que la universidad extranjera al auditar la marca, asuma inmediatamente a BecaLab como el portador de la verdad de la industria educativa en Latinoamérica.
                                </li>
                            </ol>
                        </div>
                    </section>

                    {/* Sección 4 */}
                    <section>
                        <h2 className="text-3xl font-black flex items-center gap-3 pb-3 mb-4 text-[#312C8E] border-b-2 border-gray-100">
                            <span className="text-[#4B50D0] text-xl">04.</span> Vocería y Flujo de Contenidos
                        </h2>

                        <div className="pl-8 border-l-4 border-gray-100 ml-4 space-y-4 text-justify">
                            <div className="grid grid-cols-2 gap-8 mb-6">
                                <div className="bg-gray-50 border-t-4 border-[#312C8E] p-5 rounded-sm">
                                    <h3 className="font-bold text-xl text-black mb-2">Marca Personal (@ana.cosmica)</h3>
                                    <p className="text-[15px] text-gray-700 leading-relaxed">Arquetipo de mentora inspiradora. Es el gancho que acapara audiencias gigantes mediante casos reales, narrativas personales, storytelling de éxito aspiracional (vlogs, rutinas) y vulnerabilidad constante que genera una barrera de confianza indestructible.</p>
                                </div>
                                <div className="bg-gray-50 border-t-4 border-gray-400 p-5 rounded-sm">
                                    <h3 className="font-bold text-xl text-black mb-2">La Institución (@beca_lab)</h3>
                                    <p className="text-[15px] text-gray-700 leading-relaxed">El ente tecnológico imperturbable. Dicta cátedras, lanza datos masivos en carruseles densos y provee tutoriales exactos de la industria. Demuestra autoridad corporativa para poder transitar al usuario de "Espectador emocionado" a "Cliente BecaLab+".</p>
                                </div>
                            </div>

                            <p className="text-[17px] leading-relaxed text-center bg-gray-50 py-4 font-medium border border-gray-200">
                                <strong>El Ciclo Inquebrantable:</strong><br />
                                <span className="text-[#4B50D0]">Atención Centralizada</span> (El Post de Ana) → <span className="text-[#4B50D0]">Captación de la necesidad</span> (ManyChat y Micro-App recogiendo Base de Datos) → <span className="text-[#4B50D0]">Conversión final</span> (Upsell y entrada al portal VIP).
                            </p>
                        </div>
                    </section>
                </div>

                <div className="text-center pt-16 mt-16 border-t font-mono text-gray-400 text-xs">
                    <p className="mb-2 uppercase tracking-widest text-[#312C8E]/40 font-bold">Documento Ejecutivo Estrictamente Confidencial</p>
                    <p>Propiedad Intelectual Limitada - BecaLab x CONEXAR 2026</p>
                    <p className="mt-1">Generado vía BecaLab Admin Panel</p>
                </div>
            </div>
        </div>
    )
}
