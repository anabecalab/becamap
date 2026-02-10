import { useState } from 'react'
import ContentMatrix from '../components/becacontent/ContentMatrix'
import NewIdeaForm from '../components/becacontent/NewIdeaForm'
import EditIdeaForm from '../components/becacontent/EditIdeaForm'
import ShootList from '../components/becacontent/ShootList'
import IdeasBoard from '../components/becacontent/IdeasBoard'
import IdeasFromMap from '../components/becacontent/IdeasFromMap'

export default function BecaContentPage() {
    const [activeTab, setActiveTab] = useState('matriz')
    const [showNewIdeaForm, setShowNewIdeaForm] = useState(false)
    const [showEditIdeaForm, setShowEditIdeaForm] = useState(false)
    const [refreshKey, setRefreshKey] = useState(0)
    const [prefilledIdea, setPrefilledIdea] = useState(null)
    const [editingContent, setEditingContent] = useState(null)

    const handleSuccess = () => {
        setRefreshKey(prev => prev + 1)
    }

    const handleConvertToContent = (idea) => {
        // Prefill form with idea data
        setPrefilledIdea(idea)
        setShowNewIdeaForm(true)
    }

    const handleEditContent = (content) => {
        setEditingContent(content)
        setShowEditIdeaForm(true)
    }

    const tabs = [
        { id: 'matriz', label: 'Matriz de Contenido', icon: '📊' },
        { id: 'ideas', label: 'Ideas para Nuevo Contenido', icon: '💡' },
        { id: 'map-ideas', label: 'Ideas desde Map', icon: '🗺️' },
        { id: 'shoot', label: 'Shoot List', icon: '🎬' },
    ]

    return (
        <div className="flex-1 overflow-auto">
            {/* Header */}
            <header className="sticky top-0 z-10 shadow-sm border-b border-gray-200" style={{ backgroundColor: '#312C8E' }}>
                <div className="px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-white">BecaContent</h1>
                            <p className="mt-1 text-sm" style={{ color: '#D5ED86' }}>
                                Sistema de gestión estratégica de contenido
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                setPrefilledIdea(null)
                                setShowNewIdeaForm(true)
                            }}
                            className="px-6 py-3 rounded-lg font-semibold text-white transition-all hover:scale-105"
                            style={{ backgroundColor: '#D5ED86', color: '#312C8E' }}
                        >
                            ✨ Nueva Idea
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="mt-6 flex gap-2 flex-wrap">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === tab.id
                                    ? 'text-white'
                                    : 'text-white/70 hover:text-white hover:bg-white/10'
                                    }`}
                                style={activeTab === tab.id ? { backgroundColor: '#4B50D0' } : {}}
                            >
                                <span className="mr-2">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Content */}
            <div className="p-6">
                {activeTab === 'matriz' && <ContentMatrix key={refreshKey} onEditClick={handleEditContent} />}
                {activeTab === 'ideas' && <IdeasBoard key={refreshKey} onConvertToContent={handleConvertToContent} />}
                {activeTab === 'map-ideas' && <IdeasFromMap key={refreshKey} />}
                {activeTab === 'shoot' && <ShootList key={refreshKey} />}
            </div>

            {/* New Idea Form Modal */}
            <NewIdeaForm
                isOpen={showNewIdeaForm}
                onClose={() => {
                    setShowNewIdeaForm(false)
                    setPrefilledIdea(null)
                }}
                onSuccess={handleSuccess}
                prefilledData={prefilledIdea}
            />

            {/* Edit Idea Form Modal */}
            <EditIdeaForm
                isOpen={showEditIdeaForm}
                onClose={() => {
                    setShowEditIdeaForm(false)
                    setEditingContent(null)
                }}
                onSuccess={handleSuccess}
                contentData={editingContent}
            />
        </div>
    )
}
