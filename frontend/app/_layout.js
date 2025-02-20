import { Stack } from "expo-router";
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { useEffect } from 'react';
import { useRouter, useSegments } from "expo-router";
import { theme } from './theme';

// Combinar nuestro tema con el tema base de Paper
const combinedTheme = {
  ...MD3LightTheme,
  ...theme,
  colors: {
    ...MD3LightTheme.colors,
    ...theme.colors,
  },
};

// Función para proteger rutas
function useProtectedRoute() {
  const segments = useSegments();
  const router = useRouter();
  
  // Simularemos un estado de autenticación por ahora
  const isAuthenticated = true; // Esto después vendrá de un contexto o estado global

  useEffect(() => {
    const inAuthGroup = segments[0] === "(auth)";
    
    if (!isAuthenticated && !inAuthGroup) {
      // Redirige a login si no está autenticado y no está en el grupo auth
      router.replace("/login");
    } else if (isAuthenticated && inAuthGroup) {
      // Redirige al home si está autenticado y está en el grupo auth
      router.replace("/(app)");
    }
  }, [isAuthenticated, segments]);
}

export default function RootLayout() {
  useProtectedRoute();

  return (
    <PaperProvider theme={combinedTheme}>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.primary,
          },
          headerTintColor: '#fff',
        }}
      >
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
        <Stack.Screen name="(appAdmin)" options={{ headerShown: true, title: "Admin" }} />
      </Stack>
    </PaperProvider>
  );
} 
