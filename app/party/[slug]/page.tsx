import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { Invite, RSVPStatus } from '@/lib/types'
import ShareButton from '@/components/ShareButton'
import RSVPList from '@/components/RSVPList'

export default async function PartyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: party } = await supabase
    .from('parties')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!party) {
    notFound()
  }

  const isOwner = user?.id === party.user_id

  if (!party.is_public && !isOwner) {
    redirect('/login')
  }

  const { data: invites } = await supabase
    .from('invites')
    .select('*')
    .eq('party_id', party.id)
    .order('created_at', { ascending: false })

  const yesCount = invites?.filter((i: Invite) => i.status === 'yes').reduce((acc, i) => acc + 1 + i.plus_ones, 0) || 0
  const maybeCount = invites?.filter((i: Invite) => i.status === 'maybe').length || 0
  const noCount = invites?.filter((i: Invite) => i.status === 'no').length || 0

  const inviteUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/invite/${slug}`

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
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  {party.title}
                </h1>
                {party.description && (
                  <p className="text-lg text-gray-600">{party.description}</p>
                )}
              </div>
              {party.is_public && (
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded">
                  Public
                </span>
              )}
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center text-gray-700">
                <span className="text-2xl mr-3">📅</span>
                <div>
                  <p className="font-semibold">Date & Time</p>
                  <p>{format(new Date(party.date), 'PPPP')}</p>
                  <p>{format(new Date(party.date), 'p')}</p>
                </div>
              </div>

              {party.location && (
                <div className="flex items-center text-gray-700">
                  <span className="text-2xl mr-3">📍</span>
                  <div>
                    <p className="font-semibold">Location</p>
                    <p>{party.location}</p>
                  </div>
                </div>
              )}

              {party.max_guests && (
                <div className="flex items-center text-gray-700">
                  <span className="text-2xl mr-3">👥</span>
                  <div>
                    <p className="font-semibold">Capacity</p>
                    <p>{yesCount} / {party.max_guests} guests</p>
                  </div>
                </div>
              )}
            </div>

            {isOwner && (
              <PartyActions
                partyId={party.id}
                inviteUrl={inviteUrl}
                title={party.title}
              />
            )}
          </div>

          {isOwner && (
            <div className="bg-white rounded-xl shadow-sm p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">RSVPs</h2>
                <div className="flex space-x-4 text-sm">
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full font-semibold">
                    ✓ {yesCount} Yes
                  </span>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full font-semibold">
                    ? {maybeCount} Maybe
                  </span>
                  <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full font-semibold">
                    ✗ {noCount} No
                  </span>
                </div>
              </div>

              <RSVPList invites={invites || []} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
