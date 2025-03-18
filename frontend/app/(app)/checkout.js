import { View, StyleSheet, ScrollView, Text, FlatList } from 'react-native';
import { Card, Button, RadioButton, List, Divider, TextInput } from 'react-native-paper';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { theme } from '../theme';
import apiService from '../api/ApiService';
import ConfirmationDialog from '../components/ConfirmationDialog';

export default function Checkout() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cart, setCart] = useState('');
  const [purchaseSuccessfulDialogVisible, setPurchaseSuccessfulDialogVisible] = useState(false);
  const [purchaseErrorDialogVisible, setPurchaseErrorDialogVisible] = useState(false);
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [address, setAddress] = useState({
    street: '',
    number: '',
    colony: '',
    reference: '',
  });

  useFocusEffect(
    useCallback(() => {
      const getCartItems = async () => {
        try {
          setCart('')
          setLoading(true);
          const cartData = await apiService.getCartItems();
          setCart(cartData.items.items);
        } catch (err) {
          setError('Error al obtener el carrito');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

      getCartItems();
    }, [])
  );

  // Datos de ejemplo - En producción vendrían de un estado global
  const subtotal = 258; // 2 Tender Box
  const delivery = 35;
  const total = subtotal + delivery;

  const handlePlaceOrder = () => {
    if (paymentMethod === 'card') {
      // Implementar integración con Stripe
      handleStripePayment();
    } else {
      // Procesar orden para pago en efectivo
      handleCashPayment();
    }
  };

  const handleStripePayment = async () => {
    try {
      setLoading(true)
      setError('Error en la compra')
      if (error != '') {
        setPurchaseErrorDialogVisible(true)
      } else {
        setPurchaseSuccessfulDialogVisible(true)
      }
    } catch (error) {
      // Manejar error de pago
    } finally {
      setLoading(false)
    }
  };

  const handleCashPayment = async () => {
    try {
      const order = await apiService.createOrder(1, 1, 1);
      setPurchaseSuccessfulDialogVisible(true)
      console.log(order);
    } catch (error) {
      console.error(error)
      setPurchaseErrorDialogVisible(true);
    } finally {
      setLoading(false)
    }

  };

  const renderProduct = ({ item }) => (
    < List.Item
      title={`${item.quantity} ${item.product.name}`}
      right={() => <Text>${(item.quantity * item.product.price).toFixed(2)}</Text>
      }
    />
  );

  return (
    <ScrollView style={styles.container}>
      {/* Dirección de Entrega */}
      <Card style={styles.card}>
        <View style={styles.cardTitleContainer}>
          <Card.Title title="Dirección de Entrega" />
        </View>
        <Card.Content>

          <TextInput
            mode="outlined"
            label="Calle"
            value={address.street}
            onChangeText={(text) => setAddress({ ...address, street: text })}
            style={styles.input}
          />
          <TextInput
            mode="outlined"
            label="Número"
            value={address.number}
            onChangeText={(text) => setAddress({ ...address, number: text })}
            style={styles.input}
            keyboardType="number-pad"
          />
          <TextInput
            mode="outlined"
            label="Colonia"
            value={address.colony}
            onChangeText={(text) => setAddress({ ...address, colony: text })}
            style={styles.input}
          />
          <TextInput
            mode="outlined"
            label="Referencias"
            value={address.reference}
            onChangeText={(text) => setAddress({ ...address, reference: text })}
            style={styles.input}
            multiline
            numberOfLines={2}
          />
        </Card.Content>
      </Card>

      {/* Método de Pago */}
      <Card style={styles.card}>
        <Card.Title title="Método de Pago" />
        <Card.Content>
          <RadioButton.Group
            onValueChange={value => setPaymentMethod(value)}
            value={paymentMethod}
          >
            <RadioButton.Item
              label="Tarjeta de Crédito/Débito"
              value="card"
            />
            <RadioButton.Item
              label="Efectivo al entregar"
              value="cash"
            />
          </RadioButton.Group>

          {paymentMethod === 'card' && (
            <View style={styles.cardInfo}>
              <Text variant="bodyMedium" style={styles.cardNotice}>
                Serás redirigido a la pasarela de pago segura de Stripe
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Resumen del Pedido */}
      <Card style={styles.card}>
        <Card.Title title="Resumen del Pedido" />
        <Card.Content>
          <FlatList
            data={cart}
            numColumns={1}
            renderItem={renderProduct}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={styles.productList}
            ListEmptyComponent={!loading && <View style={styles.centered}><Text>No hay productos disponibles.</Text></View>}

          />
          <Divider style={styles.divider} />
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
        </Card.Content>
      </Card>

      {/* Botón de Confirmar Pedido */}
      <Button
        mode="contained"
        onPress={handlePlaceOrder}
        style={styles.confirmButton}
      >
        Continuar
      </Button>
      <ConfirmationDialog
        visible={purchaseSuccessfulDialogVisible}
        onDismiss={() => setPurchaseSuccessfulDialogVisible(false)}
        onConfirm={() => { setPurchaseSuccessfulDialogVisible(false); router.push('/orders') }}
        title="Compra éxitosa"
        message="Su orden se ha creado con éxito."
        confirmButtonLabel="Continuar"
        cancelButtonLabel=""

      />
      <ConfirmationDialog
        visible={purchaseErrorDialogVisible}
        onDismiss={() => setPurchaseErrorDialogVisible(false)}
        onConfirm={() => setPurchaseErrorDialogVisible(false)}
        title="Error en compra"
        message={error}
        confirmButtonLabel="Reintentar"
        cancelButtonLabel=""

      />
      <Button
        mode="contained"
        onPress={() => { router.push('/cart'); }}
        style={styles.confirmButton}
      >
        Volver al carrito
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    paddingBottom: 10
  },
  card: {
    margin: 8,
    backgroundColor: theme.colors.surface,
  },
  cardTitleContainer: {
    flexDirection: 'row',
  },
  input: {
    marginBottom: 12,
    backgroundColor: theme.colors.surface
  },
  cardInfo: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#e3f2fd',
    borderRadius: 4,
  },
  cardNotice: {
    color: '#1976d2',
  },
  divider: {
    marginVertical: 8,
  },
  total: {
    fontWeight: 'bold',
  },
  confirmButton: {
    margin: 10,
    marginBottom: 0,
  },
}); 