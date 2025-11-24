import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.evalex.febapp',       // твій package ID
  appName: 'FeB App',                // назва застосунку
  webDir: 'www',                     // порожня папка, локальні файли не потрібні
  bundledWebRuntime: false
};

export default config;
