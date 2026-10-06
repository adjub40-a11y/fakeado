import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'es.fakeado.app',
  appName: '¡Fakeado!',
  webDir: 'dist',
  backgroundColor: '#170a33',
  android: { backgroundColor: '#170a33' },
  ios: { backgroundColor: '#170a33', contentInset: 'never' },
  plugins: {
    SplashScreen: { launchShowDuration: 600, backgroundColor: '#170a33', showSpinner: false },
  },
};

export default config;
