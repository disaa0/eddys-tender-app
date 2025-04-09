import { Stack } from 'expo-router';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { useEffect, useState } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { theme } from './theme';
import { AuthProvider, useAuth } from './context/AuthContext';
//import { StripeProvider } from '@stripe/stripe-react-native';
import ConfirmationDialog from './components/ConfirmationDialog';


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
function useProtectedRoute(setMostrarPopUpSessionExpirada) {
  const segments = useSegments();
  const router = useRouter();
  const { isAuthenticated, isLoading, isAdmin, sessionExpired, checkifIsAuthenticated } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    checkifIsAuthenticated();

    if (sessionExpired && !inAuthGroup) {
      setMostrarPopUpSessionExpirada(true); // 🔹 Ahora el estado está en AppContent
      return;
    }

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace(isAdmin ? '/adminDashboard' : '/');
    }
  }, [segments, isAuthenticated, isLoading]);
}

// 🔹 Nuevo componente para manejar la autenticación
function AppContent() {
  const [mostrarPopUpSessionExpirada, setMostrarPopUpSessionExpirada] = useState(false);
  const router = useRouter();

  useProtectedRoute(setMostrarPopUpSessionExpirada); // 🔥 Pasamos el estado al hook

  return (
    //<StripeProvider publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY}>
    <PaperProvider theme={combinedTheme}>

      {mostrarPopUpSessionExpirada && (
        <ConfirmationDialog
          message="Tu sesión ha expirado. Por favor, inicia sesión nuevamente."
          onConfirm={() => {
            setMostrarPopUpSessionExpirada(false); // 🔹 Primero cerramos el popup
            setTimeout(() => {  // 🔹 Esperamos un poco para actualizar el estado antes de redirigir
              router.replace('/login');
            }, 100);
          }}
          onDismiss={() => {
            setMostrarPopUpSessionExpirada(false);
            setTimeout(() => {
              router.replace('/login');
            }, 100);
          }}
          visible={mostrarPopUpSessionExpirada}
          title="Sesión Expirada"
          cancelButtonLabel=""
          confirmButtonLabel="Iniciar Sesión"
        />
      )}


      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: '#fff',
        }}
      >
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
        <Stack.Screen
          name="(appAdmin)"
          options={{ headerShown: false, title: 'Panel Administrador' }}
        />
      </Stack>
    </PaperProvider>
    //</StripeProvider>
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
