import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/server'
import { PartyInvitationEmail } from '@/lib/email-template'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { partyId, emails } = await request.json()

    if (!partyId || !emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json(
        { error: 'Party ID and emails array are required' },
        { status: 400 }
      )
    }

    // Verify user is authenticated and owns this party
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get party details and check if user is owner or cohost
    const { data: party, error: partyError } = await supabase
      .from('parties')
      .select('*')
      .eq('id', partyId)
      .single()

    if (partyError || !party) {
      return NextResponse.json(
        { error: 'Party not found' },
        { status: 404 }
      )
    }

    // Check if user is owner or cohost
    const isOwner = party.user_id === user.id
    let isCohost = false

    if (!isOwner) {
      const { data: cohostData } = await supabase
        .from('party_cohosts')
        .select('id')
        .eq('party_id', partyId)
        .eq('user_id', user.id)
        .single()

      isCohost = !!cohostData
    }

    if (!isOwner && !isCohost) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Generate invite URL
    const inviteUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.instaparty.me'}/invite/${party.slug}`

    // Prepare email HTML
    const emailHtml = PartyInvitationEmail({
      party,
      inviteUrl,
    })

    // Send emails
    const results = await Promise.allSettled(
      emails.map(async (email: string) => {
        try {
          // Send email via Resend
          const { data, error } = await resend.emails.send({
            from: 'InstaParty <invites@instaparty.me>',
            to: email,
            subject: `You're invited to ${party.title}! 🎉`,
            html: emailHtml,
          })

          if (error) {
            console.error('Resend error:', error)
            return { email, status: 'failed', error: error.message }
          }

          // Track sent email in database
          await supabase.from('email_invitations').insert({
            party_id: partyId,
            email: email,
            status: 'sent',
          })

          return { email, status: 'sent', id: data?.id }
        } catch (err) {
          console.error('Error sending to', email, err)
          return { email, status: 'failed', error: String(err) }
        }
      })
    )

    // Count successes and failures
    const sent = results.filter((r) => r.status === 'fulfilled' && r.value.status === 'sent').length
    const failed = results.length - sent

    return NextResponse.json({
      success: true,
      sent,
      failed,
      results: results.map((r) => r.status === 'fulfilled' ? r.value : { status: 'failed' }),
    })
  } catch (error) {
    console.error('Send invites error:', error)
    return NextResponse.json(
      { error: 'Failed to send invitations' },
      { status: 500 }
    )
  }
}
