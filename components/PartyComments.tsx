'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PartyComment } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'

interface PartyCommentsProps {
  partyId: string
  isOwner: boolean
}

export default function PartyComments({ partyId, isOwner }: PartyCommentsProps) {
  const [comments, setComments] = useState<PartyComment[]>([])
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    loadComments()

    // Subscribe to real-time comment updates
    const channel = supabase
      .channel(`party_comments:${partyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'party_comments',
          filter: `party_id=eq.${partyId}`,
        },
        () => {
          loadComments()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [partyId])

  const loadComments = async () => {
    const { data } = await supabase
      .from('party_comments')
      .select('*')
      .eq('party_id', partyId)
      .order('created_at', { ascending: false })

    if (data) {
      setComments(data)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const { error: insertError } = await supabase
      .from('party_comments')
      .insert({
        party_id: partyId,
        name,
        message,
      })

    if (insertError) {
      setError(insertError.message)
      setSubmitting(false)
      return
    }

    // Clear form
    setName('')
    setMessage('')
    setSubmitting(false)
  }

  const handleDelete = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return

    await supabase
      .from('party_comments')
      .delete()
      .eq('id', commentId)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">💬 Guest Messages</h2>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="mb-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="commentName" className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <input
              id="commentName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label htmlFor="commentMessage" className="block text-sm font-medium text-gray-700 mb-2">
              Message
            </label>
            <textarea
              id="commentMessage"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
              placeholder="Can't wait for the party! 🎉"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:bg-purple-300 transition-colors"
          >
            {submitting ? 'Posting...' : 'Post Message'}
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No messages yet. Be the first to leave a message!
          </p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-gray-50 rounded-lg p-4 border border-gray-200"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-gray-900">{comment.name}</p>
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </p>
                </div>
                {isOwner && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Delete
                  </button>
                )}
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{comment.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
