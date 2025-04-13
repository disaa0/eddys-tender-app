import { View, StyleSheet, ScrollView, } from 'react-native';
import { Card, Text, Chip, List, IconButton, Searchbar } from 'react-native-paper';
import { useRouter, useFocusEffect } from 'expo-router';
import { useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import apiService from '../api/ApiService';
import { theme } from '../theme';
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
  const [addresses, setAddresses] = useState([]);
  const [cart, setCart] = useState('');
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [showError, setShowError] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMsg, setDialogMsg] = useState('');

  useFocusEffect(
    useCallback(() => {
      const getShippingAddresses = async () => {
        try {
          setLoading(true);
          const data = await apiService.getShippingAdresses();
          setAddresses(data.data);
        } catch (err) {
          setError('Error al obtener direcciones');
        } finally {
          setLoading(false);
        }
      };
      getShippingAddresses();

    }, [])
  );


  useFocusEffect(
    useCallback(() => {
      const getUserOrders = async () => {
        try {
          setOrders([])
          setLoading(true);
          const ordersData = await apiService.getUserOrders();
          console.log(ordersData);
          setOrders(ordersData);
        } catch (err) {
          setError('Error al obtener ordenes');
          console.error(err);
        } finally {
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

      if (reorderResponse?.data?.cartId) {
        setDialogMsg(reorderResponse.message)
        setShowDialog(true);
      }
    } catch (error) {
      console.error('Error al reordenar:', error);
      setError(error.message || 'Error al reordenar');
      setDialogMsg(error.message || 'Error al reordenar');
      setDialogMsg(true);
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

  const formatAddress = (addressIdString) => {
    if (!addressIdString) {
      return "Pedido para recoger en sucursal."
    } else if (addressIdString) {
      const addressId = Number(addressIdString);
      const addressInfo = addresses[addressId - 1];
      const addressInfoString = `${addressInfo.street} ${addressInfo.houseNumber}, ${addressInfo.neighborhood}, ${addressInfo.postalCode}`
      return addressInfoString;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scrollContainer}>
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
                description={formatAddress(order.idLocation)}
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

                <IconButton
                  icon="backup-restore"
                  mode="contained"
                  onPress={() => handleReorder(order.idOrder)}
                  iconColor="#fff"         // flecha blanca
                  containerColor="#000"    // fondo negro
                />

              </View>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>
      <View style={styles.container}>
      </View>


      <ConfirmationDialog
        visible={showDialog}
        message={dialogMsg || error}
        onConfirm={() => { setShowDialog(false); router.push('/cart') }}
        onDismiss={() => setShowDialog(false)}
        title={'Aviso'}
        cancelButtonLabel=''
        confirmButtonLabel='Cerrar'
      />


    </SafeAreaView >
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: theme.colors.surface,
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