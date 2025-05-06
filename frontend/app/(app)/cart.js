import { View, StyleSheet, FlatList, ActivityIndicator, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { Card, Button, Text, List, IconButton, Divider } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import useCart from '../hooks/useCart';
import { SafeAreaView } from 'react-native';
import { theme } from '../theme';


export default function Cart() {
  const router = useRouter();
  const { cartItems, loading, error, personalizacion, updateQuantity, removeItem, refreshCart } = useCart();

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
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>El carrito esta vacio</Text>
        <Text style={styles.errorTextDescription}>Inicia agregando tus proximos productos.</Text>
        <TouchableOpacity
          onPress={() => { router.push('/'); }}
          style={styles.goBackButton}
        >
          <Text style={styles.goBackButtonText}>Regresar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (error && cartItems.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <IconButton icon="cart-off" size={50} color="red" />
        <Text style={styles.errorText}>El carrito esta vacio</Text>
      </View>
    );
  }


  if (error) {
    console.log(error);
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error al cargar el carrito</Text>
        <Text style={styles.errorTextDescription}>{error.Error}</Text>
        <TouchableOpacity
          onPress={() => router.push('/')}
          style={styles.goBackButton}
        >
          <Text style={styles.goBackButtonText}>Regresar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // console.log(cartItems);
  console.log(personalizacion);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
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
                    <IconButton icon="delete" size={20} onPress={() => { removeItem(item.product.idProduct); }} />
                  </View>
                  <Text variant="bodyMedium">Descripción: {item.product.description}</Text>
                  {personalizacion && personalizacion.length > 0 &&
                    personalizacion
                      .filter(p => p.idItemCart === item.idItemCart)
                      .length > 0 && (
                      <View style={styles.personalizationsContainer}>
                        <Text style={styles.personalizationsTitle}>Extras:</Text>
                        {personalizacion
                          .filter(p => p.productPersonalization.idProduct === item.idProduct)
                          .map((p, index) => (
                            <Text key={index} style={styles.personalizationItem}>• {p.productPersonalization.personalization.name}</Text>
                          ))}
                      </View>
                    )}

                  <View style={styles.itemFooter}>
                    <View style={styles.quantity}>
                      <IconButton icon="minus" size={20} onPress={() => { updateQuantity(item.idItemCart, item.quantity - 1, item.product.idProduct); }} disabled={item.quantity === 1} />
                      <Text>{item.quantity}</Text>
                      <IconButton icon="plus" size={20} onPress={() => { updateQuantity(item.idItemCart, item.quantity + 1, item.product.idProduct); }} />
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
                    {/* <List.Item title="Envío" right={() => <Text>${delivery.toFixed(2)}</Text>} />
                    <Divider style={styles.divider} />
                    <List.Item title="Total" titleStyle={styles.total} right={() => <Text style={styles.total}>${total.toFixed(2)}</Text>} /> */}
                    <Button mode="contained" onPress={handleCheckout} style={styles.checkoutButton}>
                      Proceder al Pago
                    </Button>
                  </Card.Content>
                </Card>
              </View>
            }
          />
        </KeyboardAvoidingView>
      </View>
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
    backgroundColor: '#fff',
    paddingBottom: 30,
  },
  flexContainer: {
    flex: 1,
  },
  listContainer: {
    backgroundColor: theme.colors.surface,
  },
  itemCard: {
    margin: 8,
    backgroundColor: theme.colors.surface,
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
    backgroundColor: theme.colors.surface,
    marginBottom: '40',
  },
  summary: {
    borderRadius: 10,
    margin: 10,
    backgroundColor: theme.colors.surface,
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
  personalizationsContainer: {
    marginTop: 8,
    paddingLeft: 10,
  },
  personalizationsTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
  },
  personalizationItem: {
    fontSize: 14,
    color: '#555',
  },

});
