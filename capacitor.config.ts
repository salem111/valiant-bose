import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.saleem.saleemvoice2',
  appName: 'SALEEM Voice',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true,
    appendUserAgent: 'CapacitorAndroidAudio',
  },
  plugins: {
    StatusBar: {
      overlaysWebView: true,
      style: 'DARK',
      backgroundColor: '#00000000',
    },
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ['google.com', 'facebook.com'],
      google: {
        clientId: '12660672530-n9rlb05jha2rv93qui1mbnni19l2ei97.apps.googleusercontent.com',
      },
    },
    FacebookLogin: {
      appId: '997427086443333',
      appName: 'SALEEM',
    },
  },
};

export default config;
