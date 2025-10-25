'use client'

import { useState } from 'react'

type Patient = {
  id: string
  name: string
  age: number
  lastActive: Date
  status: 'active' | 'waiting' | 'completed'
  unreadMessages: number
  avatar?: string
}

type AnalysisBlock = {
  id: string
  label: string
  content: string
  concernLevel: 'low' | 'medium' | 'high' | 'critical'
  conversationDate: Date
}

type FormResponse = {
  id: string
  formTitle: string
  submittedDate: Date
  responses: {
    question: string
    answer: string | boolean
  }[]
}

type Analysis = {
  patientId: string
  blocks: AnalysisBlock[]
  medications: string[]
  forms: FormResponse[]
  lastUpdated: Date
}

type Message = {
  id: string
  content: string
  sender: 'doctor' | 'patient'
  timestamp: Date
}

const mockPatients: Patient[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    age: 34,
    lastActive: new Date(),
    status: 'active',
    unreadMessages: 2,
  },
  {
    id: '2',
    name: 'Michael Chen',
    age: 45,
    lastActive: new Date(Date.now() - 3600000),
    status: 'waiting',
    unreadMessages: 0,
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    age: 28,
    lastActive: new Date(Date.now() - 7200000),
    status: 'active',
    unreadMessages: 1,
  },
  {
    id: '4',
    name: 'David Thompson',
    age: 52,
    lastActive: new Date(Date.now() - 86400000),
    status: 'completed',
    unreadMessages: 0,
  },
  {
    id: '5',
    name: 'Jessica Williams',
    age: 41,
    lastActive: new Date(Date.now() - 172800000),
    status: 'waiting',
    unreadMessages: 3,
  },
]

const mockAnalyses: Record<string, Analysis> = {
  '1': {
    patientId: '1',
    blocks: [
      {
        id: 'a1',
        label: 'Persistent Headaches',
        content: 'Patient reports daily headaches for the past 2 weeks. Pain level ranges from 6-7/10, primarily located in frontal and temporal regions. No visual disturbances or aura reported. OTC pain medication providing minimal relief.',
        concernLevel: 'medium',
        conversationDate: new Date(Date.now() - 3600000),
      },
      {
        id: 'a2',
        label: 'Work-Related Stress',
        content: 'Patient mentioned work stress multiple times throughout conversation. Indicated increased workload and deadline pressure. May be contributing factor to headache frequency and intensity.',
        concernLevel: 'medium',
        conversationDate: new Date(Date.now() - 7200000),
      },
      {
        id: 'a3',
        label: 'Medication Ineffectiveness',
        content: 'Over-the-counter pain medication (Ibuprofen 400mg, Acetaminophen 500mg) not providing adequate relief. Patient taking medication multiple times daily. Potential for medication overuse headache.',
        concernLevel: 'high',
        conversationDate: new Date(Date.now() - 10800000),
      },
    ],
    medications: [
      'Ibuprofen 400mg (self-administered, multiple times daily)',
      'Acetaminophen 500mg (occasional use)',
    ],
    forms: [
      {
        id: 'f1',
        formTitle: 'Health Questionnaire',
        submittedDate: new Date(Date.now() - 86400000),
        responses: [
          { question: 'Do you have any allergies to medications?', answer: false },
          { question: 'Are you currently taking any medications?', answer: true },
          { question: 'Do you have a history of heart disease?', answer: false },
          { question: 'Do you have diabetes?', answer: false },
          { question: 'Have you had any surgeries in the past year?', answer: false },
          { question: 'Do you smoke or use tobacco products?', answer: false },
          { question: 'Do you consume alcohol regularly?', answer: false },
          { question: 'Are you experiencing any pain currently?', answer: true },
        ],
      },
    ],
    lastUpdated: new Date(),
  },
  '2': {
    patientId: '2',
    blocks: [
      {
        id: 'b1',
        label: 'Exercise-Induced Chest Discomfort',
        content: 'Patient experiencing chest tightness during physical activity. Symptoms last 5-10 minutes and resolve with rest. No radiation to arms or jaw. Started approximately 3 weeks ago when beginning new exercise routine.',
        concernLevel: 'high',
        conversationDate: new Date(Date.now() - 3600000),
      },
      {
        id: 'b2',
        label: 'Family History - Cardiovascular Disease',
        content: 'Significant family history: father had myocardial infarction at age 55. Patient is 45 years old. Combined with current symptoms, warrants cardiovascular assessment.',
        concernLevel: 'critical',
        conversationDate: new Date(Date.now() - 7200000),
      },
      {
        id: 'b3',
        label: 'Hypertension Management',
        content: 'Patient currently on Lisinopril 10mg for hypertension. Blood pressure appears controlled per patient report. Regular monitoring ongoing.',
        concernLevel: 'low',
        conversationDate: new Date(Date.now() - 86400000),
      },
    ],
    medications: [
      'Lisinopril 10mg daily (prescribed for hypertension)',
    ],
    forms: [
      {
        id: 'f3',
        formTitle: 'Cardiovascular Risk Assessment',
        submittedDate: new Date(Date.now() - 172800000),
        responses: [
          { question: 'Family history of heart disease?', answer: true },
          { question: 'Do you smoke?', answer: false },
          { question: 'High blood pressure?', answer: true },
          { question: 'High cholesterol?', answer: true },
          { question: 'Exercise regularly?', answer: true },
          { question: 'Chest pain or discomfort?', answer: true },
        ],
      },
    ],
    lastUpdated: new Date(Date.now() - 3600000),
  },
  '3': {
    patientId: '3',
    blocks: [
      {
        id: 'c1',
        label: 'Sleep Disturbance',
        content: 'Significant insomnia for past month. Patient wakes 3-4 times per night and takes over 1 hour to fall asleep. Sleep quality poor, leading to daytime fatigue and irritability.',
        concernLevel: 'medium',
        conversationDate: new Date(Date.now() - 7200000),
      },
      {
        id: 'c2',
        label: 'Anxiety Symptoms',
        content: 'Patient reports increased anxiety related to recent job change. No previous history of anxiety disorders or mental health treatment. Symptoms affecting daily function and sleep quality.',
        concernLevel: 'medium',
        conversationDate: new Date(Date.now() - 10800000),
      },
      {
        id: 'c3',
        label: 'No Current Treatment',
        content: 'Patient not currently on any medications. No previous mental health interventions. May benefit from both pharmacological and non-pharmacological approaches.',
        concernLevel: 'low',
        conversationDate: new Date(Date.now() - 14400000),
      },
    ],
    medications: [],
    forms: [
      {
        id: 'f4',
        formTitle: 'Mental Health Screening',
        submittedDate: new Date(Date.now() - 259200000),
        responses: [
          { question: 'Feeling nervous, anxious, or on edge?', answer: 'Often' },
          { question: 'Not being able to stop or control worrying?', answer: 'Sometimes' },
          { question: 'Trouble falling or staying asleep?', answer: 'Often' },
          { question: 'Feeling tired or having little energy?', answer: 'Often' },
          { question: 'Little interest or pleasure in doing things?', answer: 'Sometimes' },
          { question: 'Previous mental health treatment?', answer: false },
        ],
      },
    ],
    lastUpdated: new Date(Date.now() - 7200000),
  },
}

const mockMessages: Record<string, Message[]> = {
  '1': [
    { id: '1', content: 'Hello Doctor, my headaches have been getting worse.', sender: 'patient', timestamp: new Date(Date.now() - 7200000) },
    { id: '2', content: 'I can see from your reports. Can you describe the pain for me?', sender: 'doctor', timestamp: new Date(Date.now() - 7000000) },
    { id: '3', content: 'It feels like a constant pressure on my forehead and temples. Sometimes it throbs.', sender: 'patient', timestamp: new Date(Date.now() - 6800000) },
  ],
  '2': [],
  '3': [],
}

export function DoctorDashboard() {
  const [selectedPatient, setSelectedPatient] = useState<string>(mockPatients[0].id)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isNotesOpen, setIsNotesOpen] = useState(false)
  const [inputMessage, setInputMessage] = useState('')
  const [messages, setMessages] = useState<Record<string, Message[]>>(mockMessages)
  const [notes, setNotes] = useState<Record<string, string>>({
    '1': 'Patient reports increased stress levels. Consider stress management techniques.\n\nFollow-up needed on headache medication effectiveness.',
    '2': 'Urgent: Schedule cardiovascular assessment.\n\nFamily history significant for early MI. Patient exercises regularly but experiencing symptoms.',
    '3': 'Referred for sleep study. Discuss cognitive behavioral therapy for insomnia.\n\nMonitor anxiety symptoms - new job transition.',
  })
  const [noteInput, setNoteInput] = useState('')

  const currentPatient = mockPatients.find(p => p.id === selectedPatient)
  const currentAnalysis = selectedPatient ? mockAnalyses[selectedPatient] : null
  const currentMessages = selectedPatient ? messages[selectedPatient] || [] : []
  const currentNote = selectedPatient ? notes[selectedPatient] || '' : ''

  // Initialize note input when patient changes
  useState(() => {
    if (selectedPatient) {
      setNoteInput(notes[selectedPatient] || '')
    }
  })

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !selectedPatient) return

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'doctor',
      timestamp: new Date(),
    }

    setMessages(prev => ({
      ...prev,
      [selectedPatient]: [...(prev[selectedPatient] || []), newMessage],
    }))

    setInputMessage('')
  }

  const handleSaveNotes = () => {
    if (!selectedPatient) return

    setNotes(prev => ({
      ...prev,
      [selectedPatient]: noteInput,
    }))
  }

  const getStatusColor = (status: Patient['status']) => {
    switch (status) {
      case 'active':
        return 'bg-health-success text-white'
      case 'waiting':
        return 'bg-health-warning text-white'
      case 'completed':
        return 'bg-health-gray text-white'
      default:
        return 'bg-gray-300 text-gray-700'
    }
  }

  const getConcernLevelStyle = (level: AnalysisBlock['concernLevel']) => {
    switch (level) {
      case 'low':
        return {
          badge: 'bg-health-success/10 text-health-success border-health-success/20',
          border: 'border-l-health-success',
          icon: 'text-health-success',
        }
      case 'medium':
        return {
          badge: 'bg-health-warning/10 text-health-warning border-health-warning/20',
          border: 'border-l-health-warning',
          icon: 'text-health-warning',
        }
      case 'high':
        return {
          badge: 'bg-orange-100 text-orange-600 border-orange-200',
          border: 'border-l-orange-500',
          icon: 'text-orange-500',
        }
      case 'critical':
        return {
          badge: 'bg-red-100 text-red-600 border-red-200',
          border: 'border-l-red-500',
          icon: 'text-red-500',
        }
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (hours < 1) return 'Just now'
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <div className="flex h-screen bg-health-light">
      {/* Patient List Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-health-primary/10 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-health-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-health-dark">Patients</h1>
              <p className="text-xs text-health-gray">{mockPatients.length} total</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-health-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search patients..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-health-primary/20 focus:border-health-primary transition-colors text-sm"
            />
          </div>
        </div>

        {/* Patient List */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {mockPatients.map(patient => (
            <div
              key={patient.id}
              onClick={() => {
                setSelectedPatient(patient.id)
                setIsChatOpen(false)
              }}
              className={`p-4 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 ${selectedPatient === patient.id ? 'bg-health-light border-l-4 border-l-health-primary' : ''
                }`}
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="w-12 h-12 bg-health-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-health-primary font-semibold text-sm">
                    {patient.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-semibold text-sm text-health-dark truncate">{patient.name}</h3>
                    {patient.unreadMessages > 0 && (
                      <span className="ml-2 bg-health-primary text-white text-xs px-2 py-0.5 rounded-full">
                        {patient.unreadMessages}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-health-gray mb-2">{patient.age} years old</p>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(patient.status)}`}>
                      {patient.status}
                    </span>
                    <span className="text-xs text-health-gray">{formatTime(patient.lastActive)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex">
        {/* Analysis Panel */}
        <div className={`${isChatOpen || isNotesOpen ? 'w-1/2' : 'flex-1'} flex flex-col transition-all duration-300`}>
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-health-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-health-primary font-semibold">
                    {currentPatient?.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h2 className="font-semibold text-health-dark">{currentPatient?.name}</h2>
                  <p className="text-xs text-health-gray">AI Analysis Overview</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsNotesOpen(!isNotesOpen)
                    setIsChatOpen(false)
                    if (!isNotesOpen && selectedPatient) {
                      setNoteInput(notes[selectedPatient] || '')
                    }
                  }}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium ${isNotesOpen
                      ? 'bg-health-accent text-white'
                      : 'bg-white border border-gray-200 text-health-dark hover:bg-gray-50'
                    }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  {isNotesOpen ? 'Close Notes' : 'Notes'}
                </button>
                <button
                  onClick={() => {
                    setIsChatOpen(!isChatOpen)
                    setIsNotesOpen(false)
                  }}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium ${isChatOpen
                      ? 'bg-health-primary text-white'
                      : 'bg-health-primary text-white hover:bg-health-secondary'
                    }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  {isChatOpen ? 'Close Chat' : 'Chat with Patient'}
                </button>
              </div>
            </div>
          </div>

          {/* Analysis Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            {currentAnalysis ? (
              <>
                {/* Analysis Blocks */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-semibold text-health-dark uppercase tracking-wide">AI Analysis</h3>
                    <span className="text-xs text-health-gray">
                      {currentAnalysis.blocks.length} {currentAnalysis.blocks.length === 1 ? 'insight' : 'insights'}
                    </span>
                  </div>

                  {currentAnalysis.blocks.map((block) => {
                    const style = getConcernLevelStyle(block.concernLevel)
                    return (
                      <div
                        key={block.id}
                        className={`bg-white rounded-lg border-l-4 border-r border-t border-b border-gray-200 ${style.border} p-3 shadow-sm hover:shadow transition-shadow`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <svg className={`w-4 h-4 flex-shrink-0 ${style.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h4 className="font-semibold text-health-dark text-sm truncate">{block.label}</h4>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${style.badge} whitespace-nowrap`}>
                            {block.concernLevel.charAt(0).toUpperCase() + block.concernLevel.slice(1)}
                          </span>
                        </div>
                        <p className="text-sm text-health-gray leading-relaxed mb-2">{block.content}</p>
                        <div className="flex items-center gap-1.5 text-xs text-health-gray/80">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <span>Conversation from {formatTime(block.conversationDate)}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Medications Section */}
                <div className="mt-6">
                  <h3 className="text-xs font-semibold text-health-dark uppercase tracking-wide mb-3">Medications</h3>
                  <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="w-4 h-4 text-health-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                      <h4 className="font-semibold text-health-dark text-sm">Self-Reported</h4>
                    </div>
                    {currentAnalysis.medications.length > 0 ? (
                      <ul className="space-y-2">
                        {currentAnalysis.medications.map((med, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-health-gray p-2 bg-health-light rounded">
                            <span className="w-1.5 h-1.5 bg-health-accent rounded-full mt-1.5 flex-shrink-0"></span>
                            <span className="flex-1">{med}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-center py-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <svg className="w-5 h-5 text-health-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                        </div>
                        <p className="text-xs text-health-gray italic">No medications reported</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Forms Section */}
                <div className="mt-6">
                  <h3 className="text-xs font-semibold text-health-dark uppercase tracking-wide mb-3">Latest Form Response</h3>
                  {currentAnalysis.forms.length > 0 ? (
                    (() => {
                      // Get the most recent form
                      const mostRecentForm = currentAnalysis.forms.reduce((latest, current) =>
                        current.submittedDate > latest.submittedDate ? current : latest
                      )

                      return (
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                          {/* Form Header */}
                          <div className="bg-health-light border-b border-gray-200 px-3 py-2.5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-health-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <h4 className="font-semibold text-health-dark text-sm">{mostRecentForm.formTitle}</h4>
                              </div>
                              <span className="text-xs text-health-gray">
                                {mostRecentForm.submittedDate.toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          {/* Form Responses */}
                          <div className="p-3 space-y-2">
                            {mostRecentForm.responses.map((response, index) => (
                              <div key={index} className="flex items-start justify-between gap-3 py-2 border-b border-gray-100 last:border-0">
                                <span className="text-sm text-health-gray flex-1">{response.question}</span>
                                <span className={`text-sm font-medium flex-shrink-0 ${typeof response.answer === 'boolean'
                                    ? response.answer
                                      ? 'text-health-success'
                                      : 'text-health-gray'
                                    : 'text-health-dark'
                                  }`}>
                                  {typeof response.answer === 'boolean'
                                    ? response.answer
                                      ? 'Yes'
                                      : 'No'
                                    : response.answer}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })()
                  ) : (
                    <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <svg className="w-5 h-5 text-health-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <p className="text-xs text-health-gray italic">No forms submitted</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-16 h-16 bg-health-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-8 h-8 text-health-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-health-gray font-medium">Select a patient to view analysis</p>
                  <p className="text-health-gray text-sm mt-1">AI-generated insights will appear here</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chat Panel */}
        {isChatOpen && (
          <div className="w-1/2 border-l border-gray-200 flex flex-col bg-white">
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-health-accent/10 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-health-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-health-dark">Chat with {currentPatient?.name}</h3>
                    <p className="text-xs text-health-gray">Direct messaging</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="text-health-gray hover:text-health-dark transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
              {currentMessages.length > 0 ? (
                currentMessages.map(message => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.sender === 'doctor' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.sender === 'patient' && (
                      <div className="w-8 h-8 bg-health-primary rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-semibold">
                          {currentPatient?.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                    )}

                    <div
                      className={`max-w-md px-4 py-3 rounded-2xl ${message.sender === 'doctor'
                          ? 'bg-health-primary text-white rounded-tr-none'
                          : 'bg-white border border-gray-200 text-health-dark rounded-tl-none'
                        }`}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      <p className={`text-xs mt-1 ${message.sender === 'doctor' ? 'text-white/70' : 'text-health-gray'}`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    {message.sender === 'doctor' && (
                      <div className="w-8 h-8 bg-health-accent rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-health-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-8 h-8 text-health-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <p className="text-health-gray text-sm">No messages yet</p>
                    <p className="text-health-gray text-xs mt-1">Start a conversation with {currentPatient?.name}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex gap-3 items-end">
                <div className="flex-1 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-health-primary transition-colors">
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
                    className="w-full px-4 py-3 bg-transparent resize-none focus:outline-none text-sm"
                    rows={2}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                  className="bg-health-primary text-white p-3 rounded-xl hover:bg-health-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notes Panel */}
        {isNotesOpen && (
          <div className="w-1/2 border-l border-gray-200 flex flex-col bg-white">
            {/* Notes Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-health-accent/10 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-health-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-health-dark">Clinical Notes</h3>
                    <p className="text-xs text-health-gray">{currentPatient?.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsNotesOpen(false)}
                  className="text-health-gray hover:text-health-dark transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Notes Content */}
            <div className="flex-1 flex flex-col p-6">
              <div className="flex-1 mb-4">
                <textarea
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="Add clinical notes about this patient..."
                  className="w-full h-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-health-accent/20 focus:border-health-accent transition-colors text-sm resize-none"
                />
              </div>

              <div className="flex items-center justify-between">
                <p className="text-xs text-health-gray">
                  {noteInput.length} characters
                </p>
                <button
                  onClick={handleSaveNotes}
                  className="bg-health-accent text-white px-4 py-2 rounded-lg hover:bg-health-accent/90 transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Notes
                </button>
              </div>

              {/* Saved indicator */}
              {currentNote === noteInput && noteInput.length > 0 && (
                <div className="mt-3 flex items-center gap-2 text-xs text-health-success">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Notes saved</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
