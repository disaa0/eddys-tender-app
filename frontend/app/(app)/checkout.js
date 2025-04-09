import { View, StyleSheet, ScrollView, Text, FlatList } from 'react-native';
import { Card, Button, RadioButton, List, Divider, TextInput } from 'react-native-paper';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { theme } from '../theme';
import apiService from '../api/ApiService';
import ConfirmationDialog from '../components/ConfirmationDialog';
//import { useStripe } from '@stripe/stripe-react-native';
import useCart from '../hooks/useCart';

export default function Checkout() {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cart, setCart] = useState([]);
  const [subtotal, setSubtotal] = useState(0.00);
  const [total, setTotal] = useState(0.00);
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
  const delivery = 35;
  const { cartItems, personalizacion } = useCart();

  // useFocusEffect(
  //   useCallback(() => {
  //     const getCartItems = async () => {
  //       try {
  //         setLoading(true);
  //         const cartData = await apiService.getCartItems();
  //         setCart(cartData.items.items);
  //       } catch (err) {
  //         setError('Error al obtener el carrito');
  //       } finally {
  //         setLoading(false);
  //       }
  //     };
  //     getCartItems();
  //   }, [])
  // );

  useFocusEffect(
    useCallback(() => {
      const getCartTotal = async () => {
        try {
          setLoading(true);
          const data = await apiService.getCartTotal();
          setSubtotal(data.totalAmount.totalAmount);
          setTotal(data.totalAmount.totalAmount + delivery);
        } catch (err) {
          setError('Error al crear orden');
        } finally {
          setLoading(false);
        }
      };
      getCartTotal();
    }, [])
  );

  const handlePlaceOrder = () => {
    if (paymentMethod === 'card') {
      handleStripePayment();
    } else {
      handleCashPayment();
    }
  };

  const handleStripePayment = async () => {
    try {
      setLoading(true);
      const order = await apiService.createOrder(2, 1, 1);
      const { stripeClientSecret } = order.order;

      if (!stripeClientSecret) {
        throw new Error("No se pudo generar el pago");
      }

      // Initialize Stripe Payment Sheet
      const { error } = await initPaymentSheet({
        paymentIntentClientSecret: stripeClientSecret,
        merchantDisplayName: "Eddy's",
      });

      if (error) {
        throw new Error(error.message);
      }

      // Open Stripe Payment UI
      const { error: paymentError } = await presentPaymentSheet();

      if (paymentError) {
        throw new Error(paymentError.message);
      }

      setPurchaseSuccessfulDialogVisible(true);
    } catch (error) {
      setError(error.message || "Error en el pago");
      setPurchaseErrorDialogVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCashPayment = async () => {
    try {
      setLoading(true);
      await apiService.createOrder(1, 1, 1);
      setPurchaseSuccessfulDialogVisible(true);
    } catch (error) {
      setError(error.message || "Error en el pago");
      setPurchaseErrorDialogVisible(true);
    } finally {
      setLoading(false);
    }
  };

  // const renderProduct = ({ item }) => (
  //   <List.Item
  //     title={`${item.quantity} ${item.product.name}`}
  //     right={() => <Text>${(item.quantity * item.product.price).toFixed(2)}</Text>}
  //   />
  // );


  const renderProduct = ({ item }) => {
    // Filtrar personalizaciones para este item
    const extras = personalizacion.filter(p => p.idProduct === item.idProduct);

    return (
      <List.Item
        title={`${item.quantity} ${item.product.name}`}
        description={() =>
          extras.length > 0 && (
            <View>
              <Text style={{ fontWeight: 'bold' }}>Extras:</Text>
              {extras.map((p, index) => (
                <Text key={index}>• {p.personalization.name}</Text>
              ))}
            </View>
          )
        }
        right={() => <Text>${(item.quantity * item.product.price).toFixed(2)}</Text>}
      />
    );
  };


  return (
    <ScrollView style={styles.container}>
      {/* Dirección de Entrega */}
      <Card style={styles.card}>
        <Card.Title title="Dirección de Entrega" />
        <Card.Content>
          <TextInput mode="outlined" label="Calle" value={address.street} onChangeText={text => setAddress({ ...address, street: text })} style={styles.input} />
          <TextInput mode="outlined" label="Número" value={address.number} onChangeText={text => setAddress({ ...address, number: text })} style={styles.input} keyboardType="number-pad" />
          <TextInput mode="outlined" label="Colonia" value={address.colony} onChangeText={text => setAddress({ ...address, colony: text })} style={styles.input} />
          <TextInput mode="outlined" label="Referencias" value={address.reference} onChangeText={text => setAddress({ ...address, reference: text })} style={styles.input} multiline numberOfLines={2} />
        </Card.Content>
      </Card>

      {/* Método de Pago */}
      <Card style={styles.card}>
        <Card.Title title="Método de Pago" />
        <Card.Content>
          <RadioButton.Group onValueChange={value => setPaymentMethod(value)} value={paymentMethod}>
            <RadioButton.Item label="Tarjeta de Crédito/Débito" value="card" />
            <RadioButton.Item label="Efectivo al entregar" value="cash" />
          </RadioButton.Group>
        </Card.Content>
      </Card>

      {/* Resumen del Pedido */}
      <Card style={styles.card}>
        <Card.Title title="Resumen del Pedido" />
        <Card.Content>
          <FlatList data={cartItems} renderItem={renderProduct} keyExtractor={(item, index) => index.toString()} contentContainerStyle={styles.productList} />
          <Divider style={styles.divider} />
          <List.Item title="Subtotal" right={() => <Text>${subtotal.toFixed(2)}</Text>} />
          <List.Item title="Envío" right={() => <Text>${delivery.toFixed(2)}</Text>} />
          <Divider style={styles.divider} />
          <List.Item title="Total" titleStyle={styles.total} right={() => <Text style={styles.total}>${total.toFixed(2)}</Text>} />
        </Card.Content>
      </Card>

      {/* Botón de Confirmar Pedido */}
      <Button mode="contained" onPress={handlePlaceOrder} style={styles.confirmButton} disabled={loading}>
        {loading ? "Procesando..." : "Continuar"}
      </Button>
      <Button mode="contained" onPress={() => { router.push('/cart') }} style={styles.confirmButton} disabled={loading}>
        Volver al carrito
      </Button>

      {/* Dialogs */}
      <ConfirmationDialog visible={purchaseSuccessfulDialogVisible} onDismiss={() => setPurchaseSuccessfulDialogVisible(false)} onConfirm={() => { setPurchaseSuccessfulDialogVisible(false); router.push('/orders'); }} title="Compra exitosa" message="Su orden se ha creado con éxito." confirmButtonLabel="Continuar" />
      <ConfirmationDialog visible={purchaseErrorDialogVisible} onDismiss={() => setPurchaseErrorDialogVisible(false)} title="Error en compra" message={error} confirmButtonLabel="Reintentar" />
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