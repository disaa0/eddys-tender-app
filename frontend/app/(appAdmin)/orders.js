import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, Chip, List, IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';

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

  return (
    <ScrollView style={styles.container}>
      {ORDERS.map((order) => (
        <Card key={order.id} style={styles.orderCard}>
          <Card.Content>
            {/* Encabezado del pedido */}
            <View style={styles.orderHeader}>
              <View>
                <Text variant="titleMedium">Pedido #{order.id}</Text>
                <Text variant="bodySmall">{formatDate(order.date)}</Text>
              </View>
              <Chip
                style={[
                  styles.statusChip,
                  { backgroundColor: getStatusColor(order.status) }
                ]}
              >
                <Text style={styles.statusText}>{order.status}</Text>
              </Chip>
            </View>

            {/* Lista de productos */}
            <List.Section>
              <List.Subheader>Productos</List.Subheader>
              {order.items.map((item, index) => (
                <List.Item
                  key={index}
                  title={item.name}
                  description={`Cantidad: ${item.quantity} - Salsa: ${item.sauce}${item.notes ? `\nNotas: ${item.notes}` : ''}`}
                  left={props => <List.Icon {...props} icon="food" />}
                />
              ))}
            </List.Section>

            {/* Detalles de entrega */}
            <List.Item
              title="Dirección de entrega"
              description={order.address}
              left={props => <List.Icon {...props} icon="map-marker" />}
            />

            {/* Método de pago y total */}
            <View style={styles.orderFooter}>
              <View>
                <Text variant="bodyMedium">Método de pago: {order.paymentMethod}</Text>
                <Text variant="titleMedium" style={styles.total}>
                  Total: ${order.total.toFixed(2)}
                </Text>
              </View>
              
              {order.status === 'Entregado' && (
                <IconButton
                  icon="refresh"
                  mode="contained"
                  onPress={() => handleReorder(order.id)}
                  iconColor="#fff"
                  containerColor="#2196F3"
                />
              )}
            </View>
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  orderCard: {
    margin: 8,
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