'use client'

import { useState } from 'react'
import ShareButton from './ShareButton'
import EmailInviteModal from './EmailInviteModal'

interface PartyActionsProps {
  partyId: string
  inviteUrl: string
  title: string
}

export default function PartyActions({ partyId, inviteUrl, title }: PartyActionsProps) {
  const [showEmailModal, setShowEmailModal] = useState(false)

  const shareMessage = `You're invited to ${title}! RSVP here: ${inviteUrl}`
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`
  const smsUrl = `sms:?&body=${encodeURIComponent(shareMessage)}`

  return (
    <>
      <div className="border-t pt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Share Your Party</h2>

        {/* Link Share */}
        <div className="flex space-x-3 mb-4">
          <input
            type="text"
            value={inviteUrl}
            readOnly
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
          />
          <ShareButton url={inviteUrl} title={title} />
        </div>

        {/* Quick Share Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
          >
            <span>💬</span>
            <span>WhatsApp</span>
          </a>
          <a
            href={smsUrl}
            className="px-4 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
          >
            <span>💬</span>
            <span>SMS</span>
          </a>
        </div>

        {/* Email Invites Button */}
        <button
          onClick={() => setShowEmailModal(true)}
          className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
        >
          <span>📧</span>
          <span>Email Invitations</span>
        </button>
      </div>

      {showEmailModal && (
        <EmailInviteModal
          partyId={partyId}
          onClose={() => setShowEmailModal(false)}
        />
      )}
    </>
  )
}
