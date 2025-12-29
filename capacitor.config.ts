import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'me.instaparty.app',
  appName: 'InstaParty',
  webDir: 'public',
  server: {
    // Production URL - loads your live website
    url: 'https://www.instaparty.me',

    // For local development, comment the line above and uncomment below:
    // url: 'http://localhost:3000',
    // cleartext: true,

    androidScheme: 'https',
    iosScheme: 'https'
  },
  ios: {
    contentInset: 'always'
  }
};

export default config;
