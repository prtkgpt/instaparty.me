import { Party } from './types'
import { format } from 'date-fns'

export function generateICS(party: Party, inviteUrl: string): string {
  const startDate = new Date(party.date)
  const endDate = new Date(startDate.getTime() + 3 * 60 * 60 * 1000) // 3 hours later

  const formatICSDate = (date: Date): string => {
    return format(date, "yyyyMMdd'T'HHmmss")
  }

  const escapeICS = (str: string): string => {
    return str
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n')
  }

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//InstaParty//Party Invitation//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${party.id}@instaparty.me`,
    `DTSTAMP:${formatICSDate(new Date())}`,
    `DTSTART:${formatICSDate(startDate)}`,
    `DTEND:${formatICSDate(endDate)}`,
    `SUMMARY:${escapeICS(party.title)}`,
    party.description ? `DESCRIPTION:${escapeICS(party.description)}\\n\\nRSVP: ${inviteUrl}` : `DESCRIPTION:RSVP: ${inviteUrl}`,
    party.location ? `LOCATION:${escapeICS(party.location)}` : '',
    `URL:${inviteUrl}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'BEGIN:VALARM',
    'TRIGGER:-PT24H',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeICS(party.title)} is tomorrow!`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .filter(line => line !== '') // Remove empty lines
    .join('\r\n')

  return icsContent
}

export function downloadICS(party: Party, inviteUrl: string): void {
  const icsContent = generateICS(party, inviteUrl)
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${party.slug}.ics`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(link.href)
}

export function getGoogleCalendarUrl(party: Party, inviteUrl: string): string {
  const startDate = new Date(party.date)
  const endDate = new Date(startDate.getTime() + 3 * 60 * 60 * 1000)

  const formatGoogleDate = (date: Date): string => {
    return format(date, "yyyyMMdd'T'HHmmss")
  }

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: party.title,
    dates: `${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}`,
    details: `${party.description || ''}\n\nRSVP: ${inviteUrl}`,
    location: party.location || '',
  })

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

export function getOutlookCalendarUrl(party: Party, inviteUrl: string): string {
  const startDate = new Date(party.date)
  const endDate = new Date(startDate.getTime() + 3 * 60 * 60 * 1000)

  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: party.title,
    startdt: startDate.toISOString(),
    enddt: endDate.toISOString(),
    body: `${party.description || ''}\n\nRSVP: ${inviteUrl}`,
    location: party.location || '',
  })

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`
}
