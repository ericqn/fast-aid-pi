'use client'

import { AuthModal } from '@/components/AuthModal'
import { Questionnaire } from '@/components/Questionnaire'
import { useState } from 'react'

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
      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  )
}
