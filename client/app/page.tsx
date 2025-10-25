'use client'

import { AuthModal } from '@/components/AuthModal'
import { Questionnaire } from '@/components/Questionnaire'
import { useEffect, useState } from 'react'

type Message = {
  id: string
  content: string | React.ReactNode
  role: 'user' | 'assistant'
  timestamp: Date
}

type Chat = {
  id: string
  title: string
  messages: Message[]
  lastUpdated: Date
}

type ActionItem = {
  id: string
  title: string
  description: string
  priority: 'urgent' | 'high' | 'normal'
  createdAt: Date
}

export default function Home() {
  const [chats, setChats] = useState<Chat[]>([
    {
      id: '1',
      title: 'Medication Questions',
      messages: [
        { id: '1', content: 'Hello! How can I help you today?', role: 'assistant', timestamp: new Date() }
      ],
      lastUpdated: new Date()
    }
  ])

  const [activeChat, setActiveChat] = useState<string>('1')
  const [inputMessage, setInputMessage] = useState('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  const [actionItems, setActionItems] = useState<ActionItem[]>([
    {
      id: '1',
      title: 'Schedule Follow-up Appointment',
      description: 'Book a follow-up appointment to discuss your test results and treatment plan.',
      priority: 'high',
      createdAt: new Date(Date.now() - 3600000),
    },
    {
      id: '2',
      title: 'Update Medication List',
      description: 'Please update your current medications in your health profile.',
      priority: 'normal',
      createdAt: new Date(Date.now() - 7200000),
    },
    {
      id: '3',
      title: 'Complete Health Questionnaire',
      description: 'Fill out the pre-visit questionnaire before your next appointment.',
      priority: 'normal',
      createdAt: new Date(Date.now() - 86400000),
    },
  ]);

  // Set right sidebar open on desktop by default
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) { // lg breakpoint
        setIsRightSidebarOpen(true)
      } else {
        setIsRightSidebarOpen(false)
      }
    }

    // Set initial state
    handleResize()

    // Add event listener
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => window.removeEventListener('resize', handleResize)
  }, []);

  const currentChat = chats.find(chat => chat.id === activeChat)

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !activeChat) return

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      role: 'user',
      timestamp: new Date()
    }

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: 'Thank you for your message. This is a demo response from your healthcare assistant.',
      role: 'assistant',
      timestamp: new Date()
    }

    setChats(chats.map(chat =>
      chat.id === activeChat
        ? {
          ...chat,
          messages: [...chat.messages, newMessage, assistantMessage],
          lastUpdated: new Date()
        }
        : chat
    ))

    setInputMessage('')
  }

  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: 'New Conversation',
      messages: [
        { id: '1', content: 'Hello! How can I assist you today?', role: 'assistant', timestamp: new Date() },
        { id: 'questionaire', content: <Questionnaire />, role: 'assistant', timestamp: new Date() }
      ],
      lastUpdated: new Date()
    }
    setChats([newChat, ...chats])
    setActiveChat(newChat.id)
  }

  const deleteChat = (chatId: string) => {
    const filteredChats = chats.filter(chat => chat.id !== chatId)
    setChats(filteredChats)
    if (activeChat === chatId && filteredChats.length > 0) {
      setActiveChat(filteredChats[0].id)
    }
  }

  const deleteActionItem = (actionId: string) => {
    setActionItems(actionItems.filter(item => item.id !== actionId))
  }

  const getPriorityColor = (priority: ActionItem['priority']) => {
    switch (priority) {
      case 'urgent':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-700',
          badge: 'bg-red-100 text-red-700',
        }
      case 'high':
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          text: 'text-orange-700',
          badge: 'bg-orange-100 text-orange-700',
        }
      case 'normal':
        return {
          bg: 'bg-health-primary/5',
          border: 'border-health-primary/20',
          text: 'text-health-primary',
          badge: 'bg-health-primary/10 text-health-primary',
        }
    }
  }

  return (
    <div className="flex h-screen bg-health-light">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-72' : 'w-0'} bg-white border-r border-gray-200 transition-all duration-300 overflow-hidden flex flex-col`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-health-primary flex text-wrap items-center gap-2">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Chats
            </h1>
          </div>
          <button
            onClick={createNewChat}
            className="w-full bg-health-primary text-white px-2 py-2 rounded-lg hover:bg-health-secondary transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Chat
          </button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {chats.map(chat => (
            <div
              key={chat.id}
              onClick={() => setActiveChat(chat.id)}
              className={`p-4 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 group ${activeChat === chat.id ? 'bg-health-light border-l-4 border-l-health-primary' : ''
                }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm text-health-dark truncate">{chat.title}</h3>
                  <p className="text-xs text-health-gray mt-1">
                    {chat.messages.length} messages
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteChat(chat.id)
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 text-gray-400 hover:text-red-500"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="w-full bg-health-primary text-white px-4 py-2.5 rounded-lg hover:bg-health-secondary transition-colors flex items-center justify-center gap-2 font-medium text-sm"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Sign In / Sign Up
          </button>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3 text-xs text-health-gray">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Healthcare AI Assistant</span>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-health-gray hover:text-health-primary transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-3">
            <div>
              <h2 className="font-semibold text-health-dark">{currentChat?.title || 'Select a chat'}</h2>
              <p className="text-xs text-health-gray">Medical Assistant</p>
            </div>
          </div>

        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {currentChat?.messages.map(message => (
            <div
              key={message.id}
              className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 bg-health-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
              )}

              <div
                className={`max-w-2xl px-5 py-3 rounded-2xl ${message.role === 'user'
                  ? 'bg-health-primary text-white rounded-tr-none'
                  : 'bg-white border border-gray-200 text-health-dark rounded-tl-none shadow-sm'
                  }`}
              >
                {typeof message.content === "string" ?
                  <p className="text-sm leading-relaxed">{message.content as String}</p> : <>{message.content}</>
                }
              </div>

              {message.role === 'user' && (
                <div className="w-8 h-8 bg-health-accent rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3 items-end">
              <div className="flex-1 bg-gray-50 rounded-2xl border border-gray-200 focus-within:border-health-primary transition-colors">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  placeholder="Type your message..."
                  className="w-full px-5 py-4 bg-transparent resize-none focus:outline-none text-sm"
                  rows={1}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
                className="bg-health-primary text-white p-4 rounded-2xl hover:bg-health-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-health-gray text-center mt-3">
              This is a demo healthcare chat assistant. Always consult with healthcare professionals for medical advice.
            </p>
          </div>
        </div>
      </div>

      {/* Backdrop for mobile sidebar */}
      {isRightSidebarOpen && (
        <div
          onClick={() => setIsRightSidebarOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
        />
      )}

      {/* Floating Actions Button - Mobile Only */}
      {!isRightSidebarOpen && (
        <button
          onClick={() => setIsRightSidebarOpen(true)}
          className="lg:hidden fixed bottom-3 right-2 z-40 bg-health-primary text-white px-6 py-3 rounded-full shadow-lg hover:bg-health-secondary transition-all duration-300 flex items-center gap-2 font-medium text-sm hover:shadow-xl"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Actions
        </button>
      )}


      {/* Right Sidebar - Call to Action */}
      <div className={`${isRightSidebarOpen
        ? 'fixed inset-y-0 right-0 w-full lg:relative lg:w-80 translate-x-0'
        : 'fixed inset-y-0 right-0 w-full lg:relative lg:w-80 translate-x-full lg:translate-x-0'
        } bg-white border-l border-gray-200 transition-transform duration-300 ease-in-out flex flex-col z-50 lg:z-auto shadow-xl lg:shadow-none`}>
        {/* Header with close button */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-health-light">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-health-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <h3 className="font-semibold text-health-dark">Quick Actions</h3>
          </div>
          <button
            onClick={() => setIsRightSidebarOpen(false)}
            className="lg:hidden text-health-gray hover:text-health-dark transition-colors p-1 hover:bg-white rounded"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Action Items Header */}
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-health-gray">
              {actionItems.length} {actionItems.length === 1 ? 'action' : 'actions'}
            </p>
          </div>

          {/* Action Items List */}
          {actionItems.length > 0 ? (
            <div className="space-y-3">
              {actionItems.map((item) => {
                const colors = getPriorityColor(item.priority)
                return (
                  <div
                    key={item.id}
                    className={`${colors.bg} border ${colors.border} rounded-xl p-4 transition-all hover:shadow-md`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-health-dark text-sm">{item.title}</h4>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${colors.badge} font-medium uppercase`}>
                            {item.priority}
                          </span>
                        </div>
                        <p className="text-sm text-health-gray leading-relaxed">{item.description}</p>
                      </div>
                      <button
                        onClick={() => deleteActionItem(item.id)}
                        className="flex-shrink-0 text-health-gray hover:text-red-500 transition-colors p-1 hover:bg-white rounded"
                        title="Delete action"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-health-gray mt-2">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-health-primary/10 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-health-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h4 className="font-semibold text-health-dark mb-2">No Actions Yet</h4>
              <p className="text-sm text-health-gray max-w-xs">
                Your AI assistant will suggest actions based on your conversations.
              </p>
            </div>
          )}

          {/* Emergency Contact - Always at bottom */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-red-900 text-sm">Emergency</h4>
                  <p className="text-xs text-red-700">Call 911 for emergencies</p>
                </div>
              </div>
              <button className="w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors font-medium text-sm">
                Emergency Services
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  )
}
