# InstaParty Production Deployment Guide

## Step 1: Merge to Main Branch (if needed)

If you want to deploy from `main` branch instead of the feature branch:

```bash
# Create and switch to main branch
git checkout -b main

# Push main to remote
git push -u origin main
```

**OR** you can deploy directly from the `claude/party-creation-invites-gXiwg` branch.

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/new)
2. Click "Add New..." → "Project"
3. Import your Git repository (`prtkgpt/instaparty.me`)
4. Configure the project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
5. Click "Deploy"

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

## Step 3: Configure Environment Variables in Vercel

Go to your Vercel project → Settings → Environment Variables

Add the following variables for **Production**:

### Required Variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://rqgxdrsyodyhvdgihiur.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_85y71H9zMJsJaqZImQkSAw_1zaUGkR0
NEXT_PUBLIC_SITE_URL=https://www.instaparty.me
RESEND_API_KEY=<your_resend_api_key>
CRON_SECRET=3r89nFl68FXe6OSdGZYKZU4RAuAwpOTv9cPwFmQgl1M=
```

### How to get RESEND_API_KEY:
1. Go to [Resend Dashboard](https://resend.com/api-keys)
2. Create a new API key
3. Copy and paste it into Vercel

**Important**: After adding environment variables, you MUST redeploy for them to take effect.

## Step 4: Configure Domain (if using custom domain)

1. In Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain: `www.instaparty.me` and `instaparty.me`
3. Follow Vercel's DNS configuration instructions
4. Update your domain's DNS records (usually takes 24-48 hours to propagate)

## Step 5: Create Supabase Storage Bucket

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/rqgxdrsyodyhvdgihiur/storage/buckets)
2. Click "Create a new bucket"
3. Name: `party-photos`
4. Check "Public bucket"
5. Click "Create bucket"

### Set Storage Policies:

Go to the bucket → Policies → Create new policy:

**Policy 1: Allow public reads**
```sql
CREATE POLICY "Public photos are viewable"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'party-photos');
```

**Policy 2: Allow uploads**
```sql
CREATE POLICY "Anyone can upload photos"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'party-photos');
```

**Policy 3: Allow deletes for authenticated users**
```sql
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'party-photos');
```

## Step 6: Verify Automated Reminders (Cron Jobs)

After deployment, Vercel will automatically configure the cron job from `vercel.json`.

To verify it's working:
1. Wait for the next hour (cron runs every hour)
2. Check Vercel Logs → Functions
3. Look for `/api/reminders/send` executions

Or manually test:
```bash
curl -X GET "https://www.instaparty.me/api/reminders/send?secret=3r89nFl68FXe6OSdGZYKZU4RAuAwpOTv9cPwFmQgl1M="
```

## Step 7: Post-Deployment Checklist

- [ ] Verify site loads at your domain
- [ ] Test user registration/login
- [ ] Create a test party
- [ ] Send a test email invitation
- [ ] Upload a test photo
- [ ] Test QR code generation
- [ ] Test guest messaging
- [ ] Verify calendar export works
- [ ] Check Spotify playlist integration
- [ ] Test charity donation display
- [ ] Verify potluck feature
- [ ] Test co-host functionality
- [ ] Check mobile responsiveness

## Troubleshooting

### Build fails on Vercel:
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify TypeScript has no errors: `npx tsc --noEmit`

### Environment variables not working:
- Redeploy after adding environment variables
- Check variable names are exactly correct (case-sensitive)
- Verify variables are set for "Production" environment

### Database errors:
- Ensure all SQL migrations have been run in Supabase
- Check RLS policies are correctly configured
- Verify Supabase connection string is correct

### Email not sending:
- Verify RESEND_API_KEY is correct
- Check domain is verified in Resend dashboard
- Review Vercel function logs for errors

### Cron jobs not running:
- Verify CRON_SECRET environment variable is set
- Check Vercel cron logs in dashboard
- Ensure vercel.json is in root directory

## Production URLs

- **Production Site**: https://www.instaparty.me
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Dashboard**: https://supabase.com/dashboard/project/rqgxdrsyodyhvdgihiur
- **Resend Dashboard**: https://resend.com/emails

## Support

For issues with:
- Vercel deployment: [Vercel Support](https://vercel.com/support)
- Supabase: [Supabase Support](https://supabase.com/support)
- Resend emails: [Resend Support](https://resend.com/support)
