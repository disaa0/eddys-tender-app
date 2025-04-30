import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { theme } from '../../theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  Card,
  Chip,
  IconButton,
  List,
  RadioButton,
} from 'react-native-paper';
import { useAdminOrders } from '../../hooks/useAdminOrders';
import adminApiService from '../../api/AdminApiService';
import ConfirmationDialog from '../../components/ConfirmationDialog';

const OrderDetail = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { formatAddress, formatDate } = useAdminOrders();
  console.log(id);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMsg, setDialogMsg] = useState('');

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

  const getOrderById = async (orderID) => {
    try {
      setLoading(true);
      const response = await adminApiService.getActiveOrderDetail(orderID);
      if (response?.data?.idOrder) {
        setOrder(response.data);
      } else {
        setError('No se encontró la orden');
        setShowDialog(true);
      }
    } catch (e) {
      setError(e.message);
      setShowDialog(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) getOrderById(id);
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    console.log(`Updating order status to: ${newStatus}`);
    // setOrder((prevOrder) => ({ ...prevOrder, orderStatus: { ...prevOrder.orderStatus, status: newStatus } }));
    try {
      const resUpdate = await adminApiService.updateOrderStatus(id, newStatus);
      console.log('Response from update:', resUpdate);
      if (resUpdate?.data?.idOrder) {
        setDialogMsg(resUpdate.message);
        setShowDialog(true);
        setTimeout(() => {
          setShowDialog(false);
          router.push('/orders');
        }, 2000);
      }
    } catch (error) {
      setError(error.message);
      setShowDialog(true);
    }
  };

  const handleOnClickOrder = (orderId) => {
    console.log(`Order clicked: ${orderId}`);
    // Aquí podrías navegar o mostrar más detalles
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          onPress={() => getOrderById(id)}
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
        <Card style={styles.orderCard}>
          <Card.Content>
            <View style={styles.orderHeader}>
              <View>
                <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
                  Pedido #{order.idOrder}
                </Text>
                <Text>{formatDate(order.createdAt)}</Text>
              </View>
              <Chip
                style={[
                  styles.statusChip,
                  {
                    backgroundColor: getStatusColor(
                      order.orderStatus.idOrderStatus
                    ),
                  },
                ]}
              >
                <Text style={styles.statusText}>
                  {order.orderStatus.status}
                </Text>
              </Chip>
            </View>

            {/* Productos */}
            <List.Section>
              <List.Subheader>Productos</List.Subheader>
              {order.cart?.itemsCart?.map((item, index) => (
                <List.Item
                  key={index}
                  title={item.product.name}
                  description={`Cantidad: ${item.quantity}`}
                  left={(props) => <List.Icon {...props} icon="food" />}
                  right={(props) => (
                    <Text {...props}>
                      $
                      {parseFloat(item.quantity * item.product.price).toFixed(
                        2
                      )}
                    </Text>
                  )}
                />
              ))}
            </List.Section>

            {/* Dirección */}
            <List.Item
              title="Dirección de entrega"
              description={formatAddress(order.idLocation)}
              left={(props) => <List.Icon {...props} icon="map-marker" />}
            />

            {/* Pago y total */}
            <View style={styles.orderFooter}>
              <View>
                <Text>Método de pago: {order.paymentType.type}</Text>
                <Text style={styles.total}>
                  Total: ${parseFloat(order.totalPrice).toFixed(2)}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Cambiar estado */}
        <Card style={[{ marginTop: 16, marginBottom: 80 }, styles.orderCard]}>
          <Card.Content>
            <Text style={{ fontWeight: 'bold', marginBottom: 8, fontSize: 16 }}>
              Actualizar estado del pedido
            </Text>
            <RadioButton.Group
              onValueChange={(newValue) =>
                handleStatusChange(parseInt(newValue))
              }
              value={String(order.orderStatus.idOrderStatus)}
            >
              <RadioButton.Item label="Pendiente" value="1" />
              <RadioButton.Item label="Procesando" value="2" />
              <RadioButton.Item label="Listo para recoger" value="3" />
              <RadioButton.Item label="Listo para enviar" value="4" />
              <RadioButton.Item label="Enviado" value="5" />
              <RadioButton.Item label="Entregado" value="6" />
              <RadioButton.Item label="Cancelado" value="7" />
            </RadioButton.Group>
          </Card.Content>
        </Card>
      </ScrollView>

      <ConfirmationDialog
        visible={showDialog}
        message={dialogMsg || error}
        onConfirm={() => setShowDialog(false)}
        onDismiss={() => setShowDialog(false)}
        title="Aviso"
        cancelButtonLabel=""
        confirmButtonLabel="Cerrar"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: theme.colors.surface,
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    shadowColor: '#000',
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
});

export default OrderDetail;
