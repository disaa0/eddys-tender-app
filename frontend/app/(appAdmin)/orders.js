import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Card, Text, Chip, List, IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { theme } from '../theme';
import { useState } from 'react';

// Datos de ejemplo - En producción vendrían de una API
// const ORDERS = [
//   {
//     id: '001',
//     date: '2024-02-20 15:30',
//     status: 'En preparación',
//     total: 293,
//     items: [
//       { name: 'Tender Box', quantity: 2, sauce: 'BBQ', notes: 'Extra salsa' },
//     ],
//     address: 'Calle Principal 123, Colonia Centro',
//     paymentMethod: 'Tarjeta',
//   },
//   {
//     id: '002',
//     date: '2024-02-19 14:20',
//     status: 'Entregado',
//     total: 164,
//     items: [
//       { name: 'Tender Box', quantity: 1, sauce: 'Ranch', notes: '' },
//     ],
//     address: 'Calle Principal 123, Colonia Centro',
//     paymentMethod: 'Efectivo',
//   },
// ];
// const orders = [];
// Función para obtener el color según el estado
const getStatusColor = (status) => {
  switch (status) {
    case 'Confirmado':
      return '#2196F3'; // Azul
    case 'En preparación':
      return '#FF9800'; // Naranja
    case 'En camino':
      return '#9C27B0'; // Morado
    case 'Entregado':
      return '#4CAF50'; // Verde
    case 'Cancelado':
      return '#F44336'; // Rojo
    default:
      return '#757575'; // Gris
  }
};

export default function Orders() {
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMsg, setDialogMsg] = useState('');
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const router = useRouter();

  const handleReorder = (orderId) => {
    // Implementar lógica de reorden
    router.push('/cart');
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

  if (orders.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No tienes pedidos registrados</Text>
        <Text style={styles.errorTextDescription}>Aqui se mostraran los pedidos una vez se registren.</Text>
        <TouchableOpacity
          onPress={() => { router.push('/(appAdmin)'); }}
          style={styles.goBackButton}
        >
          <Text style={styles.goBackButtonText}>Regresar</Text>
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
}); 