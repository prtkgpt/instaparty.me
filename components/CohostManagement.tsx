'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PartyCohost } from '@/lib/types'

interface CohostManagementProps {
  partyId: string
  isOwner: boolean
}

export default function CohostManagement({ partyId, isOwner }: CohostManagementProps) {
  const [cohosts, setCohosts] = useState<PartyCohost[]>([])
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (isOwner) {
      loadCohosts()
    }
  }, [partyId, isOwner])

  const loadCohosts = async () => {
    const { data } = await supabase
      .from('party_cohosts')
      .select('*, profiles(full_name, avatar_url)')
      .eq('party_id', partyId)
      .order('created_at', { ascending: true })

    if (data) {
      setCohosts(data)
    }
  }

  const handleAddCohost = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      // First, find the user by email
      const { data: userData, error: userError } = await supabase
        .rpc('get_user_id_by_email', { email_address: email })

      if (userError) {
        // If function doesn't exist, we need to look up user differently
        // For now, show a helpful error
        setError('Unable to find user. Make sure they have signed up for InstaParty first.')
        setLoading(false)
        return
      }

      if (!userData) {
        setError('No user found with that email. They must sign up first.')
        setLoading(false)
        return
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('You must be logged in')
        setLoading(false)
        return
      }

      // Add cohost
      const { error: insertError } = await supabase
        .from('party_cohosts')
        .insert({
          party_id: partyId,
          user_id: userData,
          invited_by: user.id,
        })

      if (insertError) {
        if (insertError.code === '23505') {
          setError('This person is already a co-host')
        } else {
          setError(insertError.message)
        }
      } else {
        setSuccess('Co-host added successfully!')
        setEmail('')
        loadCohosts()
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    }

    setLoading(false)
  }

  const handleRemoveCohost = async (cohostId: string) => {
    if (!confirm('Remove this co-host?')) return

    const { error } = await supabase
      .from('party_cohosts')
      .delete()
      .eq('id', cohostId)

    if (!error) {
      loadCohosts()
    }
  }

  // Only show for party owners
  if (!isOwner) return null

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">👥 Co-hosts</h3>

      {/* Add Cohost Form */}
      <form onSubmit={handleAddCohost} className="mb-4">
        <div className="flex space-x-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Co-host email address"
            required
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:bg-purple-300 transition-colors"
          >
            {loading ? 'Adding...' : 'Add'}
          </button>
        </div>
        {error && (
          <p className="text-sm text-red-600 mt-2">{error}</p>
        )}
        {success && (
          <p className="text-sm text-green-600 mt-2">{success}</p>
        )}
      </form>

      {/* Cohosts List */}
      {cohosts.length > 0 ? (
        <div className="space-y-2">
          {cohosts.map((cohost) => (
            <div
              key={cohost.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-semibold">
                  {cohost.profiles?.full_name?.[0] || '?'}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {cohost.profiles?.full_name || 'User'}
                  </p>
                  <p className="text-sm text-gray-500">Co-host</p>
                </div>
              </div>
              <button
                onClick={() => handleRemoveCohost(cohost.id)}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm">
          No co-hosts yet. Add co-hosts to help manage this party.
        </p>
      )}

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Co-hosts can view RSVPs, send invitations, manage potluck items, and edit party details.
        </p>
      </div>
    </div>
  )
}
