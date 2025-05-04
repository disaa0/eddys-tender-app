import 'dotenv/config';

export default {
  expo: {
    name: 'app',
    slug: 'app',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'myapp',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      package: 'com.eddys.eddys',
      googleServicesFile:
        process.env.GOOGLE_SERVICES_JSON ||
        './credentials/google-services.json',
    },
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
        },
      ],
      'expo-secure-store',
      'expo-font',
      'expo-web-browser',
      [
        'expo-notifications',
        {
          icon: './assets/eddys.png',
          color: '#ffffff',
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: '642c5f04-2545-4d5f-8c42-d99eb63a9338',
      },
    },
  },
};
