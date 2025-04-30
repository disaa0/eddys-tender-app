import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Card, Text, Chip, List, IconButton, Searchbar, ActivityIndicator } from 'react-native-paper';
import { useRouter, useFocusEffect } from 'expo-router';
import { useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import apiService from '../api/ApiService';
import { theme } from '../theme';
import ConfirmationDialog from '../components/ConfirmationDialog'

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
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);
  const router = useRouter();
  const [showError, setShowError] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMsg, setDialogMsg] = useState('');

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        try {
          setLoading(true);
          console.log('Cargando info')
          const ordersDetailsData = await apiService.getUserOrdersDetails();
          setOrders(ordersDetailsData);
          console.log('ordenes', ordersDetailsData)
        } catch (err) {
          setError('Error al cargar información')
        } finally {
          setLoading(false);
        }
      };

      setSearchQuery('');
      setOrders([]);
      setReload('false')
      setError('')
      fetchData();



    }, [reload])
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

  const formatAddress = (address) => {
    if (!address) {
      return "Pedido para recoger en sucursal"
    } else if (address) {
      return address;
    } else {
      return 'Error al cargar dirección de entrega.'
    }
  };
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (orders.length == 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>El historial está vacío</Text>
        <Text style={styles.errorTextDescription}>Inicia creando una orden</Text>
        <TouchableOpacity
          onPress={() => router.push('/')}
          style={styles.goBackButton}
        >
          <Text style={styles.goBackButtonText}>Regresar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          onPress={() => setReload(true)}
          style={styles.goBackButton}
        >
          <Text style={styles.goBackButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }


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
                {order.cart.itemsCart.map((item, index) => (
                  <List.Item
                    key={index}
                    title={`${item.product.name}`}
                    description={`Cantidad: ${item.quantity}`}
                    left={props => <List.Icon {...props} icon="food" />}
                    right={props => <Text {...props}>{`$${(item.quantity * item.product.price).toFixed(2)}`}</Text>}
                  />
                ))}
              </List.Section>

              {/* Detalles de entrega */}
              <List.Item
                title="Dirección de entrega"
                description={formatAddress(order.locationFormatted)}
                descriptionNumberOfLines={3}
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
        <View style={styles.blank}>
        </View>
        <View style={styles.blank}>
        </View>
      </ScrollView>



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
  error: {
    flex: 1,
    justifyContent: 'center !important',
    alignItems: 'center',
    textAlign: 'center',
    color: 'red',
    marginTop: "40vh",
    fontSize: 16, // Ajustar el tamaño del texto
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    // color: 'red',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  },
  errorTextDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 5,
  },
  goBackButton: {
    backgroundColor: '#2D221D', // Color oscuro similar al botón de la imagen
    // flex: 1, // Para que ocupe más espacio
    marginTop: 20,
    marginLeft: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0.5 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  goBackButtonText: {
    fontSize: 15,
    color: 'white',
    fontWeight: 'bold',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blank: {
    height: 25,
  }
}); 