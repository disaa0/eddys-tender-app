import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Button, Text, List, IconButton, Divider } from 'react-native-paper';
import { useRouter } from 'expo-router';

// Datos de ejemplo - En producción vendrían de un estado global o contexto
const CART_ITEMS = [
  {
    id: 1,
    name: 'Tender Box',
    price: 129,
    quantity: 2,
    sauce: 'BBQ',
    notes: 'Extra salsa por favor',
  },
  // Más items...
];

export default function Cart() {
  const router = useRouter();

  const subtotal = CART_ITEMS.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const delivery = 35;
  const total = subtotal + delivery;

  const handleCheckout = () => {
    // Implementar lógica de checkout
    router.push('/checkout');
  };

  const handleUpdateQuantity = (id, newQuantity) => {
    // Implementar lógica para actualizar cantidad
  };

  const handleRemoveItem = (id) => {
    // Implementar lógica para eliminar item
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.itemsList}>
        {CART_ITEMS.map((item) => (
          <Card key={item.id} style={styles.itemCard}>
            <Card.Content>
              <View style={styles.itemHeader}>
                <Text variant="titleMedium">{item.name}</Text>
                <IconButton
                  icon="delete"
                  size={20}
                  onPress={() => handleRemoveItem(item.id)}
                />
              </View>
              
              <Text variant="bodyMedium">Salsa: {item.sauce}</Text>
              {item.notes && (
                <Text variant="bodyMedium">Notas: {item.notes}</Text>
              )}
              
              <View style={styles.itemFooter}>
                <View style={styles.quantity}>
                  <IconButton
                    icon="minus"
                    size={20}
                    onPress={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                  />
                  <Text>{item.quantity}</Text>
                  <IconButton
                    icon="plus"
                    size={20}
                    onPress={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                  />
                </View>
                <Text variant="titleMedium">
                  ${(item.price * item.quantity).toFixed(2)}
                </Text>
              </View>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>

      <Card style={styles.summary}>
        <Card.Content>
          <List.Item
            title="Subtotal"
            right={() => <Text>${subtotal.toFixed(2)}</Text>}
          />
          <List.Item
            title="Envío"
            right={() => <Text>${delivery.toFixed(2)}</Text>}
          />
          <Divider style={styles.divider} />
          <List.Item
            title="Total"
            titleStyle={styles.total}
            right={() => (
              <Text style={styles.total}>${total.toFixed(2)}</Text>
            )}
          />
          
          <Button
            mode="contained"
            onPress={handleCheckout}
            style={styles.checkoutButton}
          >
            Proceder al Pago
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  itemsList: {
    flex: 1,
  },
  itemCard: {
    margin: 8,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  quantity: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summary: {
    margin: 8,
  },
  divider: {
    marginVertical: 8,
  },
  total: {
    fontWeight: 'bold',
  },
  checkoutButton: {
    marginTop: 16,
  },
}); 