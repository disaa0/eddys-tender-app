import { View, FlatList, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Text, Searchbar } from 'react-native-paper';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { theme } from '../theme';
import { MaterialIcons } from '@expo/vector-icons';
import ProductCard from '../components/ProductCard';
import CategoryChips from '../components/CategoryChips';
import { SafeAreaView } from 'react-native-safe-area-context';
const logo = require('../../assets/eddys.png');
import Animated, { FadeInDown, FadeIn, FadeOut, FadeInUp, Layout } from 'react-native-reanimated';
import SortChips from '../components/SortChips';

const CATEGORIES = ['All', 'Combos', 'Bebidas', 'Complementos'];
const FILTERS = ['A-Z', 'Z-A', 'Más pedidos'];


export default function Index() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedFilter, setSelectedFilter] = useState('');
  const [filterIcon, setFilterIcon] = useState('filter-list');
  const [showFilters, setShowFilters] = useState(false);
  const router = useRouter();

  // Filtrar productos según la categoría seleccionada
  const filteredProducts =
    selectedCategory === 'All'
      ? PRODUCTS
      : PRODUCTS.filter((product) => product.category === selectedCategory);


  const handleSelectedFilter = (filter) => {
    if (filter == selectedFilter) {
      setSelectedFilter('')
      setFilterIcon('filter-list')
    } else {
      setSelectedFilter(filter)
      filter == 'Más pedidos' ? setFilterIcon('star') : null
      filter == 'A-Z' ? setFilterIcon(filter) : null
      filter == 'Z-A' ? setFilterIcon(filter) : null
    }
    setShowFilters(false)
  }
  const renderProduct = ({ item, index }) => {
    const imageSource = PRODUCT_IMAGES[item.imageKey];
    return (
      <Animated.View
        entering={FadeInDown.delay(index * 100).springify()} // Animación de entrada para cada producto
        layout={Layout.springify()} // Animación de reordenamiento
        style={styles.productContainer} // Estilo flexible para cada producto
      >
        <ProductCard
          product={{ ...item, imageSource }}
          onPress={() => router.push(`/product/${item.id}`)}
          onAddToCart={() => {
            // Implementar lógica para agregar al carrito
            router.push('/cart');
          }}
        />
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        <Animated.View entering={FadeInUp.duration(800)} style={styles.logoContainer}>
          <Image source={logo} style={styles.logo} />
        </Animated.View>

        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Buscar"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchbar}
            inputStyle={styles.searchInput}
            icon="magnify" // Ícono de lupa
            placeholderTextColor="#666" // Color del texto de placeholder
          />
          <TouchableOpacity style={styles.searchButton} onPress={() => setShowFilters(!showFilters)}
          >{
              (filterIcon == 'filter-list' || filterIcon == 'star')
              && (<MaterialIcons name={filterIcon} size={24} color="#ffffff" />) || (filterIcon)
            }

          </TouchableOpacity>
        </View>

        {/* Animación de filtros */}
        {(showFilters) && (
          <Animated.View
            entering={FadeIn.duration(300)}
            exiting={FadeOut.duration(300)}
            style={styles.filtersContainer}
          >
            <SortChips
              categories={FILTERS}
              selectedCategory={selectedFilter}
              onSelect={handleSelectedFilter}
              horizontal={false}
            />
          </Animated.View>
        )}

        {/* Componente de categorías con animación */}
        <Animated.View entering={FadeInDown.duration(600)}>
          <CategoryChips
            categories={CATEGORIES}
            selectedCategory={selectedCategory}
            onSelect={setSelectedCategory} // Actualiza la categoría seleccionada
          />
        </Animated.View>

        <FlatList
          data={filteredProducts}
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
    backgroundColor: '#ffffff',
    borderRadius: 17,
    height: 50,
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    fontSize: 16,
    color: '#000', // Color del texto ingresado
  },
  searchButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: theme.colors.primary,
    color: theme.colors.background,
  },
  productList: {
    padding: 16,
  },
  logo: {
    width: 300, // Ajusta el ancho del logo
    height: 90, // Ajusta la altura del logo
    resizeMode: 'contain', // Asegura que el logo se ajuste correctamente
  },
  logoContainer: {
    alignItems: 'center', // Centrar el logo horizontalmente
    marginTop: 10, // Espacio arriba del logo
    marginBottom: 10, // Espacio debajo del logo
  },
  productContainer: {
    flex: 1, // Ocupa el espacio disponible
    margin: 4, // Margen entre productos
    maxWidth: '50%', // Máximo 50% del ancho para 2 columnas
  },
  filtersContainer: {
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  orderContainer: {
    paddingHorizontal: 0,
    marginBottom: 10,
    right: 0,
  }
});
