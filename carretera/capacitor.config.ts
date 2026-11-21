import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'es.fakeado.carretera',
  appName: 'La carretera es mía',
  webDir: 'www',
  backgroundColor: '#16181b',
  ios: { backgroundColor: '#16181b', contentInset: 'never' },
  plugins: {
    SplashScreen: { launchShowDuration: 600, backgroundColor: '#16181b', showSpinner: false },
  },
};

export default config;
