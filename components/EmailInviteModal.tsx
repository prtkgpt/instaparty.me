'use client'

import { useState } from 'react'

interface EmailInviteModalProps {
  partyId: string
  onClose: () => void
}

export default function EmailInviteModal({ partyId, onClose }: EmailInviteModalProps) {
  const [emails, setEmails] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ sent: number; failed: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSend = async () => {
    setError(null)
    setResult(null)

    // Parse emails (comma or newline separated)
    const emailList = emails
      .split(/[,\n]/)
      .map((e) => e.trim())
      .filter((e) => e && e.includes('@'))

    if (emailList.length === 0) {
      setError('Please enter at least one valid email address')
      return
    }

    setSending(true)

    try {
      const response = await fetch('/api/send-invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partyId,
          emails: emailList,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to send invitations')
        setSending(false)
        return
      }

      setResult({ sent: data.sent, failed: data.failed })
      if (data.sent > 0) {
        setEmails('') // Clear the input on success
      }
    } catch (err) {
      setError('An unexpected error occurred')
      console.error(err)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">📧 Email Invitations</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {result ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-semibold">
                ✓ Successfully sent {result.sent} invitation{result.sent !== 1 ? 's' : ''}!
              </p>
              {result.failed > 0 && (
                <p className="text-orange-600 text-sm mt-2">
                  {result.failed} email{result.failed !== 1 ? 's' : ''} failed to send
                </p>
              )}
            </div>

            <button
              onClick={() => setResult(null)}
              className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              Send More Invites
            </button>
            <button
              onClick={onClose}
              className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div>
                <label htmlFor="emails" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Addresses
                </label>
                <textarea
                  id="emails"
                  value={emails}
                  onChange={(e) => setEmails(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter email addresses (one per line or comma-separated)&#10;&#10;example@email.com&#10;friend@email.com&#10;family@email.com"
                />
                <p className="mt-2 text-sm text-gray-500">
                  Separate multiple emails with commas or new lines
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={handleSend}
                  disabled={sending || !emails.trim()}
                  className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:bg-purple-300 transition-colors"
                >
                  {sending ? 'Sending...' : 'Send Invitations'}
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
