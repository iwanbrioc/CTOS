import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ctos.mindfulness',
  appName: 'Coming to Our Senses',
  webDir: 'dist/public',
  server: {
    url: 'https://d6530157-faac-4ef2-88a6-b67b5d88e1bd-00-127quj4s0j5cu.worf.replit.dev',
    cleartext: true,
    androidScheme: 'https'
  },
  ios: {
    contentInset: 'never',
    backgroundColor: '#f8f9fa'
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      launchShowDuration: 2000,
      backgroundColor: '#f8f9fa',
      androidSplashResourceName: 'splash',
      showSpinner: false
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#488AFF',
      sound: 'beep.wav'
    }
  }
};

export default config;
