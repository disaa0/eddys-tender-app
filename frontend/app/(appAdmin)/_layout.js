import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { IconButton } from 'react-native-paper';
import { View, ActivityIndicator } from 'react-native';

export default function AdminLayout() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;
    if (segments[0] === '(appAdmin)' && user?.idUserType !== 1) {
      router.replace('/(app)');
    }
  }, [isLoading, user, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!user || user.idUserType !== 1) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' },
        }}
      >
        {/* Main Admin Routes */}
        <Tabs.Screen
          name="adminDashboard"
          options={{
            title: 'Panel Admin',
          }}
        />
        <Tabs.Screen
          name="products/index"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="product/[id]"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="addProduct"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="orders"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            href: null,
          }}
        />
      </Tabs>
    </SafeAreaProvider>
  );
}
