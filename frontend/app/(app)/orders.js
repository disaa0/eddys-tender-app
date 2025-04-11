import { View, StyleSheet, ScrollView, } from 'react-native';
import { Card, Text, Chip, List, IconButton, Searchbar } from 'react-native-paper';
import { useRouter, useFocusEffect } from 'expo-router';
import { useState, useCallback } from 'react';
import apiService from '../api/ApiService';
import { theme } from '../theme';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import ConfirmationDialog from '../components/ConfirmationDialog'

// Datos de ejemplo - En producción vendrían de una API
const ORDERS = [
  {
    id: '001',
    date: '2024-02-20 15:30',
    status: 'En preparación',
    total: 293,
    items: [
      { name: 'Tender Box', quantity: 2, sauce: 'BBQ', notes: 'Extra salsa' },
    ],
    address: 'Calle Principal 123, Colonia Centro',
    paymentMethod: 'Tarjeta',
  },
  {
    id: '002',
    date: '2024-02-19 14:20',
    status: 'Entregado',
    total: 164,
    items: [
      { name: 'Tender Box', quantity: 1, sauce: 'Ranch', notes: '' },
    ],
    address: 'Calle Principal 123, Colonia Centro',
    paymentMethod: 'Efectivo',
  },
];

// Función para obtener el color según el estado
const getStatusColor = (status) => {
  switch (status) {
    case 1:
      return '#2196F3'; // Azul
    case 2:
      return '#FF9800'; // Naranja
    case 5:
      return '#9C27B0'; // Morado
    case 6:
      return '#4CAF50'; // Verde
    case 7:
      return '#F44336'; // Rojo
    default:
      return '#757575'; // Gris
  }
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [showError, setShowError] = useState(false);
  const [error, setError] = useState('');


  useFocusEffect(
    useCallback(() => {
      const getUserOrders = async () => {
        try {
          setOrders([])
          setLoading(true);
          const ordersData = await apiService.getUserOrders();
          setOrders(ordersData);
          console.log(orders);
        } catch (err) {
          setError('Error al obtener ordenes');
          console.error(err);
        } finally {
          console.log(orders);
          setLoading(false);
        }
      };

      getUserOrders();
    }, [])
  );

  const handleReorder = async (orderId) => {
    // Implementar lógica de reorden
    // router.push('/cart');

    try {
      const reorderResponse = await apiService.reorderUserOrder(orderId);
      console.log(reorderResponse);
    } catch (error) {
      console.error('Error al reordenar:', error);
      setError(error.message || 'Error al reordenar');
      setShowError(true);
    }
  };

  const formatDate = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('es-MX', options);
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeAreaContainer}>
        <ScrollView style={styles.container}>
          <Searchbar
            placeholder="Buscar"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchbar}
            inputStyle={styles.searchInput}
            icon="magnify"
            placeholderTextColor="#666"
          />
          {orders.map((order) => (
            <Card key={order.idOrder} style={styles.orderCard}>
              <Card.Content>
                {/* Encabezado del pedido */}
                <View style={styles.orderHeader}>
                  <View>
                    <Text variant="titleMedium">Pedido #{order.idOrder}</Text>
                    <Text variant="bodySmall">{formatDate(order.createdAt)}</Text>
                  </View>
                  <Chip
                    style={[
                      styles.statusChip,
                      { backgroundColor: getStatusColor(order.orderStatus.idOrderStatus) }
                    ]}
                  >
                    <Text style={styles.statusText}>{order.orderStatus.status}</Text>
                  </Chip>
                </View>

                {/* Lista de productos */}
                <List.Section>
                  <List.Subheader>Productos</List.Subheader>
                  {/*order.items.map((item, index) => (
                <List.Item
                  key={index}
                  title={item.name}
                  description={`Cantidad: ${item.quantity} - Salsa: ${item.sauce}${item.notes ? `\nNotas: ${item.notes}` : ''}`}
                  left={props => <List.Icon {...props} icon="food" />}
                />
              ))*/}
                </List.Section>

                {/* Detalles de entrega */}
                <List.Item
                  title="Dirección de entrega"
                  description={order.idLocation}
                  left={props => <List.Icon {...props} icon="map-marker" />}
                />

                {/* Método de pago y total */}
                <View style={styles.orderFooter}>
                  <View>
                    <Text variant="bodyMedium">Método de pago: {order.paymentType.type}</Text>
                    <Text variant="titleMedium" style={styles.total}>
                      Total: ${order.totalPrice.toFixed(2)}
                    </Text>
                  </View>

                  {/* {order.status === 'Entregado' && ( */}
                  {1 == 1 && (
                    <IconButton
                      icon="history" // este ícono se parece al de tu imagen
                      mode="contained"
                      onPress={() => handleReorder(order.idOrder)}
                      iconColor="#ffffff"
                      containerColor="#000000"
                      size={24}
                    />
                  )}
                </View>
              </Card.Content>
            </Card>
          ))}
        </ScrollView>

        <ConfirmationDialog
          message={error}
          visible={showError}
          onConfirm={() => {
            setShowError(false);
          }}
          onDismiss={() => {
            setShowError(false);
          }
          }
          title={'Upps!'}
          cancelButtonLabel={''}
          confirmButtonLabel={'Cerrar'}

        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    paddingBottom: 80,
  },
  searchbar: {
    flex: 1,
    elevation: 0,
    backgroundColor: '#ffffff',
    borderRadius: 17,
    height: 50,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  orderCard: {
    margin: 8,
    backgroundColor: theme.colors.surface,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusChip: {
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  total: {
    fontWeight: 'bold',
    marginTop: 4,
  },
}); 