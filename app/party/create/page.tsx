'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { generateSlug } from '@/lib/utils'
import { partyThemes } from '@/lib/themes'

export default function CreatePartyPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [location, setLocation] = useState('')
  const [maxGuests, setMaxGuests] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [hasPotluck, setHasPotluck] = useState(false)
  const [theme, setTheme] = useState('classic')
  const [charityName, setCharityName] = useState('')
  const [charityUrl, setCharityUrl] = useState('')
  const [charityMessage, setCharityMessage] = useState('')
  const [enableReminders, setEnableReminders] = useState(true)
  const [send24hBefore, setSend24hBefore] = useState(true)
  const [send2hBefore, setSend2hBefore] = useState(true)
  const [sendDayAfter, setSendDayAfter] = useState(false)
  const [reminderMessage, setReminderMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setError('You must be logged in to create a party')
        setLoading(false)
        return
      }

      const dateTime = new Date(`${date}T${time}`)
      const slug = generateSlug(title)

      const { data, error: insertError } = await supabase
        .from('parties')
        .insert({
          user_id: user.id,
          title,
          description,
          date: dateTime.toISOString(),
          location,
          slug,
          max_guests: maxGuests ? parseInt(maxGuests) : null,
          is_public: isPublic,
          has_potluck: hasPotluck,
          theme,
          charity_name: charityName || null,
          charity_url: charityUrl || null,
          charity_message: charityMessage || null,
        })
        .select()
        .single()

      if (insertError) {
        setError(insertError.message)
        setLoading(false)
        return
      }

      // Create reminder settings
      if (data && enableReminders) {
        await supabase.from('party_reminder_settings').insert({
          party_id: data.id,
          send_24h_before: send24hBefore,
          send_2h_before: send2hBefore,
          send_day_after: sendDayAfter,
          custom_message: reminderMessage || null,
          reminder_enabled: enableReminders,
        })
      }

      router.push(`/party/${slug}`)
    } catch (err) {
      setError('An unexpected error occurred')
      setLoading(false)
    }
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
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Create a Party</h1>

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

            {/* Charity Donation Section */}
            <div className="border border-gray-200 rounded-lg p-4 bg-blue-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">💝 Charity Donations (Optional)</h3>
              <p className="text-sm text-gray-600 mb-4">
                Instead of gifts, ask your guests to donate to a charity of your choice
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Charity Name
                  </label>
                  <input
                    type="text"
                    value={charityName}
                    onChange={(e) => setCharityName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                    placeholder="e.g., Red Cross, UNICEF, Local Food Bank"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Donation Link (URL)
                  </label>
                  <input
                    type="url"
                    value={charityUrl}
                    onChange={(e) => setCharityUrl(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                    placeholder="https://charity.org/donate"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message to Guests
                  </label>
                  <textarea
                    value={charityMessage}
                    onChange={(e) => setCharityMessage(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                    placeholder="In lieu of gifts, please consider donating to..."
                  />
                </div>
              </div>
            </div>

            {/* Automated Reminders Section */}
            <div className="border border-gray-200 rounded-lg p-4 bg-amber-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">⏰ Automated Reminders</h3>
              <p className="text-sm text-gray-600 mb-4">
                Automatically send email reminders to your guests
              </p>

              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    id="enableReminders"
                    type="checkbox"
                    checked={enableReminders}
                    onChange={(e) => setEnableReminders(e.target.checked)}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="enableReminders" className="ml-2 block text-sm font-semibold text-gray-700">
                    Enable automated reminders
                  </label>
                </div>

                {enableReminders && (
                  <div className="ml-6 space-y-2 border-l-2 border-amber-300 pl-4">
                    <div className="flex items-center">
                      <input
                        id="send24hBefore"
                        type="checkbox"
                        checked={send24hBefore}
                        onChange={(e) => setSend24hBefore(e.target.checked)}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <label htmlFor="send24hBefore" className="ml-2 block text-sm text-gray-700">
                        Send reminder 24 hours before the party
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        id="send2hBefore"
                        type="checkbox"
                        checked={send2hBefore}
                        onChange={(e) => setSend2hBefore(e.target.checked)}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <label htmlFor="send2hBefore" className="ml-2 block text-sm text-gray-700">
                        Send reminder 2 hours before the party
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        id="sendDayAfter"
                        type="checkbox"
                        checked={sendDayAfter}
                        onChange={(e) => setSendDayAfter(e.target.checked)}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <label htmlFor="sendDayAfter" className="ml-2 block text-sm text-gray-700">
                        Send thank you email the day after
                      </label>
                    </div>

                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Custom Reminder Message (Optional)
                      </label>
                      <textarea
                        value={reminderMessage}
                        onChange={(e) => setReminderMessage(e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                        placeholder="Don't forget to bring your dancing shoes!"
                      />
                    </div>
                  </div>
                )}
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
                href="/dashboard"
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-center"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:bg-purple-300 transition-colors"
              >
                {loading ? 'Creating...' : 'Create Party'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
