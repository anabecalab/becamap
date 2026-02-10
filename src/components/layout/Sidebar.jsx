import { NavLink } from 'react-router-dom'
import { useState } from 'react'

export default function Sidebar({ user, onLogout }) {
    const [isOpen, setIsOpen] = useState(false)

    const navItems = [
        { path: '/', label: 'Dashboard', icon: '📊' },
        { path: '/becamap', label: 'BecaMap', icon: '🗺️' },
        { path: '/becacontent', label: 'BecaContent', icon: '✨' },
        { path: '/recursos', label: 'Recursos', icon: '📚' },
    ]

    return (
        <>
            {/* Mobile hamburger */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg text-white"
                style={{ backgroundColor: '#4B50D0' }}
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isOpen ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                </svg>
            </button>

            {/* Sidebar */}
            <div
                className={`fixed lg:static inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    }`}
                style={{ backgroundColor: '#312C8E' }}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="p-6 border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <img src="/logo.png" alt="BecaLab" className="w-10 h-10 rounded-lg" />
                            <div>
                                <h1 className="text-lg font-bold text-white">BecaLab</h1>
                                <p className="text-xs" style={{ color: '#D5ED86' }}>Admin Panel</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-2">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsOpen(false)}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                                        ? 'text-white font-semibold'
                                        : 'text-white/70 hover:text-white hover:bg-white/10'
                                    }`
                                }
                                style={({ isActive }) => (isActive ? { backgroundColor: '#4B50D0' } : {})}
                            >
                                <span className="text-xl">{item.icon}</span>
                                <span>{item.label}</span>
                            </NavLink>
                        ))}
                    </nav>

                    {/* User info */}
                    {user && (
                        <div className="p-4 border-t border-white/10">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#4B50D0' }}>
                                    <span className="text-white font-bold">{user.full_name?.[0] || 'A'}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">{user.full_name}</p>
                                    <p className="text-xs text-white/60 truncate">{user.username}</p>
                                </div>
                            </div>
                            <button
                                onClick={onLogout}
                                className="w-full px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105"
                                style={{ backgroundColor: '#D5ED86', color: '#312C8E' }}
                            >
                                Cerrar sesión
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    )
}
