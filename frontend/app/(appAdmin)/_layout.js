import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

function EmptyScreen() {
  return <View />;

}export default function AppLayout() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: theme.colors.primary,
            tabBarInactiveTintColor: '#757575',
            tabBarStyle: {
              backgroundColor: theme.colors.surface,
              borderTopColor: '#E0E0E0',
              borderTopWidth: 1,
              elevation: 0,
              shadowOpacity: 0,
              height: 60,
              paddingBottom: 10,
              paddingTop: 8,
              // position: 'absolute',
              marginBottom: -10,
            },
            headerStyle: {
              backgroundColor: theme.colors.surface,
              elevation: 0,
              shadowOpacity: 0,
              borderBottomWidth: 1,
              borderBottomColor: '#E0E0E0',
            },
            headerTintColor: theme.colors.text,
            tabBarShowLabel: false,
            animation: 'fade',
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: 'Inicio',
              headerShown: false,
              tabBarIcon: ({ color, size }) => (
                <MaterialIcons name="home" size={28} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: 'Perfil',
              tabBarIcon: ({ color, size }) => (
                <MaterialIcons name="person" size={28} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="cart"
            options={{
              title: 'Carrito',
              tabBarIcon: ({ color, size }) => (
                <MaterialIcons name="shopping-cart" size={28} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="favorites"
            options={{
              title: 'Favoritos',
              tabBarIcon: ({ color, size }) => (
                <MaterialIcons name="favorite" size={28} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="support"
            options={{
              title: 'Soporte',
              tabBarIcon: ({ color, size }) => (
                <MaterialIcons name="chat" size={28} color={color} />
              ),
            }}
          />

          {/* Ocultar estas rutas de la barra de tabs */}
          <Tabs.Screen
            name="adminDashboard"
            options={{
              title:"Admin Dashboard",
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
            name="checkout"
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
        </Tabs>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
