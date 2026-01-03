import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'

const resend = new Resend(process.env.RESEND_API_KEY)

// Verify cron secret to prevent unauthorized access
const CRON_SECRET = process.env.CRON_SECRET || 'your-secret-key-here'

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()
    const now = new Date()

    // Find parties that need reminders
    const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000)
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    let totalSent = 0

    // Get parties happening in ~24 hours
    const { data: parties24h } = await supabase
      .from('parties')
      .select('*, party_reminder_settings(*)')
      .gte('date', now.toISOString())
      .lte('date', twentyFourHoursFromNow.toISOString())

    if (parties24h) {
      for (const party of parties24h) {
        const settings = party.party_reminder_settings?.[0]
        if (!settings?.reminder_enabled || !settings?.send_24h_before) continue

        // Check if already sent
        const { data: alreadySent } = await supabase
          .from('sent_reminders')
          .select('id')
          .eq('party_id', party.id)
          .eq('reminder_type', '24h_before')
          .single()

        if (alreadySent) continue

        const sent = await sendReminder(party, '24h_before', settings.custom_message)
        totalSent += sent
      }
    }

    // Get parties happening in ~2 hours
    const { data: parties2h } = await supabase
      .from('parties')
      .select('*, party_reminder_settings(*)')
      .gte('date', now.toISOString())
      .lte('date', twoHoursFromNow.toISOString())

    if (parties2h) {
      for (const party of parties2h) {
        const settings = party.party_reminder_settings?.[0]
        if (!settings?.reminder_enabled || !settings?.send_2h_before) continue

        const { data: alreadySent } = await supabase
          .from('sent_reminders')
          .select('id')
          .eq('party_id', party.id)
          .eq('reminder_type', '2h_before')
          .single()

        if (alreadySent) continue

        const sent = await sendReminder(party, '2h_before', settings.custom_message)
        totalSent += sent
      }
    }

    // Get parties from yesterday (thank you reminders)
    const { data: partiesPast } = await supabase
      .from('parties')
      .select('*, party_reminder_settings(*)')
      .gte('date', oneDayAgo.toISOString())
      .lte('date', now.toISOString())

    if (partiesPast) {
      for (const party of partiesPast) {
        const settings = party.party_reminder_settings?.[0]
        if (!settings?.reminder_enabled || !settings?.send_day_after) continue

        const { data: alreadySent } = await supabase
          .from('sent_reminders')
          .select('id')
          .eq('party_id', party.id)
          .eq('reminder_type', 'day_after')
          .single()

        if (alreadySent) continue

        const sent = await sendThankYou(party, settings.custom_message)
        totalSent += sent
      }
    }

    return NextResponse.json({
      success: true,
      totalSent,
      message: `Sent ${totalSent} reminders`,
    })
  } catch (error) {
    console.error('Reminder cron error:', error)
    return NextResponse.json(
      { error: 'Failed to process reminders' },
      { status: 500 }
    )
  }
}

async function sendReminder(party: any, reminderType: string, customMessage?: string) {
  const supabase = await createClient()

  // Get all guests who RSVP'd yes or maybe
  const { data: invites } = await supabase
    .from('invites')
    .select('email, name')
    .eq('party_id', party.id)
    .in('status', ['yes', 'maybe'])
    .not('email', 'is', null)

  if (!invites || invites.length === 0) return 0

  const inviteUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.instaparty.me'}/invite/${party.slug}`
  const partyDate = format(new Date(party.date), 'EEEE, MMMM d, yyyy \'at\' h:mm a')

  const timeUntil = reminderType === '24h_before' ? '24 hours' : '2 hours'

  let sentCount = 0

  // Send to each guest
  for (const invite of invites) {
    if (!invite.email) continue

    try {
      await resend.emails.send({
        from: 'InstaParty <invites@instaparty.me>',
        to: invite.email,
        subject: `Reminder: ${party.title} is in ${timeUntil}! ⏰`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #7c3aed;">🎉 Party Reminder!</h1>
            <p>Hi ${invite.name},</p>
            <p>This is a friendly reminder that <strong>${party.title}</strong> is coming up in ${timeUntil}!</p>

            ${customMessage ? `<div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0;"><em>${customMessage}</em></p>
            </div>` : ''}

            <div style="background: #fef3c7; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0 0 8px 0;"><strong>📅 When:</strong> ${partyDate}</p>
              ${party.location ? `<p style="margin: 0;"><strong>📍 Where:</strong> ${party.location}</p>` : ''}
            </div>

            <p>See you there!</p>

            <a href="${inviteUrl}" style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">
              View Party Details
            </a>
          </div>
        `,
      })
      sentCount++
    } catch (err) {
      console.error('Failed to send reminder to', invite.email, err)
    }
  }

  // Record that we sent this reminder
  await supabase.from('sent_reminders').insert({
    party_id: party.id,
    reminder_type: reminderType,
    sent_to_count: sentCount,
  })

  return sentCount
}

async function sendThankYou(party: any, customMessage?: string) {
  const supabase = await createClient()

  const { data: invites } = await supabase
    .from('invites')
    .select('email, name')
    .eq('party_id', party.id)
    .eq('status', 'yes')
    .not('email', 'is', null)

  if (!invites || invites.length === 0) return 0

  const inviteUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.instaparty.me'}/invite/${party.slug}`

  let sentCount = 0

  for (const invite of invites) {
    if (!invite.email) continue

    try {
      await resend.emails.send({
        from: 'InstaParty <invites@instaparty.me>',
        to: invite.email,
        subject: `Thanks for coming to ${party.title}! 💝`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #7c3aed;">🎉 Thank You!</h1>
            <p>Hi ${invite.name},</p>
            <p>Thank you so much for celebrating at <strong>${party.title}</strong>!</p>

            ${customMessage ? `<div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0;"><em>${customMessage}</em></p>
            </div>` : ''}

            <p>Hope you had a great time! Feel free to share your photos and comments.</p>

            <a href="${inviteUrl}" style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">
              View Party & Share Photos
            </a>
          </div>
        `,
      })
      sentCount++
    } catch (err) {
      console.error('Failed to send thank you to', invite.email, err)
    }
  }

  await supabase.from('sent_reminders').insert({
    party_id: party.id,
    reminder_type: 'day_after',
    sent_to_count: sentCount,
  })

  return sentCount
}
