'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDistanceToNow } from 'date-fns'

interface Message {
  id: string
  created_at: string
  subject: string
  message: string
  sent_to_count: number
}

interface GuestMessagingProps {
  partyId: string
  canManage: boolean
}

export default function GuestMessaging({ partyId, canManage }: GuestMessagingProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [showForm, setShowForm] = useState(false)
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (canManage) {
      loadMessages()
    }
  }, [partyId, canManage])

  const loadMessages = async () => {
    const { data } = await supabase
      .from('party_messages')
      .select('*')
      .eq('party_id', partyId)
      .order('created_at', { ascending: false })

    if (data) {
      setMessages(data)
    }
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setSending(true)

    try {
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partyId,
          subject,
          message,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to send message')
      } else {
        setSuccess(`Message sent to ${data.sent} guest${data.sent !== 1 ? 's' : ''}!`)
        setSubject('')
        setMessage('')
        setShowForm(false)
        loadMessages()
      }
    } catch (err) {
      setError('An error occurred while sending the message')
    }

    setSending(false)
  }

  if (!canManage) return null

  return (
    <div className="bg-white rounded-xl shadow-sm p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">💬 Guest Messages</h2>
          <p className="text-sm text-gray-500 mt-1">
            Send updates to all guests who RSVP'd Yes or Maybe
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors text-sm"
          >
            + Send Message
          </button>
        )}
      </div>

      {/* Send Message Form */}
      {showForm && (
        <div className="mb-6 p-6 bg-purple-50 rounded-lg border border-purple-200">
          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject *
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                placeholder="Party Update: Location Changed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message *
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                placeholder="Hi everyone! Just a quick update about the party..."
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm">
                {success}
              </div>
            )}

            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setError(null)
                  setSuccess(null)
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={sending}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:bg-purple-300 transition-colors"
              >
                {sending ? 'Sending...' : 'Send to Guests'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Message History */}
      {messages.length > 0 ? (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Message History
          </h3>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="p-4 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-gray-900">{msg.subject}</h4>
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2 whitespace-pre-wrap">
                {msg.message}
              </p>
              <p className="text-xs text-gray-500">
                📧 Sent to {msg.sent_to_count} guest{msg.sent_to_count !== 1 ? 's' : ''}
              </p>
            </div>
          ))}
        </div>
      ) : (
        !showForm && (
          <div className="text-center py-8">
            <div className="text-5xl mb-3">💬</div>
            <p className="text-gray-500">
              No messages sent yet. Send updates to keep your guests informed!
            </p>
          </div>
        )
      )}
    </div>
  )
}
