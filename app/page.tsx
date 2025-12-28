import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500">
      <div className="container mx-auto px-4 py-16">
        <nav className="flex justify-between items-center mb-16">
          <h1 className="text-3xl font-bold text-white">🎉 InstaParty</h1>
          <div className="space-x-4">
            <Link
              href="/login"
              className="px-6 py-2 text-white hover:text-gray-200 font-semibold transition-colors"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="px-6 py-2 bg-white text-purple-600 rounded-full font-semibold hover:bg-gray-100 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-6xl font-bold mb-6">
            The Easiest Way to Create and Invite Friends to a Party
          </h2>
          <p className="text-2xl mb-12 text-white/90">
            Create beautiful party invitations in seconds. Track RSVPs. Share instantly.
          </p>
          <Link
            href="/signup"
            className="inline-block px-8 py-4 bg-white text-purple-600 text-xl font-bold rounded-full hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl"
          >
            Create Your First Party
          </Link>
        </div>

        <div className="max-w-6xl mx-auto mt-24 grid md:grid-cols-3 gap-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-white">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-2xl font-bold mb-3">Super Fast</h3>
            <p className="text-white/90">
              Create a party invitation in under 60 seconds. No complicated forms or steps.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-white">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-2xl font-bold mb-3">Mobile Ready</h3>
            <p className="text-white/90">
              Works perfectly on any device. Your guests can RSVP from anywhere.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-white">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-2xl font-bold mb-3">Easy Tracking</h3>
            <p className="text-white/90">
              See who's coming in real-time. Get notified when guests RSVP.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
