import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'app-chats',
  webDir: 'dist/app-chats/browser', // Asegúrate de que esta ruta coincide con el outputPath de Angular
};

export default config;