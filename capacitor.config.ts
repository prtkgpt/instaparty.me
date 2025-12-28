import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'me.instaparty.app',
  appName: 'InstaParty',
  webDir: 'public',
  server: {
    // For development: uncomment below to use local dev server
    // url: 'http://localhost:3000',
    // cleartext: true,

    // For production: deploy to Vercel and update URL here
    // url: 'https://your-app.vercel.app',

    androidScheme: 'https',
    iosScheme: 'https'
  },
  ios: {
    contentInset: 'always'
  }
};

export default config;
