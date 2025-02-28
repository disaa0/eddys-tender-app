import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, View } from 'react-native';

const styles = StyleSheet.create({
  cartIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    top: -20, // Mueve el círculo del carrito hacia arriba
    width: 60, // Mismo tamaño que el círculo
    height: 60, // Mismo tamaño que el círculo
  },
  cartCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ff3814', // Fondo blanco para el círculo del carrito
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5, // Sombra para el círculo
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});

export default function AppLayout() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: '#ff3814', // Color blanco para íconos activos
            tabBarInactiveTintColor: 'rgba(255, 0, 0, 0.7)', // Color blanco semitransparente para íconos inactivos
            tabBarStyle: {
              backgroundColor: '#ffffff', // Fondo naranja para la barra de pestañas
              borderTopColor: '#ffffff', // Borde naranja para coincidir con el fondo
              borderTopWidth: 1,
              elevation: 0,
              shadowOpacity: 0,
              height: 80, // Aumentamos la altura para el círculo del carrito
              paddingBottom: 10,
              paddingTop: 8,
              marginBottom: -10,
            },
            headerStyle: {
              backgroundColor: '#ff3814', // Fondo naranja para el encabezado
              elevation: 0,
              shadowOpacity: 0,
              borderBottomWidth: 1,
              borderBottomColor: '#E0E0E0',
            },
            headerTintColor: '#fff', // Color blanco para el texto del encabezado
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
                <View style={styles.cartIconContainer}>
                  <View style={styles.cartCircle}>
                    <MaterialIcons name="shopping-cart" size={28} color="#ffffff" />
                  </View>
                </View>
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
          <Tabs.Screen
            name="profile/edit-email"
            options={{
              href: null,
              title: 'Editar Correo',
            }}
          />
        </Tabs>
      </SafeAreaView>
    </SafeAreaProvider>
  );



};