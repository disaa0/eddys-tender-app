import { View, StyleSheet, ScrollView, Text, FlatList } from 'react-native';
import { Card, Button, RadioButton, List, Divider, TextInput, ActivityIndicator } from 'react-native-paper';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { theme } from '../theme';
import apiService from '../api/ApiService';
import ConfirmationDialog from '../components/ConfirmationDialog';
import { useStripe } from '@stripe/stripe-react-native';
import useCart from '../hooks/useCart';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCartRefresh } from '../context/CartRefreshContext';

export default function Checkout() {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(0);
  const [shipmentType, setShipmentType] = useState(1);
  const [subtotal, setSubtotal] = useState(0.00);
  const [total, setTotal] = useState(0.00);
  const [delivery, setDelivery] = useState(0.00);
  const [order, setOrder] = useState({})
  const [purchaseSuccessfulDialogVisible, setPurchaseSuccessfulDialogVisible] = useState(false);
  const [purchaseErrorDialogVisible, setPurchaseErrorDialogVisible] = useState(false);
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState('card');
  const { reloadCart } = useCartRefresh();
  const [address, setAddress] = useState({
    street: '',
    houseNumber: '',
    neighborhood: '',
    postalCode: '',
  });
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
      setSelectedAddressId(0);
      setDelivery(0.00);
      setShipmentType(1);

    }, [])
  );


  useFocusEffect(
    useCallback(() => {
      const getCartTotal = async () => {
        try {
          setLoading(true);
          const data = await apiService.getCartTotal();
          setSubtotal(data.totalAmount.totalAmount);
          setTotal(data.totalAmount.totalAmount + delivery);
        } catch (err) {
          setError('Error al obtener total de la orden');
        } finally {
          setLoading(false);
        }
      };
      getCartTotal();
    }, [])
  );
  const createShippingAddress = async () => {
    try {
      setLoading(true);
      const data = await apiService.addShippingAdresses(address.street, address.houseNumber, address.postalCode, address.neighborhood);
      console.log('nuevaDirección', data)
    } catch (err) {
      setError('Error al crear dirección');
      setPurchaseErrorDialogVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleOnValueChangeAddressId = (value) => {
    setSelectedAddressId(value);
    if (value == 0) {
      setDelivery(0.00);
      setShipmentType(2)
    } else {
      setDelivery(35.00)
      setShipmentType(1)
    }
  }
  const handlePlaceOrder = () => {
    createShippingAddress();
    if (paymentMethod === 'card') {
      handleStripePayment();
    } else {
      handleCashPayment();
    }
  };

  const handleStripePayment = async () => {
    try {
      setLoading(true);
      if (shipmentType == 2) {
        const data = await apiService.createOrder(1, shipmentType, delivery);
        setOrder(data);
      } else {
        const data = await apiService.createOrder(2, shipmentType, delivery, 1);
        setOrder(data);
      }

      const { stripeClientSecret } = order.order;
      if (!stripeClientSecret) {
        setError("No se pudo generar el pago.");
        setPurchaseErrorDialogVisible(true);
      }



      // Initialize Stripe Payment Sheet
      const { error } = await initPaymentSheet({
        paymentIntentClientSecret: stripeClientSecret,
        merchantDisplayName: "Eddy's",
      });

      if (error) {
        setError("Error de Stripe.")
        setPurchaseErrorDialogVisible(true);
      }

      // Open Stripe Payment UI
      const { error: paymentError } = await presentPaymentSheet();

      if (paymentError) {
        setError("Error en el pago.");
        setPurchaseErrorDialogVisible(true);
      }

      setPurchaseSuccessfulDialogVisible(true);
      setTimeout(3000)
      router.push('./orders.js')
    } catch (error) {
      setError(error.message || "Error en el pago");
      setPurchaseErrorDialogVisible(true);
    } finally {
      reloadCart();
      setLoading(false);
    }
  };

  const handleCashPayment = async () => {
    try {
      setLoading(true);
      if (shipmentType == 2) {
        await apiService.createOrder(1, 2, delivery);
      } else {
        await apiService.createOrder(1, 1, delivery, selectedAddressId);
      }
      setPurchaseSuccessfulDialogVisible(true);
    } catch (error) {
      setError(error.message || "Error en el pago");
      setPurchaseErrorDialogVisible(true);
    } finally {
      reloadCart();
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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* Dirección de Entrega */}
        <Card style={styles.card}>
          <Card.Title title="Dirección de Entrega" />
          <Card.Content>
            {loading ? (
              <ActivityIndicator />
            ) : error ? (
              <Text>{error}</Text>
            ) : addresses.length == 0 ? (
              <Text>No hay direcciones disponibles</Text>
            ) : (
              <RadioButton.Group
                onValueChange={(value) => handleOnValueChangeAddressId(value)}
                value={selectedAddressId}
              >
                <RadioButton.Item
                  key={0}
                  label={"Recoger orden."}
                  value={0}
                />
                <Divider style={styles.divider} />
                {addresses.map((address) => (
                  <View>
                    <RadioButton.Item
                      key={address.idLocation}
                      label={`${address.idLocation}. ${address.street} ${address.houseNumber}, ${address.neighborhood}, ${address.postalCode}`}
                      value={address.idLocation}
                    />
                    <Divider style={styles.divider} />
                  </View>
                ))}
                <RadioButton.Item
                  key={addresses.length + 1}
                  label={"Añadir dirección"}
                  value={addresses.length + 1}
                />
              </RadioButton.Group>
            )}
            {selectedAddressId == (addresses.length + 1) && (
              <>
                <TextInput mode="outlined" label="Calle" value={address.street} onChangeText={text => setAddress({ ...address, street: text })} style={styles.input} />
                <TextInput mode="outlined" label="Número" value={address.houseNumber} onChangeText={text => setAddress({ ...address, houseNumber: text })} style={styles.input} keyboardType="number-pad" />
                <TextInput mode="outlined" label="Colonia" value={address.neighborhood} onChangeText={text => setAddress({ ...address, neighborhood: text })} style={styles.input} />
                <TextInput mode="outlined" label="Código Postal" value={address.postalCode} onChangeText={text => setAddress({ ...address, postalCode: text })} style={styles.input} keyboardType="number-pad" />
              </>
            )}
          </Card.Content>
        </Card>

        {/* Método de Pago */}
        <Card style={styles.card}>
          <Card.Title title="Método de Pago" />
          <Card.Content>
            <RadioButton.Group onValueChange={value => setPaymentMethod(value)} value={paymentMethod}>
              <RadioButton.Item label="Tarjeta de Crédito/Débito" value="card" />
              <RadioButton.Item label="Efectivo" value="cash" />
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
        <Button mode="contained" onPress={() => { router.push('/cart') }} style={[styles.confirmButton, { marginBottom: '10' }]} disabled={loading}>
          Volver al carrito
        </Button>

        {/* Dialogs */}
        <ConfirmationDialog visible={purchaseSuccessfulDialogVisible} onDismiss={() => setPurchaseSuccessfulDialogVisible(false)} onConfirm={() => { setPurchaseSuccessfulDialogVisible(false); router.push('/orders'); }} title="Compra exitosa" message="Su orden se ha creado con éxito." confirmButtonLabel="Continuar" />
        <ConfirmationDialog visible={purchaseErrorDialogVisible} onDismiss={() => setPurchaseErrorDialogVisible(false)} title="Error en compra" message={"Ha ocurrido un error, favor de reintentar. " + error} confirmButtonLabel="Reintentar" />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  card: {
    margin: 8,
    backgroundColor: theme.colors.surface,
    color: '#000000',
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