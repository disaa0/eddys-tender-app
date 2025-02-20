import { View, StyleSheet, FlatList } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { theme } from '../theme';

// Datos de ejemplo - En producción vendrían de una API/Backend
const FAVORITE_PRODUCTS = [
  { 
    id: 1, 
    name: 'Tender Box', 
    price: 129,
    image: require('../../assets/products/tenders.png')
  },
  { 
    id: 2, 
    name: 'Hamburguesa Clásica', 
    price: 109,
    image: require('../../assets/products/burger.png')
  },
];

export default function Favorites() {
  const router = useRouter();

  const renderProduct = ({ item }) => (
    <Card 
      style={styles.card}
      onPress={() => router.push(`/product/${item.id}`)}
    >
      <Card.Cover source={item.image} style={styles.cardImage} />
      <Card.Title
        title={item.name}
        titleStyle={styles.cardTitle}
        subtitle={`$${item.price.toFixed(2)}`}
        subtitleStyle={styles.cardPrice}
      />
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={FAVORITE_PRODUCTS}
        renderItem={renderProduct}
        numColumns={2}
        contentContainerStyle={styles.productList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  productList: {
    padding: 10,
  },
  card: {
    flex: 1,
    margin: 5,
    backgroundColor: theme.colors.surface,
  },
  cardImage: {
    height: 150,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardPrice: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
}); 