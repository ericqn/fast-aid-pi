'use client'

import { useAuth } from '@/components/AuthContext'
import { AuthModal } from '@/components/AuthModal'
import { InlineMarkdownRenderer } from '@/components/MarkdownParser'
import { Questionnaire } from '@/components/Questionnaire'
import { UserProfile } from '@/components/UserProfile'
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

type ConversationResponse = {
  id: string
  patient_id: number
  doctor_id?: number | null
  title: string
  created_at: string
  updated_at: string
}

type PrediagnosisResponse = {
  id: number
  conversation_id: string
  patient_id: number
  potential_diseases: string
  course_of_action: string
  support_messages: string
  recommended_practitioners: string
  created_at: string
}

export default function Home() {
  const [chats, setChats] = useState<Chat[]>([])
  const { user, isAuthenticated, token, isLoading: authLoading } = useAuth()
  const [activeChat, setActiveChat] = useState<string>('')
  const [inputMessage, setInputMessage] = useState('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [loadedConversations, setLoadedConversations] = useState<Set<string>>(new Set());
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isFinishedQuestionnaire, setIsFinishedQuestionnaire] = useState(false);
  const [isLoadingPrediagnoses, setIsLoadingPrediagnoses] = useState(false);
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



  // Fetch conversations from API
  const fetchConversations = async () => {
    setIsLoadingConversations(true);
    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_SERVER_ENDPOINT + '/api/conversations/',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch conversations: ${response.statusText}`);
      }

      const conversations: ConversationResponse[] = await response.json();

      // Create chats with empty messages
      const apiChats: Chat[] = conversations.map(conv => ({
        id: conv.id,
        title: conv.title,
        messages: [], // Will be loaded on demand
        lastUpdated: new Date(conv.updated_at)
      }));

      setChats(apiChats);

      // Set the first chat as active if available
      if (apiChats.length > 0) {
        setActiveChat(apiChats[0].id);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoadingConversations(false);
    }
  };
  const loadConversationMessages = async (conversationId: string) => {
    // Don't reload if already loaded
    if (loadedConversations.has(conversationId)) {
      return;
    }

    if (!token) return;
    setIsLoadingMessages(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/api/conversations/${conversationId}/messages`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load messages');
      }

      const messages = await response.json();

      // Transform messages
      const transformedMessages: Message[] = messages.map((msg: any) => ({
        id: msg.id,
        content: msg.content,
        role: msg.role,
        timestamp: new Date(msg.created_at),
      }));

      // Update the chat with loaded messages
      setChats(prevChats =>
        prevChats.map(chat =>
          chat.id === conversationId
            ? { ...chat, messages: transformedMessages }
            : chat
        )
      );

      // Mark as loaded
      setLoadedConversations(prev => new Set([...prev, conversationId]));
    } catch (error) {
      console.error('Error loading conversation messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Create a new conversation via API
  const createConversationAPI = async (title: string): Promise<ConversationResponse | null> => {
    if (!token) {
      console.log('No token available, cannot create conversation');
      return null;
    }

    try {
      const response = await fetch(process.env.NEXT_PUBLIC_SERVER_ENDPOINT + '/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ title }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create conversation: ${response.statusText}`);
      }

      const newConversation: ConversationResponse = await response.json();
      return newConversation;
    } catch (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
  };
  const fetchPrediagnoses = async () => {
    if (!token) return;

    setIsLoadingPrediagnoses(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/api/prediagnosis/my`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch prediagnoses');
      }

      const prediagnoses: PrediagnosisResponse[] = await response.json();

      // Transform prediagnoses into action items
      const transformedActions: ActionItem[] = prediagnoses.map((prediag) => ({
        id: prediag.id.toString(),
        title: 'Pre-diagnosis Result',
        description: prediag.course_of_action,
        priority: 'high' as const,
        createdAt: new Date(prediag.created_at),
      }));

      setActionItems(transformedActions);
    } catch (error) {
      console.error('Error fetching prediagnoses:', error);
    } finally {
      setIsLoadingPrediagnoses(false);
    }
  };

  // Load conversations when auth is ready and token is available
  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return;

    // Only fetch if user is authenticated
    if (isAuthenticated && token) {
      fetchConversations();
    } else {
      // Clear chats if user is not authenticated
      setChats([]);
    }
    if (isAuthenticated && token) {
      fetchPrediagnoses();
    }
  }, [authLoading, isAuthenticated, token]);

  // Load messages when active chat changes
  useEffect(() => {
    if (activeChat && token && isAuthenticated) {
      loadConversationMessages(activeChat);
    }
  }, [activeChat, token, isAuthenticated]);

  // Set right sidebar open on desktop by default
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) { // lg breakpoint
        setIsRightSidebarOpen(true);
        setIsSidebarOpen(true);
      } else {
        setIsRightSidebarOpen(false);
        setIsSidebarOpen(false);
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


  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !activeChat || !token) return;

    const userMessageContent = inputMessage;

    // Clear input immediately for better UX
    setInputMessage('');

    // Create user message object
    const newMessage: Message = {
      id: new Date().getTime().toString(),
      content: userMessageContent,
      role: 'user',
      timestamp: new Date()
    };

    // Add user message to UI immediately
    setChats(prevChats =>
      prevChats.map(chat =>
        chat.id === activeChat
          ? { ...chat, messages: [...chat.messages, newMessage], lastUpdated: new Date() }
          : chat
      )
    );

    try {
      // 1. Save user message to your backend
      const userMessageResponse = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/api/conversations/${activeChat}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            role: 'user',
            content: userMessageContent,
          }),
        }
      );

      if (!userMessageResponse.ok) {
        throw new Error('Failed to save user message to server');
      }

      const savedUserMessage = await userMessageResponse.json();

      // Update the user message with the server-generated ID
      setChats(prevChats =>
        prevChats.map(chat =>
          chat.id === activeChat
            ? {
              ...chat,
              messages: chat.messages.map(msg =>
                msg.id === newMessage.id
                  ? { ...msg, id: savedUserMessage.id || msg.id }
                  : msg
              ),
            }
            : chat
        )
      );

      // 2. Create placeholder for assistant message
      const assistantMessageId = (Date.now() + 1).toString();
      const assistantMessage: Message = {
        id: assistantMessageId,
        content: '',
        role: 'assistant',
        timestamp: new Date()
      };

      // Add placeholder assistant message to UI
      setChats(prevChats =>
        prevChats.map(chat =>
          chat.id === activeChat
            ? { ...chat, messages: [...chat.messages, assistantMessage] }
            : chat
        )
      );

      // 3. Get conversation history for context
      const currentChatMessages = chats.find(chat => chat.id === activeChat)?.messages || [];

      // Format messages for Anthropic API (include the new user message)
      const apiMessages = [...currentChatMessages, newMessage].map(msg => ({
        role: msg.role,
        content: typeof msg.content === 'string' ? msg.content : '',
      }));

      // 4. Call Anthropic API for AI response
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: apiMessages,
          conversationId: activeChat,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI');
      }

      // 5. Handle streaming response from Anthropic
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));

                if (data.text) {
                  fullContent += data.text;

                  // Update the assistant message with accumulated content in real-time
                  setChats(prevChats =>
                    prevChats.map(chat =>
                      chat.id === activeChat
                        ? {
                          ...chat,
                          messages: chat.messages.map(msg =>
                            msg.id === assistantMessageId
                              ? { ...msg, content: fullContent }
                              : msg
                          ),
                        }
                        : chat
                    )
                  );
                }

                if (data.error) {
                  throw new Error(data.error);
                }
              } catch (e) {
                // Ignore parsing errors for incomplete chunks
              }
            }
          }
        }
      }

      // 6. After streaming completes, save assistant message to your backend
      if (fullContent) {
        const assistantMessageResponse = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/api/conversations/${activeChat}/messages`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              role: 'assistant',
              content: fullContent,
            }),
          }
        );

        if (!assistantMessageResponse.ok) {
          console.error('Failed to save assistant message to server');
          // Don't throw here - the message is already displayed to the user
        } else {
          const savedAssistantMessage = await assistantMessageResponse.json();

          // Update the assistant message with the server-generated ID
          setChats(prevChats =>
            prevChats.map(chat =>
              chat.id === activeChat
                ? {
                  ...chat,
                  messages: chat.messages.map(msg =>
                    msg.id === assistantMessageId
                      ? {
                        ...msg,
                        id: savedAssistantMessage.id || msg.id,
                        timestamp: new Date(savedAssistantMessage.created_at || msg.timestamp)
                      }
                      : msg
                  ),
                }
                : chat
            )
          );
        }
      }

    } catch (error) {
      console.error('Error sending message:', error);

      // Show error message to user
      const errorMessageId = (Date.now() + 2).toString();
      const errorMessage: Message = {
        id: errorMessageId,
        content: 'Sorry, I encountered an error. Please try again.',
        role: 'assistant',
        timestamp: new Date()
      };

      setChats(prevChats =>
        prevChats.map(chat =>
          chat.id === activeChat
            ? {
              ...chat,
              messages: chat.messages.filter(msg => msg.content !== ''), // Remove empty placeholder
            }
            : chat
        )
      );

      // Add error message
      setChats(prevChats =>
        prevChats.map(chat =>
          chat.id === activeChat
            ? {
              ...chat,
              messages: [...chat.messages, errorMessage],
            }
            : chat
        )
      );
    }
  };

  const createNewChat = async () => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }

    // Create conversation via API
    const now = new Date();
    const newConversation = await createConversationAPI(`${now.toLocaleDateString()} ${now.getHours()}:${now.getMinutes()}`);

    if (newConversation) {
      // Create the initial greeting message
      const greetingMessage = {
        role: 'assistant',
        content: 'Hello! How can I assist you today?'
      };

      // Save the greeting message to backend
      try {
        const greetingResponse = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/api/conversations/${newConversation.id}/messages`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(greetingMessage),
          }
        );

        let savedGreetingId = '1';
        if (greetingResponse.ok) {
          const savedGreeting = await greetingResponse.json();
          savedGreetingId = savedGreeting.id;
        }

        // Add the new conversation to local state with initial greeting
        const newChat: Chat = {
          id: newConversation.id,
          title: newConversation.title,
          messages: [
            {
              id: savedGreetingId,
              content: 'Hello! How can I assist you today?',
              role: 'assistant',
              timestamp: new Date(newConversation.created_at)
            }
          ],
          lastUpdated: new Date(newConversation.updated_at)
        };

        setChats([newChat, ...chats]);
        setActiveChat(newChat.id);

        // Close sidebar on mobile
        if (window.innerWidth < 1024) {
          setIsSidebarOpen(false);
        }
      } catch (error) {
        console.error('Error saving greeting message:', error);

        // Still add the chat to UI even if greeting message save fails
        const newChat: Chat = {
          id: newConversation.id,
          title: newConversation.title,
          messages: [
            {
              id: '1',
              content: 'Hello! How can I assist you today?',
              role: 'assistant',
              timestamp: new Date(newConversation.created_at)
            }
          ],
          lastUpdated: new Date(newConversation.updated_at)
        };

        setChats([newChat, ...chats]);
        setActiveChat(newChat.id);

        if (window.innerWidth < 1024) {
          setIsSidebarOpen(false);
        }
      }
    } else {
      // Fallback to local-only chat if API fails
      const newChat: Chat = {
        id: Date.now().toString(),
        title: 'New Conversation',
        messages: [
          {
            id: '1',
            content: 'Hello! How can I assist you today?',
            role: 'assistant',
            timestamp: new Date()
          }
        ],
        lastUpdated: new Date()
      };

      setChats([newChat, ...chats]);
      setActiveChat(newChat.id);

      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      }
    }
  };
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
        {user ? <UserProfile /> :
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
        }
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
        {/* Buffer if messages are loading  */}
        {isLoadingMessages && currentChat?.messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-health-primary mx-auto mb-4"></div>
              <p className="text-health-gray">Loading messages...</p>
            </div>
          </div>
        )}
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
                  <InlineMarkdownRenderer content={message.content as string} /> : <>{message.content}</>
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
          {currentChat?.messages.length === 1 && (
            <Questionnaire onSubmit={() => setIsFinishedQuestionnaire(true)} conversationId={activeChat} />
          )}
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
                disabled={!inputMessage.trim() && !isFinishedQuestionnaire}
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
            {isLoadingPrediagnoses && (
              <span className="text-xs text-health-gray">Loading...</span>
            )}
          </div>

          {/* Action Items List */}
          {actionItems.length > 0 ? (
            <div className="space-y-3">
              {actionItems.map((item) => {
                return (
                  <div
                    key={item.id}
                    className="bg-green-50 border border-green-200 rounded-xl p-4 transition-all hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-health-dark text-sm">
                            {item.title} - {new Date(item.createdAt).toLocaleDateString()}
                          </h4>
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
