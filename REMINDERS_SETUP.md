# Setting Up Automated Reminders

The automated reminder system is built and ready to use. To activate it, you need to set up a cron job on Vercel.

## Step 1: Run Database Migration

Run the SQL in `database-reminders.sql` in your Supabase SQL Editor:
https://supabase.com/dashboard/project/rqgxdrsyodyhvdgihiur/sql/new

This creates:
- `party_reminder_settings` table
- `sent_reminders` table

## Step 2: Set Environment Variables

In your Vercel project settings, add:

```
CRON_SECRET=your-random-secret-key-here
```

Generate a secure random string (you can use: `openssl rand -base64 32`)

## Step 3: Create Vercel Cron Job

### Option A: Using vercel.json (Recommended)

Create `vercel.json` in your project root:

```json
{
  "crons": [
    {
      "path": "/api/reminders/send",
      "schedule": "0 * * * *"
    }
  ]
}
```

This runs every hour to check for reminders to send.

### Option B: Manual Setup in Vercel Dashboard

1. Go to your project in Vercel
2. Navigate to Settings → Crons
3. Add a new cron job:
   - **Path:** `/api/reminders/send`
   - **Schedule:** `0 * * * *` (every hour)
   - **Method:** GET

## Step 4: Add Authorization Header

The cron job needs to send the secret in the Authorization header:

In Vercel cron settings or use this curl command to test:

```bash
curl -X GET https://www.instaparty.me/api/reminders/send \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## How It Works

The system automatically:

1. **24 hours before party:** Sends reminder to all "Yes" and "Maybe" RSVPs
2. **2 hours before party:** Sends final reminder to all "Yes" and "Maybe" RSVPs
3. **1 day after party:** Sends thank you email to all "Yes" RSVPs (if enabled)

## Features

- Custom reminder messages from party host
- Tracks sent reminders to avoid duplicates
- Only sends to guests who RSVPd Yes or Maybe
- Includes party details, location, and invite link
- Beautiful HTML emails matching party theme

## Testing

To test manually, run:

```bash
curl -X GET http://localhost:3000/api/reminders/send \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Check the response for number of reminders sent.

## Troubleshooting

**No reminders being sent?**
- Check that `CRON_SECRET` env var is set
- Verify database migration was run
- Check that parties have `reminder_enabled` set to true
- Look at Vercel function logs for errors

**Reminders sent multiple times?**
- The system tracks sent reminders in `sent_reminders` table
- Each reminder type (24h, 2h, day_after) is only sent once per party

## Cost Considerations

- Vercel Hobby plan includes 100 GB-hours/month of function execution
- Each cron run takes ~1-5 seconds depending on parties
- Running hourly = 720 runs/month = minimal cost
- Resend free tier: 100 emails/day, 3,000/month

For higher volume, consider upgrading to Vercel Pro or using a dedicated cron service like Cron-job.org pointing to your API endpoint.
