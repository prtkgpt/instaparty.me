# 🎉 InstaParty

The easiest way to create and invite friends to a party. Works on web and as a native iOS app!

## Features

✨ **Quick Party Creation** - Create a party invitation in under 60 seconds
📱 **Mobile Ready** - Beautiful responsive design that works on any device
📧 **Easy Invitations** - Share via link, social media, or copy/paste
✅ **RSVP Tracking** - See who's coming in real-time (Yes/No/Maybe)
👥 **Guest Management** - Track plus-ones and manage your guest list
🔒 **Secure & Private** - Built with Supabase authentication and Row Level Security
📲 **Native iOS App** - Package as a native iPhone app with Capacitor

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Backend**: Supabase (PostgreSQL, Authentication, Real-time)
- **Mobile**: Capacitor for iOS (and Android ready)
- **Deployment**: Vercel (web), Xcode (iOS)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Run the SQL from `database.sql` in the Supabase SQL Editor
4. Copy your project URL and anon key

### 3. Configure Environment

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
instaparty.me/
├── app/                      # Next.js app directory
│   ├── page.tsx             # Landing page
│   ├── login/               # Login page
│   ├── signup/              # Sign up page
│   ├── dashboard/           # User dashboard
│   ├── party/
│   │   ├── create/          # Party creation
│   │   └── [slug]/          # Party detail page
│   └── invite/[slug]/       # Public RSVP page
├── components/              # React components
│   ├── ShareButton.tsx      # Share functionality
│   └── RSVPList.tsx         # RSVP display
├── lib/
│   ├── supabase/            # Supabase client setup
│   ├── types.ts             # TypeScript types
│   └── utils.ts             # Utility functions
├── database.sql             # Database schema
├── capacitor.config.ts      # Capacitor configuration
└── DEPLOYMENT.md            # Detailed deployment guide
```

## How It Works

1. **Create an Account** - Sign up with email and password
2. **Create a Party** - Fill in party details (title, date, location, etc.)
3. **Share the Link** - Copy the unique party link or use the share button
4. **Track RSVPs** - See real-time responses as guests RSVP
5. **Manage Guest List** - View who's coming, including plus-ones

## Database Schema

- **parties** - Party information (title, date, location, etc.)
- **invites** - RSVP responses from guests
- **profiles** - User profile information

Row Level Security (RLS) ensures:
- Users can only edit their own parties
- Public parties are viewable by anyone
- Private parties require authentication

## Building the iOS App

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete instructions.

Quick version:

```bash
# Initialize iOS platform
npm run ios:init

# Open in Xcode
npm run ios

# Build and run on simulator or device
```

## Deployment

### Web App (Vercel)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

### iOS App

1. Deploy web app first
2. Update `capacitor.config.ts` with production URL
3. Build in Xcode
4. Submit to App Store or TestFlight

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## Development

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# iOS development
npm run ios:init     # Initialize iOS platform
npm run ios          # Open Xcode
npm run ios:sync     # Sync web assets to iOS
```

## Key Features Explained

### Authentication
- Email/password authentication via Supabase
- Automatic profile creation on signup
- Secure session management

### Party Creation
- Generate unique slugs for each party
- Public/private party options
- Optional guest limits

### RSVP System
- Three response options: Yes, Maybe, No
- Support for plus-ones
- Optional message from guests
- Real-time updates

### Sharing
- Native share API support on mobile
- Copy-to-clipboard fallback
- Shareable unique URLs

## Security

- Row Level Security on all database tables
- Server-side authentication checks
- HTTPS-only in production
- Environment variables for sensitive data

## Contributing

This is a ready-to-use party invitation app. Feel free to:
- Customize the design
- Add new features
- Deploy your own instance
- Use as a learning resource

## License

MIT - Feel free to use for personal or commercial projects.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Support

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

Built with ❤️ using Next.js, Supabase, and Capacitor.
