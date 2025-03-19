import { View, StyleSheet, FlatList, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Card, Button, Text, List, IconButton, Divider } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import useCart from '../hooks/useCart';

export default function Cart() {
  const router = useRouter();
  const { cartItems, loading, error, updateQuantity, removeItem, refreshCart } = useCart();

  useFocusEffect(
    useCallback(() => {
      refreshCart();
    }, [])
  );

  const calculateTotals = (items) => {
    const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const delivery = 35;
    const total = subtotal + delivery;
    return { subtotal, delivery, total };
  };

  const { subtotal, delivery, total } = calculateTotals(cartItems);

  const handleCheckout = () => {
    router.push('/checkout');
  };

  if (loading) {
    return <ActivityIndicator size="large" style={styles.loader} />;
  }

  if (!loading && cartItems.length === 0) {
    return <Text style={styles.error}>No hay productos en el carrito</Text>;
  }

  if (error && cartItems.length === 0) {
    return <Text style={styles.error}>No hay productos en el carrito</Text>;
  }

  if (error) {
    return <Text style={styles.error}>Error al cargar el carrito</Text>;
  }

  return (
    <KeyboardAvoidingView
      style={styles.flexContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.idItemCart.toString()}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <Card style={styles.itemCard}>
            <Card.Content>
              <View style={styles.itemHeader}>
                <Text variant="titleMedium">{item.product.name}</Text>
                <IconButton icon="delete" size={20} onPress={() => removeItem(item.product.idProduct)} />
              </View>
              <Text variant="bodyMedium">Descripción: {item.product.description}</Text>
              <View style={styles.itemFooter}>
                <View style={styles.quantity}>
                  <IconButton icon="minus" size={20} onPress={() => updateQuantity(item.idItemCart, item.quantity - 1)} />
                  <Text>{item.quantity}</Text>
                  <IconButton icon="plus" size={20} onPress={() => updateQuantity(item.idItemCart, item.quantity + 1)} />
                </View>
                <Text variant="titleMedium">${(item.product.price * item.quantity).toFixed(2)}</Text>
              </View>
            </Card.Content>
          </Card>
        )}
        ListFooterComponent={
          <View style={styles.footerContainer}>
            <Card style={styles.summary}>
              <Card.Content>
                <List.Item title="Subtotal" right={() => <Text>${subtotal.toFixed(2)}</Text>} />
                <List.Item title="Envío" right={() => <Text>${delivery.toFixed(2)}</Text>} />
                <Divider style={styles.divider} />
                <List.Item title="Total" titleStyle={styles.total} right={() => <Text style={styles.total}>${total.toFixed(2)}</Text>} />
                <Button mode="contained" onPress={handleCheckout} style={styles.checkoutButton}>
                  Proceder al Pago
                </Button>
              </Card.Content>
            </Card>
          </View>
        }
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
  },
  listContainer: {
    paddingBottom: 100, // Espacio para que el footer no bloquee la lista
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
  footerContainer: {
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  summary: {
    borderRadius: 10,
    margin: 10,
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
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
});
