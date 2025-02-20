import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';



export default function AppLayout() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: theme.colors.surface,
            tabBarInactiveTintColor: '#000',
            tabBarStyle: {
              backgroundColor: theme.colors.primary,
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
            name="adminDashboard"
            options={{
              title: 'Inicio',
              headerShown: false,
              tabBarIcon: ({ color, size }) => (
                <MaterialIcons name="home" size={28} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="addProduct"
            options={{
              title: 'Añadir Producto',
              headerShown: true,
              tabBarIcon: ({ color, size }) => (
                <MaterialIcons name="add-circle-outline" size={28} color={color} />
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
            name="orders"
            options={{
              title: 'Soporte',
              tabBarIcon: ({ color, size }) => (
                <MaterialIcons name="chat" size={28} color={color} />
              ),
            }}
          />
         
        
      
          {/* Ocultar estas rutas de la barra de tabs */}
          <Tabs.Screen
            name="chat"
            options={{
              href:null,
            }}
          />

          <Tabs.Screen
            name="product/[id]"
            options={{
              headerShown: false,
              href: null,
            }}
          />
        </Tabs>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
