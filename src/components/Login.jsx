import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Login({ onLoginSuccess }) {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            // Call Supabase function to verify login
            const { data, error: loginError } = await supabase
                .rpc('verify_admin_login', {
                    username_input: username,
                    password_input: password
                })

            if (loginError) {
                console.error('Login error:', loginError)
                setError('Error de conexión. Por favor intenta de nuevo.')
                setLoading(false)
                return
            }

            if (!data || data.length === 0) {
                setError('Usuario o contraseña incorrectos')
                setLoading(false)
                return
            }

            // Login successful
            const user = data[0]
            console.log('✅ Login successful:', user.full_name)

            // Store user data in localStorage
            localStorage.setItem('admin_user', JSON.stringify(user))

            // Call success callback
            onLoginSuccess(user)
        } catch (err) {
            console.error('Unexpected error:', err)
            setError('Error inesperado. Por favor intenta de nuevo.')
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #312C8E 0%, #4B50D0 100%)' }}>
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
                {/* Logo/Header */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <img src="/logo.png" alt="BecaLab Logo" className="h-20 w-20" />
                    </div>
                    <h1 className="text-4xl font-bold mb-2" style={{ color: '#312C8E' }}>
                        BecaMap
                    </h1>
                    <p className="text-sm" style={{ color: '#4B50D0' }}>
                        Admin Panel
                    </p>
                    <div className="mt-2 text-xs text-gray-600">
                        La base de becas más grande de LATAM by BecaLab
                    </div>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                            Usuario
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all"
                            style={{ outlineColor: '#4B50D0' }}
                            placeholder="Ingresa tu usuario"
                            autoFocus
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                            Contraseña
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all"
                            style={{ outlineColor: '#4B50D0' }}
                            placeholder="Ingresa tu contraseña"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-lg font-semibold text-white transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        style={{
                            backgroundColor: '#4B50D0',
                            boxShadow: '0 4px 14px rgba(75, 80, 208, 0.4)'
                        }}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Verificando...
                            </span>
                        ) : (
                            'Iniciar Sesión'
                        )}
                    </button>
                </form>

                {/* Footer */}
                <div className="mt-6 text-center text-xs text-gray-500">
                    🔒 Acceso autorizado únicamente
                </div>
            </div>
        </div>
    )
}
