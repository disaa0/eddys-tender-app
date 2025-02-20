import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Button, Text, TextInput, RadioButton, List, Divider } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useState } from 'react';

export default function Checkout() {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [address, setAddress] = useState({
    street: '',
    number: '',
    colony: '',
    reference: '',
  });

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
      // Aquí iría la integración con Stripe
      router.push('/orders');
    } catch (error) {
      // Manejar error de pago
    }
  };

  const handleCashPayment = () => {
    // Procesar orden para pago en efectivo
    router.push('/orders');
  };

  return (
    <ScrollView style={styles.container}>
      {/* Dirección de Entrega */}
      <Card style={styles.card}>
        <Card.Title title="Dirección de Entrega" />
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
        {paymentMethod === 'card' 
          ? 'Pagar con Tarjeta'
          : 'Confirmar Pedido - Pago en Efectivo'}
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 8,
  },
  input: {
    marginBottom: 12,
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
    margin: 16,
    marginBottom: 32,
  },
}); 