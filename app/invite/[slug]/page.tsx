'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Party, RSVPStatus } from '@/lib/types'
import { format } from 'date-fns'

export default function InvitePage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const supabase = createClient()

  const [party, setParty] = useState<Party | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<RSVPStatus>('yes')
  const [message, setMessage] = useState('')
  const [plusOnes, setPlusOnes] = useState('0')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    async function loadParty() {
      const { data } = await supabase
        .from('parties')
        .select('*')
        .eq('slug', slug)
        .single()

      if (data) {
        setParty(data)
      }
      setLoading(false)
    }
    loadParty()
  }, [slug, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    if (!party) {
      setError('Party not found')
      setSubmitting(false)
      return
    }

    const { error: insertError } = await supabase
      .from('invites')
      .insert({
        party_id: party.id,
        name,
        email: email || null,
        status,
        message: message || null,
        plus_ones: parseInt(plusOnes) || 0,
      })

    if (insertError) {
      setError(insertError.message)
      setSubmitting(false)
      return
    }

    setSuccess(true)
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  if (!party) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-2xl text-gray-600 mb-4">Party not found</p>
          <Link href="/" className="text-purple-600 hover:text-purple-700">
            Go to homepage
          </Link>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Thanks for your RSVP!</h2>
          <p className="text-gray-600 mb-6">
            {status === 'yes' && "We're excited to see you at the party!"}
            {status === 'maybe' && "Hope you can make it!"}
            {status === 'no' && "Thanks for letting us know. You'll be missed!"}
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block text-2xl font-bold text-white mb-4">
            🎉 InstaParty
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{party.title}</h1>
          {party.description && (
            <p className="text-gray-600 mb-6">{party.description}</p>
          )}

          <div className="space-y-3 mb-6 text-gray-700">
            <div className="flex items-center">
              <span className="text-xl mr-3">📅</span>
              <div>
                <p className="font-semibold">Date & Time</p>
                <p className="text-sm">{format(new Date(party.date), 'PPP p')}</p>
              </div>
            </div>

            {party.location && (
              <div className="flex items-center">
                <span className="text-xl mr-3">📍</span>
                <div>
                  <p className="font-semibold">Location</p>
                  <p className="text-sm">{party.location}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">RSVP</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Your Name *
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email (optional)
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Will you attend? *
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setStatus('yes')}
                  className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                    status === 'yes'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ✓ Yes
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('maybe')}
                  className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                    status === 'maybe'
                      ? 'bg-yellow-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ? Maybe
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('no')}
                  className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                    status === 'no'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ✗ No
                </button>
              </div>
            </div>

            {(status === 'yes' || status === 'maybe') && (
              <div>
                <label htmlFor="plusOnes" className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Guests
                </label>
                <input
                  id="plusOnes"
                  type="number"
                  value={plusOnes}
                  onChange={(e) => setPlusOnes(e.target.value)}
                  min="0"
                  max="10"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                />
              </div>
            )}

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Message (optional)
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                placeholder="Looking forward to it!"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-6 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:bg-purple-300 transition-colors"
            >
              {submitting ? 'Submitting...' : 'Submit RSVP'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
