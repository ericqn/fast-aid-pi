'use client'

import { useState } from 'react'

type Question = {
  id: string
  text: string
  required?: boolean
}

type Answer = {
  questionId: string
  answer: boolean | null
}

const questions: Question[] = [
  { id: 'q1', text: 'Do you have any allergies to medications?', required: true },
  { id: 'q2', text: 'Are you currently taking any medications?', required: true },
  { id: 'q3', text: 'Do you have a history of heart disease?', required: true },
  { id: 'q4', text: 'Do you have diabetes?', required: true },
  { id: 'q5', text: 'Have you had any surgeries in the past year?', required: false },
  { id: 'q6', text: 'Do you smoke or use tobacco products?', required: true },
  { id: 'q7', text: 'Do you consume alcohol regularly?', required: false },
  { id: 'q8', text: 'Are you experiencing any pain currently?', required: true },
]

export function Questionnaire() {
  const [answers, setAnswers] = useState<Answer[]>(
    questions.map(q => ({ questionId: q.id, answer: null }))
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleAnswer = (questionId: string, answer: boolean) => {
    setAnswers(prev =>
      prev.map(a =>
        a.questionId === questionId ? { ...a, answer } : a
      )
    )
  }

  const isFormValid = () => {
    const requiredQuestions = questions.filter(q => q.required)
    return requiredQuestions.every(q => {
      const answer = answers.find(a => a.questionId === q.id)
      return answer && answer.answer !== null
    })
  }

  const handleSubmit = async () => {
    if (!isFormValid()) {
      alert('Please answer all required questions')
      return
    }

    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      // Replace with your actual API endpoint
      const response = await fetch('/api/questionnaire', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers: answers,
          submittedAt: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit questionnaire')
      }

      setSubmitStatus('success')
      console.log('Questionnaire submitted successfully!')
    } catch (error) {
      console.error('Error submitting questionnaire:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getAnswerForQuestion = (questionId: string) => {
    return answers.find(a => a.questionId === questionId)?.answer
  }

  const answeredCount = answers.filter(a => a.answer !== null).length
  const progress = (answeredCount / questions.length) * 100

  return (
    <div className="bg-white rounded-2xl max-w-2xl">
      {/* Header */}
      <div className="p-6 ">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-health-primary/10 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-health-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-health-dark">Health Questionnaire</h3>
            <p className="text-xs text-health-gray">Please answer the following questions</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-health-gray mb-1">
            <span>Progress</span>
            <span>{answeredCount} of {questions.length}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-health-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="p-6 space-y-6 max-h-96 overflow-y-auto scrollbar-hide">
        {questions.map((question, index) => {
          const answer = getAnswerForQuestion(question.id)

          return (
            <div key={question.id} className="space-y-3">
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 bg-health-light rounded-full flex items-center justify-center text-xs font-medium text-health-primary">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-health-dark">
                    {question.text}
                    {question.required && <span className="text-red-500 ml-1">*</span>}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 ml-8">
                <button
                  onClick={() => handleAnswer(question.id, true)}
                  className={`flex-1 px-4 py-2.5 rounded-lg border-2 transition-all font-medium text-sm ${answer === true
                    ? 'border-health-success bg-health-success/10 text-health-success'
                    : 'border-gray-200 bg-white text-health-gray hover:border-health-success/50'
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
                  onClick={() => handleAnswer(question.id, false)}
                  className={`flex-1 px-4 py-2.5 rounded-lg border-2 transition-all font-medium text-sm ${answer === false
                    ? 'border-health-primary bg-health-primary/10 text-health-primary'
                    : 'border-gray-200 bg-white text-health-gray hover:border-health-primary/50'
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
            Questionnaire submitted successfully!
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
          disabled={!isFormValid() || isSubmitting}
          className="w-full bg-health-primary text-white px-6 py-3 rounded-lg hover:bg-health-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Submitting...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Submit Questionnaire
            </>
          )}
        </button>

        {!isFormValid() && (
          <p className="text-xs text-health-gray text-center mt-3">
            * Please answer all required questions to submit
          </p>
        )}
      </div>
    </div>
  )
}
