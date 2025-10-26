'use client'

import { useState } from 'react'
import { useAuth } from './AuthContext'

type Symptom = {
  id: string
  text: string
  category?: string
}

type SymptomAnswer = {
  symptomId: string
  hasSymptom: boolean | null
}

const symptoms: Symptom[] = [
  { id: 's1', text: 'Fever or chills', category: 'General' },
  { id: 's2', text: 'Persistent cough', category: 'Respiratory' },
  { id: 's3', text: 'Shortness of breath or difficulty breathing', category: 'Respiratory' },
  { id: 's4', text: 'Fatigue or weakness', category: 'General' },
  { id: 's5', text: 'Headache', category: 'Neurological' },
  { id: 's6', text: 'Body aches or muscle pain', category: 'Musculoskeletal' },
  { id: 's7', text: 'Sore throat', category: 'Respiratory' },
  { id: 's8', text: 'Nausea or vomiting', category: 'Gastrointestinal' },
  { id: 's9', text: 'Diarrhea', category: 'Gastrointestinal' },
  { id: 's10', text: 'Chest pain or discomfort', category: 'Cardiovascular' },
  { id: 's11', text: 'Dizziness or lightheadedness', category: 'Neurological' },
  { id: 's12', text: 'Abdominal pain', category: 'Gastrointestinal' },
  { id: 's13', text: 'Loss of taste or smell', category: 'Sensory' },
  { id: 's14', text: 'Skin rash or irritation', category: 'Dermatological' },
  { id: 's15', text: 'Joint pain or swelling', category: 'Musculoskeletal' },
]

type QuestionnaireProps = {
  conversationId: string
  onSubmit: () => void
}

export function Questionnaire({ conversationId, onSubmit }: QuestionnaireProps) {
  const [answers, setAnswers] = useState<SymptomAnswer[]>(
    symptoms.map(s => ({ symptomId: s.id, hasSymptom: null }))
  )

  const { token } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleAnswer = (symptomId: string, hasSymptom: boolean) => {
    setAnswers(prev =>
      prev.map(a =>
        a.symptomId === symptomId ? { ...a, hasSymptom } : a
      )
    )
  }

  const hasAnsweredAny = () => {
    return answers.some(a => a.hasSymptom !== null)
  }

  const hasAnySymptoms = () => {
    return answers.some(a => a.hasSymptom === true)
  }

  const handleSubmit = async () => {
    if (!hasAnsweredAny()) {
      alert('Please answer at least one question')
      return
    }

    if (!hasAnySymptoms()) {
      alert('Please select at least one symptom you are experiencing')
      return
    }

    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      // Get list of symptoms where user answered "Yes"
      const reportedSymptoms = answers
        .filter(a => a.hasSymptom === true)
        .map(a => {
          const symptom = symptoms.find(s => s.id === a.symptomId)
          return symptom?.text || ''
        })
        .filter(text => text !== '')

      // Prepare request payload
      const payload = {
        symptoms: reportedSymptoms,
        conversation_id: conversationId,
      }

      // Submit to your API endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/api/prediagnosis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to submit symptoms')
      }

      const result = await response.json()

      setSubmitStatus('success')
      console.log('Prediagnosis generated successfully:', result)

    } catch (error) {
      console.error('Error submitting symptoms:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
      onSubmit()
    }
  }

  const getAnswerForSymptom = (symptomId: string) => {
    return answers.find(a => a.symptomId === symptomId)?.hasSymptom
  }

  const answeredCount = answers.filter(a => a.hasSymptom !== null).length
  const yesCount = answers.filter(a => a.hasSymptom === true).length
  const progress = (answeredCount / symptoms.length) * 100

  return (
    <div className="bg-white rounded-2xl max-w-2xl">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-health-primary/10 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-health-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-health-dark">Symptom Assessment</h3>
            <p className="text-xs text-health-gray">Please indicate which symptoms you are experiencing</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-health-gray mb-1">
            <span>Progress</span>
            <span>{answeredCount} of {symptoms.length} answered</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-health-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          {yesCount > 0 && (
            <p className="text-xs text-health-primary mt-1 font-medium">
              {yesCount} symptom{yesCount !== 1 ? 's' : ''} reported
            </p>
          )}
        </div>
      </div>

      {/* Symptoms */}
      <div className="p-6 space-y-6 max-h-96 overflow-y-auto scrollbar-hide">
        {symptoms.map((symptom, index) => {
          const answer = getAnswerForSymptom(symptom.id)

          return (
            <div key={symptom.id} className="space-y-3">
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 bg-health-light rounded-full flex items-center justify-center text-xs font-medium text-health-primary">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-health-dark">
                    {symptom.text}
                  </p>
                  {symptom.category && (
                    <p className="text-xs text-health-gray mt-0.5">{symptom.category}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 ml-8">
                <button
                  onClick={() => handleAnswer(symptom.id, true)}
                  className={`flex-1 px-4 py-2.5 rounded-lg border-2 transition-all font-medium text-sm ${answer === true
                      ? 'border-gray-800 bg-gray-800 text-white'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-400'
                    }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    {answer === true && (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    Yes
                  </div>
                </button>

                <button
                  onClick={() => handleAnswer(symptom.id, false)}
                  className={`flex-1 px-4 py-2.5 rounded-lg border-2 transition-all font-medium text-sm ${answer === false
                      ? 'border-gray-800 bg-gray-800 text-white'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-400'
                    }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    {answer === false && (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    No
                  </div>
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="p-6 bg-gray-50 rounded-2xl">
        {submitStatus === 'success' && (
          <div className="mb-4 p-3 bg-health-success/10 border border-health-success/20 rounded-lg flex items-center gap-2 text-health-success text-sm">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Prediagnosis generated successfully!
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600 text-sm">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Failed to submit. Please try again.
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!hasAnySymptoms() || isSubmitting}
          className="w-full bg-health-primary text-white px-6 py-3 rounded-lg hover:bg-health-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Analyzing symptoms...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Get Prediagnosis
            </>
          )}
        </button>

        {!hasAnySymptoms() && hasAnsweredAny() && (
          <p className="text-xs text-health-gray text-center mt-3">
            Please select at least one symptom to get a prediagnosis
          </p>
        )}
      </div>
    </div>
  )
} <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
