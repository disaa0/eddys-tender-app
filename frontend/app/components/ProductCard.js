import { View, Image, StyleSheet, Pressable } from 'react-native';
import { Surface, Text, TouchableRipple } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';

export default function ProductCard({ product, onPress, onAddToCart }) {
  const { name, price, description, imageSource } = product;

  return (
    <Surface style={styles.card} elevation={1}>
      <TouchableRipple onPress={onPress} style={styles.touchable}>
        <View>
          {imageSource && (
            <Image 
              source={imageSource} 
              style={styles.cardImage} 
              resizeMode="cover"
            />
          )}
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{name}</Text>
            {description && (
              <Text style={styles.cardDescription}>{description}</Text>
            )}
            <Text style={styles.cardPrice}>${price.toFixed(2)}</Text>
          </View>
          <Pressable 
            style={styles.cartButton}
            onPress={(e) => {
              e.stopPropagation();
              onAddToCart?.();
            }}
          >
            <MaterialIcons name="add-shopping-cart" size={20} color="#fff" />
          </Pressable>
        </View>
      </TouchableRipple>
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 8,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  touchable: {
    flex: 1,
  },
  cardImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#F5F5F5',
  },
  cardContent: {
    padding: 12,
    paddingBottom: 48, // Espacio para el botón de carrito
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
  cardPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  cartButton: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 