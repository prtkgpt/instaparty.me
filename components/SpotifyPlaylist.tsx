'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface SpotifyPlaylistProps {
  partyId: string
  playlistId: string | null
  playlistUrl: string | null
  playlistName: string | null
  canManage: boolean
}

export default function SpotifyPlaylist({
  partyId,
  playlistId,
  playlistUrl,
  playlistName,
  canManage,
}: SpotifyPlaylistProps) {
  const [showForm, setShowForm] = useState(false)
  const [url, setUrl] = useState(playlistUrl || '')
  const [name, setName] = useState(playlistName || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const extractPlaylistId = (spotifyUrl: string): string | null => {
    // Extract playlist ID from various Spotify URL formats
    // https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M
    // spotify:playlist:37i9dQZF1DXcBWIGoYBM5M
    const patterns = [
      /playlist\/([a-zA-Z0-9]+)/,
      /playlist:([a-zA-Z0-9]+)/,
    ]

    for (const pattern of patterns) {
      const match = spotifyUrl.match(pattern)
      if (match) return match[1]
    }

    return null
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)

    const extractedId = extractPlaylistId(url)

    if (!extractedId) {
      setError('Invalid Spotify playlist URL. Please use a valid Spotify playlist link.')
      setSaving(false)
      return
    }

    try {
      const { error: updateError } = await supabase
        .from('parties')
        .update({
          spotify_playlist_id: extractedId,
          spotify_playlist_url: url,
          spotify_playlist_name: name || 'Party Playlist',
        })
        .eq('id', partyId)

      if (updateError) {
        setError(updateError.message)
      } else {
        setShowForm(false)
        // Reload page to show the playlist
        window.location.reload()
      }
    } catch (err) {
      setError('Failed to save playlist')
    }

    setSaving(false)
  }

  const handleRemove = async () => {
    if (!confirm('Remove the Spotify playlist from this party?')) return

    const { error } = await supabase
      .from('parties')
      .update({
        spotify_playlist_id: null,
        spotify_playlist_url: null,
        spotify_playlist_name: null,
      })
      .eq('id', partyId)

    if (!error) {
      window.location.reload()
    }
  }

  if (!playlistId && !canManage) {
    return null // Don't show anything if there's no playlist and user can't manage
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">🎵 Party Playlist</h2>
          {playlistName && (
            <p className="text-sm text-gray-500 mt-1">{playlistName}</p>
          )}
        </div>
        {canManage && !showForm && (
          <div className="flex space-x-2">
            {!playlistId ? (
              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors text-sm"
              >
                + Add Spotify Playlist
              </button>
            ) : (
              <>
                <button
                  onClick={() => setShowForm(true)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={handleRemove}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition-colors text-sm"
                >
                  Remove
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Form */}
      {showForm && canManage && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Playlist Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                placeholder="Party Vibes"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Spotify Playlist URL *
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                placeholder="https://open.spotify.com/playlist/..."
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>💡 How to create a collaborative playlist:</strong>
              </p>
              <ol className="text-sm text-blue-800 list-decimal list-inside mt-2 space-y-1">
                <li>Open Spotify and create a new playlist</li>
                <li>Right-click the playlist → "Make collaborative"</li>
                <li>Copy the playlist link and paste it above</li>
                <li>Guests can then add songs by clicking the playlist!</li>
              </ol>
            </div>

            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-green-300 transition-colors"
              >
                {saving ? 'Saving...' : 'Save Playlist'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Spotify Player */}
      {playlistId && !showForm && (
        <div>
          <iframe
            src={`https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0`}
            width="100%"
            height="380"
            frameBorder="0"
            allowFullScreen
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="rounded-lg"
          />

          <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
            <p className="text-sm text-gray-800 mb-2">
              <strong>🎶 Add Your Song Requests!</strong>
            </p>
            <p className="text-sm text-gray-600 mb-3">
              Click the playlist above, then click the "+" button in Spotify to add your favorite songs to the party playlist!
            </p>
            {playlistUrl && (
              <a
                href={playlistUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors"
              >
                Open in Spotify →
              </a>
            )}
          </div>
        </div>
      )}

      {/* Empty State for Owners */}
      {!playlistId && canManage && !showForm && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎵</div>
          <p className="text-gray-500 mb-4">
            Add a Spotify playlist to let guests collaborate on the music!
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            + Add Spotify Playlist
          </button>
        </div>
      )}
    </div>
  )
}
