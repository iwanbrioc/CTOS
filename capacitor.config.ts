import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.iwanbrioc.mindfulcompanion.app',
  appName: 'CTOS',
  webDir: 'dist/public',
  // server.url removed — iOS/Android load from local bundle, not a remote server
  // (remote URL was a Replit dev convenience that bypassed the local build)
  ios: {
    contentInset: 'never',
    backgroundColor: '#f8f9fa'
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
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
