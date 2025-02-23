import { View, FlatList, StyleSheet, Image } from 'react-native';
import { Card, Text, Searchbar, Chip, Surface } from 'react-native-paper';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { theme } from '../theme';
import { MaterialIcons } from '@expo/vector-icons';
import ProductCard from '../components/ProductCard';
import CategoryChips from '../components/CategoryChips';
import { SafeAreaView } from 'react-native-safe-area-context';

const CATEGORIES = ['All', 'Combos', 'Bebidas', 'Complementos'];
export const FILTERS = ['A-Z', 'Z-A', 'Más pedidos'];

// Importar imágenes de manera segura
const PRODUCT_IMAGES = {
  tenders: require('../../assets/products/tenders.png'),
  burger: require('../../assets/products/burger.png'),
  // limonada: require('../../assets/products/limonada.png'),
  // papas: require('../../assets/products/papas.png')
};

const PRODUCTS = [
  {
    id: 1,
    name: 'Tenders',
    price: 165,
    category: 'Combos',
    imageKey: 'tenders',
    description: 'Deliciosas tiras de pollo empanizadas',
  },
  {
    id: 2,
    name: 'Burger',
    price: 165,
    category: 'Combos',
    imageKey: 'burger',
    description: 'Hamburguesa clásica con queso',
  },
  {
    id: 3,
    name: 'Limonada',
    price: 40,
    category: 'Bebidas',
    imageKey: 'limonada',
    description: 'Limonada natural',
  },
  {
    id: 4,
    name: 'Orden de papas',
    description: '250 gr',
    price: 30,
    category: 'Complementos',
    imageKey: 'papas',
  },
];

export default function Index() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedFilter, setSelectedFilter] = useState('');
  const router = useRouter();

  const renderProduct = ({ item }) => {
    const imageSource = PRODUCT_IMAGES[item.imageKey];
    return (
      <ProductCard
        product={{ ...item, imageSource }}
        onPress={() => router.push(`/product/${item.id}`)}
        onAddToCart={() => {
          // Implementar lógica para agregar al carrito
          router.push('/cart');
        }}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>EDDY'S</Text>
          <MaterialIcons name="person" size={24} color={theme.colors.primary} />
        </View>

        <View style={styles.searchContainer}>
          <MaterialIcons
            name="search"
            size={24}
            color="#666"
            style={styles.searchIcon}
          />
          <Searchbar
            placeholder="Buscar"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchbar}
            inputStyle={styles.searchInput}
            icon={() => null}
          />
        </View>
        <CategoryChips
          categories={FILTERS}
          selectedCategory={selectedFilter}
          onSelect={setSelectedFilter}
        />

        <CategoryChips
          categories={CATEGORIES}
          selectedCategory={selectedCategory}
          onSelect={setSelectedCategory}
        />

        <FlatList
          data={PRODUCTS}
          numColumns={2}
          renderItem={renderProduct}
          contentContainerStyle={styles.productList}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff', // Asegura que el notch no muestre un color incorrecto
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchbar: {
    flex: 1,
    elevation: 0,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    height: 40,
  },
  searchInput: {
    fontSize: 16,
  },
  productList: {
    padding: 16,
  },
});
