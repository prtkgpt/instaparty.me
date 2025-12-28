'use client'

import { Invite } from '@/lib/types'
import { format } from 'date-fns'

interface RSVPListProps {
  invites: Invite[]
}

export default function RSVPList({ invites }: RSVPListProps) {
  if (invites.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No RSVPs yet. Share your party link to get started!</p>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'yes':
        return 'bg-green-100 text-green-800'
      case 'maybe':
        return 'bg-yellow-100 text-yellow-800'
      case 'no':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case 'yes':
        return '✓'
      case 'maybe':
        return '?'
      case 'no':
        return '✗'
      default:
        return '○'
    }
  }

  return (
    <div className="space-y-3">
      {invites.map((invite) => (
        <div
          key={invite.id}
          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <h3 className="font-semibold text-gray-900">{invite.name}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(invite.status)}`}>
                {getStatusEmoji(invite.status)} {invite.status.charAt(0).toUpperCase() + invite.status.slice(1)}
              </span>
              {invite.plus_ones > 0 && (
                <span className="text-sm text-gray-600">
                  +{invite.plus_ones} guest{invite.plus_ones !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            {invite.email && (
              <p className="text-sm text-gray-600 mt-1">{invite.email}</p>
            )}
            {invite.message && (
              <p className="text-sm text-gray-700 mt-2 italic">"{invite.message}"</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              RSVP'd {format(new Date(invite.created_at), 'PPp')}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
