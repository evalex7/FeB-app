import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.evalex.febapp',
  appName: 'FeB App',
  webDir: 'out'  // <-- змінено з 'public' на 'out'
};

export default config;
