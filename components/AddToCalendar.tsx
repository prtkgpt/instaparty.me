'use client'

import { useState } from 'react'
import { Party } from '@/lib/types'
import { downloadICS, getGoogleCalendarUrl, getOutlookCalendarUrl } from '@/lib/calendar'

interface AddToCalendarProps {
  party: Party
  inviteUrl: string
}

export default function AddToCalendar({ party, inviteUrl }: AddToCalendarProps) {
  const [showDropdown, setShowDropdown] = useState(false)

  const handleGoogleCalendar = () => {
    const url = getGoogleCalendarUrl(party, inviteUrl)
    window.open(url, '_blank')
    setShowDropdown(false)
  }

  const handleOutlookCalendar = () => {
    const url = getOutlookCalendarUrl(party, inviteUrl)
    window.open(url, '_blank')
    setShowDropdown(false)
  }

  const handleAppleCalendar = () => {
    downloadICS(party, inviteUrl)
    setShowDropdown(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
      >
        <span>📅</span>
        <span>Add to Calendar</span>
      </button>

      {showDropdown && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          />

          {/* Dropdown */}
          <div className="absolute left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-20 overflow-hidden">
            <button
              onClick={handleGoogleCalendar}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center space-x-3 border-b border-gray-100"
            >
              <span className="text-2xl">🗓️</span>
              <div>
                <p className="font-semibold text-gray-900">Google Calendar</p>
                <p className="text-xs text-gray-500">Opens in Google Calendar</p>
              </div>
            </button>

            <button
              onClick={handleAppleCalendar}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center space-x-3 border-b border-gray-100"
            >
              <span className="text-2xl">🍎</span>
              <div>
                <p className="font-semibold text-gray-900">Apple Calendar</p>
                <p className="text-xs text-gray-500">Download .ics file</p>
              </div>
            </button>

            <button
              onClick={handleOutlookCalendar}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center space-x-3"
            >
              <span className="text-2xl">📧</span>
              <div>
                <p className="font-semibold text-gray-900">Outlook Calendar</p>
                <p className="text-xs text-gray-500">Opens in Outlook</p>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  )
}
