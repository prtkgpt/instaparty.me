'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface DeletePartyButtonProps {
  partyId: string
  partyTitle: string
}

export default function DeletePartyButton({ partyId, partyTitle }: DeletePartyButtonProps) {
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async () => {
    const confirmed = confirm(
      `Are you sure you want to delete "${partyTitle}"?\n\nThis will permanently delete the party and all RSVPs, comments, and invitations. This action cannot be undone.`
    )

    if (!confirmed) return

    setDeleting(true)

    try {
      const { error } = await supabase
        .from('parties')
        .delete()
        .eq('id', partyId)

      if (error) {
        alert(`Failed to delete party: ${error.message}`)
        setDeleting(false)
        return
      }

      // Redirect to dashboard after successful deletion
      router.push('/dashboard')
    } catch (err) {
      alert('An unexpected error occurred while deleting the party')
      setDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 disabled:bg-red-50 disabled:text-red-400 transition-colors flex items-center space-x-2"
    >
      <span>🗑️</span>
      <span>{deleting ? 'Deleting...' : 'Delete'}</span>
    </button>
  )
}
