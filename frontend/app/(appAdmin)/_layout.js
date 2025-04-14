import { Tabs } from 'expo-router';
import { theme } from '../theme';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

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
      <SafeAreaView style={styles.safeAreaContainer} edges={['bottom']}>
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: '#ffffff',
            tabBarInactiveTintColor: '#ffb3a7',
            tabBarStyle: styles.tabBarStyle,
            tabBarShowLabel: false,
            headerShown: false,
            animationEnabled: false,
            swipeEnabled: false,
            animation: 'fade',
          }}
        >
          {/* Main Admin Routes */}
          <Tabs.Screen
            name="adminDashboard"
            options={{
              headerShown: false,
              tabBarIcon: ({ color }) => (
                <View style={styles.tabBarIconStyle}>
                  <MaterialIcons name="menu" size={28} color={color} />
                </View>
              ),
            }}
          />
          <Tabs.Screen
            name="addProduct"
            options={{
              tabBarStyle: { display: 'none' },
              tabBarIcon: () => (
                <View style={styles.cartIconContainer}>
                  <MaterialIcons name="add" size={30} color="#fff" />
                </View>
              ),
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              tabBarIcon: ({ color }) => (
                <View style={styles.tabBarIconStyle}>
                  <MaterialIcons name="person-outline" size={28} color={color} />
                </View>
              ),
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
              tabBarStyle: { display: 'none' },
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
            name="profile/editEmail"
            options={{
              href: null,
            }}
          />
          <Tabs.Screen
            name="profile/editPassword"
            options={{
              href: null,
            }}
          />
        </Tabs>
      </SafeAreaView>
    </SafeAreaProvider >
  );
}

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  tabBarStyle: {
    position: 'absolute',
    backgroundColor: '#ff3814',
    height: 50,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    elevation: 0,
    shadowOpacity: 0,
    borderTopWidth: 0,
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 30,
  },
  cartIconContainer: {
    position: 'absolute', // Asegura que el botón se posicione correctamente
    top: -35,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    width: 70,
    height: 70,
    backgroundColor: '#ff3814',
    borderRadius: 35,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  tabBarIconStyle: {
    paddingTop: 10,
  },
});