import { View, StyleSheet, ScrollView, Image, TouchableOpacity, StatusBar } from 'react-native';
import { Button, Card, Text, TextInput } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons'; // Importar iconos de Expo
import apiService from '../../api/ApiService';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import PersonalizationList from '../../components/PersonalizationList';

const defaultImage = require('../../../assets/products/tenders.png');

export default function ProductDetails() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [quantity, setQuantity] = useState('1');
  const [product, setProduct] = useState(null);
  const [productImage, setProductImage] = useState(defaultImage);
  const [personalizations, setPersonalizations] = useState([]);
  const [showPersonalizations, setShowPersonalizations] = useState(false);
  const [selectedPersonalizations, setSelectedPersonalizations] = useState([]);
  const [loading, setLoading] = useState(true);

  const addProductToCart = async (idprod, quantity) => {
    try {
      setLoading(true)
      console.log(product.idProduct)
      quantity = parseInt(quantity)
      const response = await apiService.addCartItem(idprod, quantity);
      console.log(response)
      router.push('/cart')
      // setProduct(null);
      setProductImage(defaultImage);
      setQuantity('1');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false)
    }

  }


  const productId = parseInt(id, 10); // Asegurar que sea un número

  useEffect(() => {
    if (!isNaN(productId)) {
      loadProductDetails();
      loadProductPersonalizations(productId);
    }
  }, [productId]);

  const loadProductDetails = async () => {
    try {
      console.log(`Fetching product with ID: ${productId}`);
      const response = await apiService.getProductById(productId);
      setProduct(response);

      try {
        const responseImage = await apiService.getProductImageById(productId);
        setProductImage(responseImage);
      } catch (err) {
        if (err.response?.status === 404) {
          console.warn('Imagen no encontrada, usando imagen por defecto.');
          setProductImage(defaultImage);
        } else {
          console.error('Error al cargar la imagen:', err);
        }
      }
    } catch (err) {
      console.error('Error fetching product:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleShowPersonalizations = () => {
    if (personalizations.length > 0) {
      console.log('Personalizaciones disponibles:', personalizations);
      // Aquí puedes mostrar un modal o una pantalla con las personalizaciones disponibles
      setShowPersonalizations(true);
    } else {
      console.log('No hay personalizaciones disponibles para este producto.');
    }
  }

  const loadProductPersonalizations = async (productId) => {
    try {
      const response = await apiService.getProductPersonalizations(productId);
      console.log('Personalizaciones:', response);

      if (response?.data?.personalizations && response.data.personalizations.length > 0) {
        setPersonalizations(response.data.personalizations);
      }
    } catch (error) {
      console.error('Error al cargar personalizaciones:', error);
    }
  };

  const handleGoBack = () => {
    // Devolver los valores a su estado inicial
    // setProduct(null);
    setProductImage(defaultImage);
    setQuantity('1');
    // Regresar a la pantalla anterior
    router.back();
  };

  if (loading) {
    return <Text style={styles.loadingText}>Cargando producto...</Text>;
  }

  if (!product) {
    return <Text style={styles.errorText}>Error al cargar el producto.</Text>;
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={[styles.safeArea,]} edges={['top']}>
        <View style={styles.mainContainer}>
          {/* <ScrollView style={styles.scrollContainer} > */}
          <Card style={{ borderRadius: 20, overflow: 'hidden', flex: 1 }}>
            {/* Contenedor de imagen con botón de regreso */}
            <View style={styles.imageContainer}>
              <Card.Cover source={typeof productImage === 'string' ? { uri: productImage } : productImage} style={styles.image} />
              <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
            </View>

            <Card.Content style={styles.content}>
              <Text variant="headlineSmall">{product.name}</Text>

              <View style={styles.descripcionContainer}>
                <Text variant="bodyLarge" style={styles.description}>
                  {product.description}
                </Text>
              </View>
              {!showPersonalizations && (
                <View style={styles.quantityContainer}>
                  <TouchableOpacity
                    onPress={() => setQuantity(prev => Math.max(1, parseInt(prev) - 1))}
                    style={styles.quantityButton}
                  >
                    <Text style={styles.quantityText}>−</Text>
                  </TouchableOpacity>

                  <Text style={styles.quantityNumber}>{quantity}</Text>

                  <TouchableOpacity
                    onPress={() => setQuantity(prev => (parseInt(prev) + 1).toString())}
                    style={styles.quantityButton}
                  >
                    <Text style={styles.quantityText}>+</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.cartButton}
                    onPress={() => { handleShowPersonalizations() }}
                  >
                    <Text style={styles.cartText}>
                      Personalizar
                    </Text>
                  </TouchableOpacity>
                </View>)}

              {/* lista de personalizaciones con su respectivo check */}
              {showPersonalizations && (
                <PersonalizationList
                  personalizations={personalizations}
                  selectedPersonalizations={selectedPersonalizations}
                  setSelectedPersonalizations={setSelectedPersonalizations}
                  setShowPersonalizations={setShowPersonalizations}
                />
              )}
            </Card.Content>
          </Card>
          <View style={styles.bottomContainer}>
            <TouchableOpacity style={styles.priceButton}>
              <Text style={styles.priceText}>${(product.price * parseInt(quantity || '1')).toFixed(2)}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cartButton}
              onPress={() => addProductToCart(productId, quantity)}
            >
              <Text style={styles.cartText}>
                Agregar al Carrito
              </Text>
            </TouchableOpacity>
          </View>
          {/* </ScrollView > */}
        </View>
      </SafeAreaView>
    </SafeAreaProvider >
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mainContainer: {
    flex: 1, // Para que ocupe toda la pantalla
    backgroundColor: '#fff',
    paddingTop: StatusBar.currentHeight,
    paddingHorizontal: 10,

  },
  content: {
    flexGrow: 1, // Para que el contenido crezca y ocupe el espacio disponible
    justifyContent: 'space-between', // Distribuye los elementos en la pantalla
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    height: 200,
    resizeMode: 'cover',
  },
  description: {
    marginVertical: 8,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 20,
  },
  bottomContainer: {
    width: "100%",
    backgroundColor: "white",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  priceButton: {
    backgroundColor: '#E74C3C', // Color rojo similar a la imagen
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5, // Efecto de sombra en Android
  },

  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },

  cartButton: {
    backgroundColor: '#2D221D', // Color oscuro similar al botón de la imagen
    flex: 1, // Para que ocupe más espacio
    marginLeft: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },

  cartText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  descripcionContainer: {
    marginBottom: 16,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
    marginBottom: 100,

  },
  quantityButton: {
    backgroundColor: '#E74C3C', // Color rojo similar a la imagen
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5, // Sombra en Android
  },

  quantityText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },

  quantityNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    marginHorizontal: 20,
  },

});
