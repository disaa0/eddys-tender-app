import { View, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Button, Card, Text, TextInput } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons'; // Importar iconos de Expo
import apiService from '../../api/ApiService';

const defaultImage = require('../../../assets/products/tenders.png');

export default function ProductDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [quantity, setQuantity] = useState('1');
  const [product, setProduct] = useState(null);
  const [productImage, setProductImage] = useState(defaultImage);
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
    <ScrollView style={styles.container}>
      <Card>
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
          </View>
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

    </ScrollView >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  content: {
    padding: 16,
    flexGrow: 1, // Permite que el contenido crezca sin afectar el footer
  },
  bottomContainer: {
    position: '',
    bottom: 0,
    width: '100%',
    backgroundColor: 'white',
    padding: 16,
    flexDirection: 'row', // Botones en fila
    alignItems: 'center',
    justifyContent: 'space-between', // Espacio entre los botones
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
    height: '35vh',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // marginBottom: 16,
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
