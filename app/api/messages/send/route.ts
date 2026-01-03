import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { partyId, subject, message } = await request.json()

    if (!partyId || !subject || !message) {
      return NextResponse.json(
        { error: 'Party ID, subject, and message are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get party and verify user is owner or cohost
    const { data: party, error: partyError } = await supabase
      .from('parties')
      .select('*')
      .eq('id', partyId)
      .single()

    if (partyError || !party) {
      return NextResponse.json({ error: 'Party not found' }, { status: 404 })
    }

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
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get all guests who RSVPd yes or maybe
    const { data: invites } = await supabase
      .from('invites')
      .select('email, name')
      .eq('party_id', partyId)
      .in('status', ['yes', 'maybe'])
      .not('email', 'is', null)

    if (!invites || invites.length === 0) {
      return NextResponse.json(
        { error: 'No guests to send message to' },
        { status: 400 }
      )
    }

    const inviteUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.instaparty.me'}/invite/${party.slug}`

    let sentCount = 0

    // Send email to each guest
    for (const invite of invites) {
      if (!invite.email) continue

      try {
        await resend.emails.send({
          from: 'InstaParty <invites@instaparty.me>',
          to: invite.email,
          subject: `${party.title}: ${subject}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #7c3aed 0%, #ec4899 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">🎉 ${party.title}</h1>
              </div>

              <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
                <p style="color: #374151; font-size: 16px; margin-top: 0;">Hi ${invite.name},</p>

                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #7c3aed;">
                  <h2 style="color: #7c3aed; margin-top: 0; font-size: 20px;">${subject}</h2>
                  <p style="color: #374151; font-size: 16px; line-height: 1.6; white-space: pre-wrap;">${message}</p>
                </div>

                <p style="color: #6b7280; font-size: 14px; margin-bottom: 20px;">
                  This is a message from the host of ${party.title}.
                </p>

                <a href="${inviteUrl}" style="display: inline-block; background: #7c3aed; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 10px 0;">
                  View Party Details
                </a>

                <p style="color: #9ca3af; font-size: 12px; margin-top: 30px; text-align: center;">
                  Sent via InstaParty.me
                </p>
              </div>
            </div>
          `,
        })
        sentCount++
      } catch (err) {
        console.error('Failed to send to', invite.email, err)
      }
    }

    // Record the message in database
    await supabase.from('party_messages').insert({
      party_id: partyId,
      sent_by: user.id,
      subject,
      message,
      sent_to_count: sentCount,
    })

    return NextResponse.json({
      success: true,
      sent: sentCount,
      total: invites.length,
    })
  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}
