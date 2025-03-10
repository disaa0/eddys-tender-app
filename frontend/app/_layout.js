import { Stack } from 'expo-router';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { theme } from './theme';
import { AuthProvider, useAuth } from './context/AuthContext';

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
  const { isAuthenticated, isLoading, isAdmin } = useAuth();
  // console.log(segments);
  // console.log(isAuthenticated);
  console.log(isAdmin);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/login');
    } else if (isAuthenticated && inAuthGroup) {
      if (isAdmin) {
        router.replace('/adminDashboard');
        return;
      } else {
        router.replace('/');
      }
    }
  }, [isAuthenticated, segments, isLoading]);
}

// 🔹 Nuevo componente para manejar la autenticación
function AppContent() {
  useProtectedRoute(); // 🔥 Ahora se ejecuta después de que AuthProvider esté disponible

  return (
    <PaperProvider theme={combinedTheme}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: '#fff',
        }}
      >
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
        <Stack.Screen name="(appAdmin)" options={{ headerShown: false, title: "Panel Administrador" }} />
      </Stack>
    </PaperProvider>
  );
}

// 🔥 Ahora AuthProvider envuelve todo correctamente
export default function RootLayout() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
