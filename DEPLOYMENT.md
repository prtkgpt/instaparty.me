# InstaParty Deployment Guide

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)
- A Vercel account (free tier works) OR any hosting that supports Next.js
- For iOS app: macOS with Xcode installed

## Step 1: Set Up Supabase Database

1. Go to [https://app.supabase.com](https://app.supabase.com) and create a new project
2. Wait for the project to be created (this takes a few minutes)
3. Once ready, go to the SQL Editor in the Supabase dashboard
4. Copy the contents of `database.sql` from this repository
5. Paste and run the SQL in the Supabase SQL Editor
6. This will create all the necessary tables, policies, and functions

## Step 2: Configure Environment Variables

1. In your Supabase project, go to Settings > API
2. Copy your project URL and anon/public key
3. Update `.env.local` with your actual credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

4. For production deployment, add these same environment variables to your hosting platform

## Step 3: Deploy the Web App

### Option A: Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click "New Project" and import your GitHub repository
4. Add the environment variables from Step 2
5. Click "Deploy"
6. Your app will be live at `https://your-app.vercel.app`

### Option B: Deploy to Other Platforms

You can also deploy to:
- **Netlify**: Similar process to Vercel
- **Railway**: Supports Next.js with automatic deployments
- **DigitalOcean App Platform**: Good for more control
- **Self-hosted**: Use `npm run build && npm run start`

## Step 4: Build iOS App

### Initial Setup

1. Make sure you have Xcode installed on your Mac
2. Initialize the iOS platform:

```bash
npm run ios:init
```

### Configure for Production

1. Update `capacitor.config.ts` with your production URL:

```typescript
server: {
  url: 'https://your-app.vercel.app',  // Your deployed web app URL
}
```

2. Sync the configuration:

```bash
npm run ios:sync
```

3. Open the iOS project in Xcode:

```bash
npm run ios
```

### Build and Test in Xcode

1. In Xcode, select your development team under "Signing & Capabilities"
2. Choose a simulator or connected iPhone as your target device
3. Click the Play button to build and run the app
4. The app will open and load your web app in a native wrapper

### Distribute via TestFlight or App Store

1. Archive the app: Product > Archive
2. Follow Apple's guide to submit to TestFlight or the App Store
3. You'll need an Apple Developer account ($99/year)

## Step 5: Test Your App

### Web App Testing

1. Visit your deployed URL
2. Create an account
3. Create a test party
4. Copy the invite link and open in incognito/private mode
5. Submit an RSVP
6. Check that the RSVP appears in your party dashboard

### iOS App Testing

1. Run the app in Xcode simulator
2. Test all the same flows as web
3. Verify that the app feels native (smooth scrolling, proper keyboard handling)
4. Test on a real device if possible

## Development Workflow

### For Web Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

### For iOS Development

```bash
# Run Next.js dev server
npm run dev

# In capacitor.config.ts, uncomment:
# url: 'http://localhost:3000',
# cleartext: true,

# Sync and open iOS
npm run ios:sync
npm run ios

# Test on simulator or device
```

## Troubleshooting

### Supabase Connection Issues

- Verify your environment variables are correct
- Check that Row Level Security policies are enabled
- Ensure you ran the database.sql file completely

### iOS Build Issues

- Make sure Xcode is up to date
- Check that your Apple Developer account is configured
- Verify Node and npm are installed correctly
- Try cleaning the build: Product > Clean Build Folder in Xcode

### Authentication Issues

- Confirm Supabase URL and keys are correct
- Check that email confirmation is disabled in Supabase (Settings > Authentication)
- Or configure email templates if you want email verification

## Architecture Notes

The iOS app is a native wrapper that loads your deployed web app. This means:

- ✅ You only maintain one codebase
- ✅ Updates are instant (just redeploy the web app)
- ✅ All Supabase features work perfectly
- ✅ Native iOS features like sharing work out of the box
- ⚠️ Requires internet connection to use

For offline functionality, you'd need to implement a more complex setup with local storage and sync.

## Next Steps

- Customize the app design and branding
- Add more features like photo uploads for parties
- Implement push notifications for RSVPs
- Add analytics to track usage
- Set up custom domain for your web app
- Submit to the App Store

## Support

For issues or questions:
- Check the [Next.js documentation](https://nextjs.org/docs)
- Check the [Supabase documentation](https://supabase.com/docs)
- Check the [Capacitor documentation](https://capacitorjs.com/docs)
