import { Party } from './types'
import { format } from 'date-fns'
import { getTheme } from './themes'

interface EmailTemplateProps {
  party: Party
  inviteUrl: string
}

export function PartyInvitationEmail({ party, inviteUrl }: EmailTemplateProps) {
  const theme = getTheme(party.theme)

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're Invited!</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f3f4f6; padding: 40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background: linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 48px; color: white;">${theme.emoji}</h1>
              <h2 style="margin: 10px 0 0; font-size: 28px; font-weight: bold; color: white;">You're Invited!</h2>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="background-color: white; padding: 40px;">
              <h1 style="margin: 0 0 20px; font-size: 32px; font-weight: bold; color: #111827;">${party.title}</h1>

              ${party.description ? `
              <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #4b5563;">
                ${party.description}
              </p>
              ` : ''}

              <!-- Party Details -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                <tr>
                  <td style="padding: 15px 0; border-top: 1px solid #e5e7eb;">
                    <table role="presentation" style="border-collapse: collapse;">
                      <tr>
                        <td style="padding-right: 15px; font-size: 24px;">📅</td>
                        <td>
                          <p style="margin: 0; font-weight: 600; color: #111827; font-size: 14px;">Date & Time</p>
                          <p style="margin: 5px 0 0; color: #6b7280; font-size: 14px;">${format(new Date(party.date), 'EEEE, MMMM d, yyyy')}</p>
                          <p style="margin: 2px 0 0; color: #6b7280; font-size: 14px;">${format(new Date(party.date), 'h:mm a')}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                ${party.location ? `
                <tr>
                  <td style="padding: 15px 0; border-top: 1px solid #e5e7eb;">
                    <table role="presentation" style="border-collapse: collapse;">
                      <tr>
                        <td style="padding-right: 15px; font-size: 24px;">📍</td>
                        <td>
                          <p style="margin: 0; font-weight: 600; color: #111827; font-size: 14px;">Location</p>
                          <p style="margin: 5px 0 0; color: #6b7280; font-size: 14px;">${party.location}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                ` : ''}
              </table>

              <!-- RSVP Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 40px 0 20px;">
                <tr>
                  <td align="center">
                    <a href="${inviteUrl}" style="display: inline-block; background: linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 18px; box-shadow: 0 4px 6px rgba(147, 51, 234, 0.3);">
                      RSVP Now
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 30px 0 0; font-size: 14px; color: #9ca3af; text-align: center;">
                Can't click the button? Copy this link: <br>
                <a href="${inviteUrl}" style="color: ${theme.colors.primary}; word-break: break-all;">${inviteUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                Sent via <a href="https://www.instaparty.me" style="color: ${theme.colors.primary}; text-decoration: none; font-weight: 600;">InstaParty</a>
              </p>
              <p style="margin: 10px 0 0; font-size: 11px; color: #d1d5db;">
                The easiest way to create and invite friends to a party
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}
