import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Party } from '@/lib/types'
import { format } from 'date-fns'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get parties owned by user
  const { data: ownedParties } = await supabase
    .from('parties')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: true })

  // Get parties where user is a cohost
  const { data: cohostParties } = await supabase
    .from('party_cohosts')
    .select('*, parties(*)')
    .eq('user_id', user.id)

  // Combine and sort all parties
  const cohostPartiesData = cohostParties?.map(ch => ({
    ...(ch.parties as any),
    isCohost: true
  })) || []

  const allParties = [...(ownedParties || []), ...cohostPartiesData].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/dashboard" className="text-2xl font-bold text-purple-600">
              🎉 InstaParty
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                {profile?.full_name || user.email}
              </span>
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Parties</h1>
          <Link
            href="/party/create"
            className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            + Create Party
          </Link>
        </div>

        {!allParties || allParties.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎈</div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              No parties yet
            </h2>
            <p className="text-gray-500 mb-6">
              Create your first party and start inviting friends!
            </p>
            <Link
              href="/party/create"
              className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              Create Your First Party
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allParties.map((party: any) => (
              <Link
                key={party.id}
                href={`/party/${party.slug}`}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-200"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    {party.title}
                  </h3>
                  <div className="flex flex-col gap-1">
                    {party.isCohost && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                        Co-host
                      </span>
                    )}
                    {party.is_public && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                        Public
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {party.description}
                </p>
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center">
                    <span className="mr-2">📅</span>
                    {format(new Date(party.date), 'PPP p')}
                  </div>
                  {party.location && (
                    <div className="flex items-center">
                      <span className="mr-2">📍</span>
                      {party.location}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
