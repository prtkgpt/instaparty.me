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
