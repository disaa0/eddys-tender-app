import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView, TouchableOpacity } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet, View, Text } from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { theme } from '../theme';
import { CartRefreshProvider } from '../context/CartRefreshContext';
import apiService from '../api/ApiService';



export default function AppLayout() {
  const [cartCount, setCartCount] = useState(0);

  const fetchCartCount = useCallback(async () => {
    try {
      response = await apiService.getCartQuantity(); // LLamada API
      setCartCount(response.totalQuantity.totalQuantity);
    } catch (err) {
      setCartCount(0);
    }
  }, []);

  useEffect(() => {
    fetchCartCount(); // Fetch inicial
  }, [fetchCartCount]);

  return (
    <CartRefreshProvider reloadCart={fetchCartCount}>
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.primary }} edges={['bottom']}>
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

            <Tabs.Screen
              name="index"
              options={{
                tabBarButton: (props) => (
                  <TouchableOpacity
                    {...props}
                    onPress={props.onPress}
                    hitSlop={{ top: 20, bottom: 20, left: 50, right: 50 }}
                    style={styles.tabBarIconStyle}
                  >
                    <MaterialIcons
                      name="menu"
                      size={20}
                      color={props['aria-selected'] ? '#ffffff' : '#ffb3a7'}
                    />
                  </TouchableOpacity>
                ),
              }}
            />
            <Tabs.Screen
              name="cart"
              options={{
                tabBarIcon: () => (
                  <View style={styles.cartIconContainer}>
                    <MaterialIcons name="shopping-cart" size={45} color="#fff" />
                    <View style={styles.cartIconCount}>
                      <Text style={{ color: theme.colors.primary, }}>{cartCount}</Text>
                    </View>
                  </View>
                ),
              }}
            />
            <Tabs.Screen
              name="profile"
              options={{
                tabBarButton: (props) => (
                  <TouchableOpacity
                    {...props}
                    onPress={props.onPress}
                    hitSlop={{ top: 20, bottom: 20, left: 50, right: 50 }}
                    style={styles.tabBarIconStyle}
                  >
                    <MaterialIcons name="person-outline" size={20} color={props['aria-selected'] ? '#ffffff' : '#ffb3a7'} />
                  </TouchableOpacity>
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
                tabBarStyle: { display: 'none' },
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
              name="profile/edit-email"
              options={{
                href: null,
                title: 'Editar Correo',
              }}
            />
            <Tabs.Screen
              name="profile/editPassword"
              options={{
                href: null,
                title: 'Editar contraseña',
              }}
            />
            <Tabs.Screen
              name="support"
              options={{
                href: null,
                title: 'Support',
              }}
            />
            <Tabs.Screen
              name="favorites"
              options={{
                href: null,
                title: 'Favoritos',
              }}
            />
            <Tabs.Screen
              name="profile/address/index"
              options={{
                href: null,
                title: 'Direcciones',
              }}
            />
            <Tabs.Screen
              name="profile/address/add-address"
              options={{
                href: null,
                title: 'Agregar Dirección',
              }}
            />
            <Tabs.Screen
              name="profile/address/[id]"
              options={{
                href: null,
                title: 'Direcciones',
              }}
            />
          </Tabs>
        </SafeAreaView>
      </SafeAreaProvider>
    </CartRefreshProvider>
  );
}

export const styles = StyleSheet.create({
  tabBarStyle: {
    position: 'absolute',
    backgroundColor: theme.colors.primary,
    height: 50,
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
    backgroundColor: theme.colors.primary,
    borderRadius: 35,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  cartIconCount: {
    position: 'absolute', // Asegura que el botón se posicione correctamente
    top: 20,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBarIconStyle: {
    paddingTop: 10,
    height: 28,
    alignSelf: 'center'
  },
});
