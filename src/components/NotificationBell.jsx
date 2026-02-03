import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

export default function NotificationBell() {
    const [notifications, setNotifications] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const dropdownRef = useRef(null)

    // Fetch notifications
    const fetchNotifications = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase.functions.invoke('get-notifications', {
                body: {}
            })

            if (error) throw error

            if (data?.success) {
                setNotifications(data.notifications || [])
                setUnreadCount(data.unread_count || 0)
            }
        } catch (error) {
            console.error('Error fetching notifications:', error)
        } finally {
            setLoading(false)
        }
    }

    // Mark as read
    const markAsRead = async (notificationId) => {
        try {
            const { data, error } = await supabase.functions.invoke('get-notifications', {
                body: { action: 'mark_read', id: notificationId }
            })

            if (error) throw error

            // Update local state
            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
            )
            setUnreadCount(prev => Math.max(0, prev - 1))
        } catch (error) {
            console.error('Error marking notification as read:', error)
        }
    }

    // Dismiss notification
    const dismissNotification = async (notificationId) => {
        try {
            const { data, error } = await supabase.functions.invoke('get-notifications', {
                body: { action: 'dismiss', id: notificationId }
            })

            if (error) throw error

            // Update local state
            setNotifications(prev => prev.filter(n => n.id !== notificationId))
            const notification = notifications.find(n => n.id === notificationId)
            if (notification && !notification.is_read) {
                setUnreadCount(prev => Math.max(0, prev - 1))
            }
        } catch (error) {
            console.error('Error dismissing notification:', error)
        }
    }

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Fetch on mount and poll every 5 minutes
    useEffect(() => {
        fetchNotifications()
        const interval = setInterval(fetchNotifications, 5 * 60 * 1000) // 5 minutes
        return () => clearInterval(interval)
    }, [])

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 3:
                return 'bg-red-100 border-red-400 text-red-800'
            case 2:
                return 'bg-yellow-100 border-yellow-400 text-yellow-800'
            default:
                return 'bg-blue-100 border-blue-400 text-blue-800'
        }
    }

    const getPriorityIcon = (priority) => {
        switch (priority) {
            case 3:
                return '🔴'
            case 2:
                return '🟡'
            default:
                return '🔵'
        }
    }

    const getTypeIcon = (type) => {
        switch (type) {
            case 'prediction':
                return '📅'
            case 'broken_url':
                return '🔗'
            case 'status_change':
                return '🔄'
            default:
                return '🔔'
        }
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffMs = now - date
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMins / 60)
        const diffDays = Math.floor(diffHours / 24)

        if (diffMins < 60) return `${diffMins}m ago`
        if (diffHours < 24) return `${diffHours}h ago`
        if (diffDays < 7) return `${diffDays}d ago`
        return date.toLocaleDateString('es')
    }

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-white/10 transition-colors"
                aria-label="Notifications"
            >
                <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                </svg>

                {/* Badge */}
                {unreadCount > 0 && (
                    <span
                        className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white rounded-full"
                        style={{ backgroundColor: '#D5ED86', color: '#312C8E' }}
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[600px] overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200" style={{ backgroundColor: '#312C8E' }}>
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-white">Notificaciones</h3>
                            <button
                                onClick={fetchNotifications}
                                disabled={loading}
                                className="text-sm hover:underline disabled:opacity-50"
                                style={{ color: '#D5ED86' }}
                            >
                                {loading ? 'Cargando...' : 'Actualizar'}
                            </button>
                        </div>
                        {unreadCount > 0 && (
                            <p className="text-sm mt-1" style={{ color: '#D5ED86' }}>
                                {unreadCount} sin leer
                            </p>
                        )}
                    </div>

                    {/* Notifications List */}
                    <div className="overflow-y-auto flex-1">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <p className="text-4xl mb-2">📭</p>
                                <p className="font-medium">No hay notificaciones</p>
                                <p className="text-sm mt-1">Todo está al día!</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${!notification.is_read ? 'bg-blue-50' : ''
                                        }`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-lg">
                                                    {getTypeIcon(notification.notification_type)}
                                                </span>
                                                <span className="text-xs">
                                                    {getPriorityIcon(notification.priority)}
                                                </span>
                                                <h4 className="font-semibold text-sm text-gray-900">
                                                    {notification.title}
                                                </h4>
                                            </div>
                                            {notification.message && (
                                                <p className="text-sm text-gray-600 mb-2">
                                                    {notification.message}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                                <span>{formatDate(notification.created_at)}</span>
                                                {notification.scholarship_id && (
                                                    <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">
                                                        {notification.scholarship_id}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            {!notification.is_read && (
                                                <button
                                                    onClick={() => markAsRead(notification.id)}
                                                    className="text-xs text-blue-600 hover:text-blue-800"
                                                    title="Marcar como leído"
                                                >
                                                    ✓
                                                </button>
                                            )}
                                            <button
                                                onClick={() => dismissNotification(notification.id)}
                                                className="text-xs text-red-600 hover:text-red-800"
                                                title="Descartar"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
