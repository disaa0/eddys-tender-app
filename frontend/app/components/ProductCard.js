import { View, Image, StyleSheet, Pressable } from 'react-native';
import { Surface, Text, TouchableRipple } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';

export default function ProductCard({ product, onPress, onAddToCart }) {
  const { name, price, description, imageSource } = product;

  return (
    <Surface style={styles.card} elevation={1}>
      <TouchableRipple onPress={onPress} style={styles.touchable}>
        <View style={styles.cardContainer}>
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
          {/* New container for price and cart button */}
          <View style={styles.priceAndCartContainer}>
            <Text style={styles.cardPrice}>${price.toFixed(2)}</Text>
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
        </View>
      </TouchableRipple>
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 4,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
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
});