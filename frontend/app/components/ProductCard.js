import { View, Image, StyleSheet, Pressable } from 'react-native';
import { Surface, Text, TouchableRipple } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';
import { useCallback, useState } from 'react';
import apiService from '../api/ApiService';
import ConfirmationDialog from './ConfirmationDialog';
import { useCartRefresh } from '../context/CartRefreshContext';

export default function ProductCard({ product, onPress, isLastItem }) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState('');
  const [cartCount, setCartCount] = useState(0)
  const { name, price, description, imageSource } = product;
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const { reloadCart } = useCartRefresh();

  const onAddToCart = async (product) => {
    try {
      setLoading(true)
      const responseCartCount = await apiService.getCartQuantity(); // LLamada API

      if (responseCartCount.totalQuantity.totalQuantity >= 30) {
        setDialogVisible(true);
        setDialogMessage('Límite de productos alcanzado, máximo 30 productos por carrito.');
      } else {
        const response = await apiService.addOneToCartItem(product.idProduct)
        if (response.data.item.status === 200 || response?.data.cartId > 0) {
          reloadCart(); // Actualizar carrito
          setDialogVisible(true);
          setDialogMessage("Producto añadido al carrito");
        }
      }

    } catch (error) {
      setError('Error al agregar producto al carrito');
      console.error(error);
    } finally {
      setLoading(false)
    }

  }

  return (
    <Surface style={isLastItem ? styles.lastCard : styles.card} elevation={1}>
      <TouchableRipple onPress={onPress} style={styles.touchable}>
        <View style={styles.cardContainer}>
          {/* Envolver el contenido en un View separado con overflow hidden */}
          <View style={styles.contentWrapper}>
            {imageSource && (
              <Image
                source={imageSource}
                style={styles.cardImage}
                resizeMode="cover"
              />
            )}
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{name}</Text>
              {description && <Text style={styles.cardDescription}>{description}</Text>}
            </View>
            <View style={styles.priceAndCartContainer}>
              <Text style={styles.cardPrice}>${price.toFixed(2)}</Text>
              <Pressable
                style={styles.cartButton}
                onPress={(e) => {
                  e.stopPropagation();
                  onAddToCart(product);
                }}
              >
                <MaterialIcons name="add-shopping-cart" size={20} color="#fff" />
              </Pressable>
            </View>
          </View>
        </View>
      </TouchableRipple>

      <ConfirmationDialog
        visible={dialogVisible}
        onDismiss={() => setDialogVisible(false)}
        title="Producto agregado"
        message={dialogMessage || 'El producto ha sido agregado al carrito.'}
        onConfirm={() => setDialogVisible(false)}
        confirmButtonLabel="Aceptar"
        cancelButtonLabel=''
        onCancel={() => setDialogVisible(false)}
        loading={loading}
        error={error}
        onErrorDismiss={() => setError('')}
        onLoadingDismiss={() => setLoading('')}
      />
    </Surface>



  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 0,
    borderRadius: 12,
    backgroundColor: '#fff',
    height: 300,
    width: '100%'
  },
  contentWrapper: {
    overflow: 'hidden',
    borderRadius: 12,
    flex: 1
  },
  touchable: {
    flex: 1,
  },
  cardContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  cardImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#F5F5F5',
  },
  cardContent: {
    flex: 1,
    padding: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  // New style to align price and cart button in the same row
  priceAndCartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Aligns price on the left and button on the right
    alignItems: 'center', // Keeps them vertically aligned
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  cartButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContentWrapper: {
    flex: 1,
    overflow: 'hidden',
  },
  lastCard: {
    flexGrow: 1,
    width: '48%', // Mantiene el mismo ancho que los demás
    margin: 4,
    borderRadius: 12,
    overflow: 'hidden',
    height: 300,
    backgroundColor: '#fff',
  },
});