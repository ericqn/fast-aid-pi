'use client'

import { useAuth } from './AuthContext'

export function UserProfile() {
  const { user, isAuthenticated, logout } = useAuth()

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="p-4 border-t border-gray-200 bg-gray-50">
      {/* User Info */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-health-primary rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-white font-semibold text-sm">
            {user.name.split(' ').map(n => n[0]).join('')}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-health-dark truncate">{user.name}</p>
          <p className="text-xs text-health-gray truncate">{user.email}</p>
        </div>
      </div>

      {/* Logout Button */}
      <button
        onClick={logout}
        className="w-full bg-white border border-gray-200 text-health-gray px-4 py-2.5 rounded-lg hover:bg-gray-100 hover:text-health-dark transition-colors flex items-center justify-center gap-2 font-medium text-sm"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Logout
      </button>
    </div>
  )
}
