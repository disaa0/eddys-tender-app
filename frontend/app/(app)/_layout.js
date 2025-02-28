import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, View } from 'react-native';

const styles = StyleSheet.create({
  tabBarStyle: {
    position: 'absolute',
    backgroundColor: '#ff3814',
    height: 80,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
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

export default function AppLayout() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
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
              tabBarIcon: ({ color }) => (
                <View style={styles.tabBarIconStyle}>
                  <MaterialIcons name="menu" size={28} color={color} />
                </View>
              ),
            }}
          />

          <Tabs.Screen
            name="cart"
            options={{
              tabBarIcon: () => (
                <View style={styles.cartIconContainer}>
                  <MaterialIcons name="shopping-cart" size={30} color="#fff" />
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
        </Tabs>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}