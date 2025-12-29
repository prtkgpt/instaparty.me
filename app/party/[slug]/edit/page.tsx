'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Party } from '@/lib/types'
import { partyThemes } from '@/lib/themes'
import { format } from 'date-fns'

export default function EditPartyPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const supabase = createClient()

  const [party, setParty] = useState<Party | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [location, setLocation] = useState('')
  const [maxGuests, setMaxGuests] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [hasPotluck, setHasPotluck] = useState(false)
  const [theme, setTheme] = useState('classic')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function loadParty() {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data: partyData, error } = await supabase
        .from('parties')
        .select('*')
        .eq('slug', slug)
        .eq('user_id', user.id)
        .single()

      if (error || !partyData) {
        router.push('/dashboard')
        return
      }

      setParty(partyData)

      // Pre-fill form
      setTitle(partyData.title)
      setDescription(partyData.description || '')

      // Parse date and time
      const partyDate = new Date(partyData.date)
      setDate(format(partyDate, 'yyyy-MM-dd'))
      setTime(format(partyDate, 'HH:mm'))

      setLocation(partyData.location || '')
      setMaxGuests(partyData.max_guests?.toString() || '')
      setIsPublic(partyData.is_public)
      setHasPotluck(partyData.has_potluck || false)
      setTheme(partyData.theme || 'classic')
      setLoading(false)
    }

    loadParty()
  }, [slug, supabase, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)

    try {
      if (!party) {
        setError('Party not found')
        setSaving(false)
        return
      }

      const dateTime = new Date(`${date}T${time}`)

      const { error: updateError } = await supabase
        .from('parties')
        .update({
          title,
          description,
          date: dateTime.toISOString(),
          location,
          max_guests: maxGuests ? parseInt(maxGuests) : null,
          is_public: isPublic,
          has_potluck: hasPotluck,
          theme,
        })
        .eq('id', party.id)

      if (updateError) {
        setError(updateError.message)
        setSaving(false)
        return
      }

      router.push(`/party/${slug}`)
    } catch (err) {
      setError('An unexpected error occurred')
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <Link href="/dashboard" className="text-2xl font-bold text-purple-600">
            🎉 InstaParty
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Party</h1>

          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-8 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Party Title *
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                placeholder="Sarah's Birthday Bash"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                placeholder="Join us for an amazing celebration..."
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                />
              </div>

              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                  Time *
                </label>
                <input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                />
              </div>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                placeholder="123 Main St, City"
              />
            </div>

            <div>
              <label htmlFor="maxGuests" className="block text-sm font-medium text-gray-700 mb-2">
                Max Guests (optional)
              </label>
              <input
                id="maxGuests"
                type="number"
                value={maxGuests}
                onChange={(e) => setMaxGuests(e.target.value)}
                min="1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                placeholder="Leave empty for unlimited"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Party Theme
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.values(partyThemes).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTheme(t.id)}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      theme === t.id
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{t.emoji}</div>
                    <div className="font-semibold text-sm text-gray-900">{t.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{t.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  id="isPublic"
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
                  Make this party public (anyone with the link can view and RSVP)
                </label>
              </div>

              <div className="flex items-center">
                <input
                  id="hasPotluck"
                  type="checkbox"
                  checked={hasPotluck}
                  onChange={(e) => setHasPotluck(e.target.checked)}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="hasPotluck" className="ml-2 block text-sm text-gray-700">
                  Enable Potluck (guests can sign up to bring items)
                </label>
              </div>
            </div>

            <div className="flex space-x-4">
              <Link
                href={`/party/${slug}`}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-center"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:bg-purple-300 transition-colors"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
