import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/layout/Sidebar'
import Login from './components/Login'
import DashboardHome from './pages/DashboardHome'
import BecaMapPage from './pages/BecaMapPage'
import BecaContentPage from './pages/BecaContentPage'
import RecursosPage from './pages/RecursosPage'
import ConexarOnboardingPage from './pages/ConexarOnboardingPage'
import ConexarContentPage from './pages/ConexarContentPage'

function App() {
    const [user, setUser] = useState(null)

    // Check for existing session on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('admin_user')
        if (storedUser) {
            setUser(JSON.parse(storedUser))
        }
    }, [])

    const handleLogout = () => {
        localStorage.removeItem('admin_user')
        setUser(null)
    }

    const handleLoginSuccess = (userData) => {
        setUser(userData)
    }

    // Show login if not authenticated
    if (!user) {
        return <Login onLoginSuccess={handleLoginSuccess} />
    }

    const isAgency = user.role === 'agency'

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar user={user} onLogout={handleLogout} />

            <Routes>
                {/* === ADMIN ROUTES (full access) === */}
                {!isAgency && (
                    <>
                        <Route path="/" element={<DashboardHome />} />
                        <Route path="/becamap" element={<BecaMapPage />} />
                        <Route path="/becacontent" element={<BecaContentPage />} />
                        <Route path="/recursos" element={<RecursosPage />} />
                    </>
                )}

                {/* === AGENCY ROUTES (CONEXAR only) === */}
                <Route path="/conexar-onboarding" element={<ConexarOnboardingPage />} />
                <Route path="/conexar-content" element={<ConexarContentPage />} />

                {/* === FALLBACK: redirect to role-appropriate home === */}
                <Route
                    path="*"
                    element={<Navigate to={isAgency ? '/conexar-onboarding' : '/'} replace />}
                />
            </Routes>
        </div>
    )
}

export default App
