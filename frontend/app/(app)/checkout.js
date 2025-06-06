import { View, StyleSheet, ScrollView, Text, FlatList } from 'react-native';
import { Card, Button, RadioButton, List, Divider, TextInput, ActivityIndicator } from 'react-native-paper';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useState, useEffect } from 'react';
import { theme } from '../theme';
import apiService from '../api/ApiService';
import ConfirmationDialog from '../components/ConfirmationDialog';
import { useStripe } from '@stripe/stripe-react-native';
import useCart from '../hooks/useCart';
import { SafeAreaView } from 'react-native';
import { useCartRefresh } from '../context/CartRefreshContext';

export default function Checkout() {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(-1);
  const [shipmentType, setShipmentType] = useState(1);
  const [subtotal, setSubtotal] = useState(0.00);
  const [total, setTotal] = useState(0.00);
  const [delivery, setDelivery] = useState(0.00);
  const [order, setOrder] = useState({});
  const [reload, setReload] = useState(0);
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
      const fetchData = async () => {
        try {
          setLoading(true);

          const [addressesRes, cartTotalRes] = await Promise.all([
            apiService.getShippingAdresses(),
            apiService.getCartTotal(),
          ]);
          setAddresses(addressesRes.data);
          setSubtotal(cartTotalRes.totalAmount.totalAmount);

          // Set defaults
          setOrder({});
          setSelectedAddressId(-1);
          setAddress({
            street: '',
            houseNumber: '',
            neighborhood: '',
            postalCode: '',
          })
          setDelivery(0.00);
          setShipmentType(2);
          setError('');
        } catch (err) {
          setError('Error al cargar datos');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }, [reload])
  );

  useEffect(() => {
    setTotal(subtotal + delivery);
  }, [delivery, subtotal]);

  const createShippingAddress = async () => {
    try {
      setLoading(true);
      const data = await apiService.addShippingAdresses(address.street, address.houseNumber, address.postalCode, address.neighborhood);
      setReload(reload => reload + 1)
    } catch (err) {
      setError('Error al crear dirección.');
      setPurchaseErrorDialogVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleOnValueChangeAddressId = (value) => {
    setSelectedAddressId(value)
    console.log(value)
    if (value == -1) {
      setDelivery(0);
      setShipmentType(2);

    } else {
      setDelivery(35);
      setShipmentType(1);
    }
  }
  const handlePlaceOrder = () => {
    if (selectedAddressId == (0)) {
      setError('Seleccione una dirección de entrega válida.')
      setPurchaseErrorDialogVisible(true)
    } else if (paymentMethod === 'card') {
      handleStripePayment();
    } else {
      handleCashPayment();
    }
  };

  const handleStripePayment = async () => {
    try {
      setLoading(true);
      let data
      if (shipmentType == 2) {
        data = await apiService.createOrder(2, shipmentType, delivery);
      } else {
        data = await apiService.createOrder(2, shipmentType, delivery, selectedAddressId);
      }
      setOrder(data);
      const { stripeClientSecret } = await data.order;
      if (!stripeClientSecret) {
        setError("No se pudo generar el pago.");
        setPurchaseErrorDialogVisible(true);
      }

      // Initialize Stripe Payment Sheet
      const { error: paymentSheetError } = await initPaymentSheet({
        paymentIntentClientSecret: stripeClientSecret,
        merchantDisplayName: "Eddy's",
      });

      if (paymentSheetError) {
        //console.log(paymentError);
        setError("Error de Stripe.");
      }

      // Open Stripe Payment UI
      const { error: paymentError } = await presentPaymentSheet();

      if (!paymentError && (error == '')) {
        try {
          await apiService.disableCart();
        } catch (error) {
          //console.log(error)
          setError(error)
          setPurchaseErrorDialogVisible(true);
        }
        setPurchaseSuccessfulDialogVisible(true);
        setTimeout(3000);
        router.push('/orders');
      } else if (paymentError.code != "Canceled") {
        //console.log(paymentError);
        setError("Error en el pago.");
        setPurchaseErrorDialogVisible(true);
      } else if (paymentError) {
        //console.log(paymentError);
      }

    } catch (error) {
      setError(error.message || 'Error en el pago');
      setPurchaseErrorDialogVisible(true);
      console.log(error)
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
      try {
        await apiService.disableCart();
      } catch (error) {
        //console.log(error)
        setError(error)
        setPurchaseErrorDialogVisible(true);
      }
      setPurchaseSuccessfulDialogVisible(true);
      setTimeout(3000);
      router.push('/orders');
    } catch (error) {
      setError(error.message || "Error en el pago.");
      setPurchaseErrorDialogVisible(true);
      console.log(error)
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
    // console.log(item)
    // Filtrar personalizaciones para este item
    const extras = personalizacion.filter(p => p.idItemCart === item.idItemCart);
    //console.log(extras)
    return (
      <List.Item
        title={`${item.quantity} x ${item.product.name}`}
        description={() =>
          extras.length > 0 && (
            <View>
              <Text style={{ fontWeight: 'bold' }}>Extras:</Text>
              {extras.map((p, index) => (
                <Text key={index}>• {p?.productPersonalization?.personalization.name}</Text>
              ))}
            </View>
          )
        }
        right={() => (
          <Text>${(item.quantity * item.product.price).toFixed(2)}</Text>
        )}
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
            {loading ? (<ActivityIndicator />)
              : addresses.length == 0
                ? ((
                  <RadioButton.Group
                    onValueChange={(value) => handleOnValueChangeAddressId(value)}
                    value={selectedAddressId}
                    key={selectedAddressId}
                  >
                    <RadioButton.Item
                      key={-1}
                      label={"Recoger orden"}
                      value={-1}
                    />
                    <Divider style={styles.divider} />
                    <RadioButton.Item
                      key={0}
                      label={"Añadir dirección"}
                      value={0}
                    />
                  </RadioButton.Group>
                ))
                : (
                  <RadioButton.Group
                    onValueChange={(value) => handleOnValueChangeAddressId(value)}
                    value={selectedAddressId}
                    key={selectedAddressId}
                  >
                    <RadioButton.Item
                      key={-1}
                      label={"Recoger orden"}
                      value={-1}
                    />
                    {addresses.map((address, index) => (
                      <View>
                        <Divider style={styles.divider} />
                        <RadioButton.Item
                          key={address.idLocation}
                          label={`${address.street} ${address.houseNumber}, ${address.neighborhood}, ${address.postalCode}`}
                          value={address.idLocation}
                        />
                      </View>
                    ))}
                    <Divider style={styles.divider} />
                    <RadioButton.Item
                      key={0}
                      label={"Añadir dirección"}
                      value={0}
                    />
                  </RadioButton.Group>
                )}
            {(selectedAddressId == 0) && (
              <>
                <TextInput mode="outlined" label="Calle" value={address.street} onChangeText={text => setAddress({ ...address, street: text })} style={styles.input} />
                <TextInput mode="outlined" label="Número" value={address.houseNumber} onChangeText={text => setAddress({ ...address, houseNumber: text })} style={styles.input} keyboardType="number-pad" />
                <TextInput mode="outlined" label="Colonia" value={address.neighborhood} onChangeText={text => setAddress({ ...address, neighborhood: text })} style={styles.input} />
                <TextInput mode="outlined" label="Código Postal" value={address.postalCode} onChangeText={text => setAddress({ ...address, postalCode: text })} style={styles.input} keyboardType="number-pad" />
                <Button mode="contained" onPress={() => { createShippingAddress() }} style={[styles.confirmButton, { marginBottom: '10' }]} disabled={loading}>
                  <Text>Guardar</Text>
                </Button>
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
            <List.Item title="Total" titleStyle={styles.total} right={() => <Text style={styles.total}>${total.toFixed(2)}</Text>} /> */
          </Card.Content>
        </Card>

        {/* Botón de Confirmar Pedido */}
        <Button mode="contained" onPress={handlePlaceOrder} style={styles.confirmButton} disabled={loading}>
          <Text>{loading ? "Procesando..." : "Continuar"}</Text>
        </Button>
        <Button mode="contained" onPress={() => { router.push('/cart') }} style={[styles.confirmButton, { marginBottom: '10' }]} disabled={loading}>
          <Text>Volver al carrito</Text>
        </Button>

        {/* Dialogs */}
        <ConfirmationDialog visible={purchaseSuccessfulDialogVisible} onDismiss={() => setPurchaseSuccessfulDialogVisible(false)} onConfirm={() => { setPurchaseSuccessfulDialogVisible(false); router.push('/orders'); }} title="Compra exitosa" message="Su orden se ha creado con éxito." confirmButtonLabel="Continuar" />
        <ConfirmationDialog visible={purchaseErrorDialogVisible} onDismiss={() => { setPurchaseErrorDialogVisible(false); }} onConfirm={() => setPurchaseErrorDialogVisible(false)} title="Error en compra" message={"Ha ocurrido un error, favor de reintentar. " + error} confirmButtonLabel="Reintentar" />
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
    backgroundColor: theme.colors.surface,
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
