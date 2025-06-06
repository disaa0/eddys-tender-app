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
import { SafeAreaView } from 'react-native';
import { ActivityIndicator, Card, Chip, IconButton, List, RadioButton } from 'react-native-paper';
import { useAdminOrders } from '../../hooks/useAdminOrders';
import adminApiService from '../../api/AdminApiService';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

const OrderDetail = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { formatAddress, formatDate } = useAdminOrders();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMsg, setDialogMsg] = useState('');
  const [loadingChangingStatus, setLoadingChangingStatus] = useState(false);

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

  useFocusEffect(
    useCallback(() => {
      if (id) getOrderById(id);
    }, [id])
  );

  const handleStatusChange = async (newStatus) => {
    console.log(`Updating order status to: ${newStatus}`);
    // setOrder((prevOrder) => ({ ...prevOrder, orderStatus: { ...prevOrder.orderStatus, status: newStatus } }));
    try {
      setLoadingChangingStatus(true);
      const resUpdate = await adminApiService.updateOrderStatus(id, newStatus);
      console.log('Response from update:', resUpdate);
      if (resUpdate?.data?.idOrder) {
        setDialogMsg(resUpdate.message);
        setShowDialog(true);
        setTimeout(() => {
          setShowDialog(false);
          router.push('/orders');
          setLoadingChangingStatus(false);

        }, 2000);
      }
    } catch (error) {
      setError(error.message);
      setShowDialog(true);
    } finally {
      // setLoadingChangingStatus(false);
    }
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
                <Text variant="titleMedium">Pedido #{order.idOrder}</Text>
                <Text variant="titleMedium">{order.cart.user.userInformation.phone || 'Teléfono no encontrado'}</Text>
                <Text variant="titleMedium">{order.cart.user.userInformation.name || 'Nombre no encontrado'}</Text>
                <Text variant="bodySmall">{formatDate(order.createdAt)}</Text>
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
                  title={`${item.quantity} x ${item.product.name}`}
                  descriptionNumberOfLines={3}
                  description={`${item.userProductPersonalize ? item.userProductPersonalize.map(item => ` ${item.productPersonalization.personalization.name}`) : null}`}
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
              descriptionNumberOfLines={3}
              description={order.location ? `${order.location.street}${order.location.houseNumber}\n${order.location.neighborhood}\n${order.location.postalCode}` : "Pedido para recoger en sucursal"}
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
              <RadioButton.Item label="Pendiente" disabled={loadingChangingStatus} value="1" />
              <RadioButton.Item label="Procesando" disabled={loadingChangingStatus} value="2" />
              <RadioButton.Item label="Listo para recoger" disabled={loadingChangingStatus} value="3" />
              <RadioButton.Item label="Listo para enviar" disabled={loadingChangingStatus} value="4" />
              <RadioButton.Item label="Enviado" disabled={loadingChangingStatus} value="5" />
              <RadioButton.Item label="Entregado" disabled={loadingChangingStatus} value="6" />
              <RadioButton.Item label="Cancelado" disabled={loadingChangingStatus} value="7" />
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
