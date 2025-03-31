import { View, FlatList, StyleSheet, Alert, TouchableWithoutFeedback, Image, TouchableOpacity } from 'react-native';
import { Card, Text, Searchbar, ActivityIndicator, Switch } from 'react-native-paper';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { theme } from '../theme';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
const logo = require('../../assets/eddys.png');
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import AdminApiService from '../api/AdminApiService';
import CategoryChips from '../components/CategoryChips';
import SortChips from '../components/SortChips';
import { MaterialIcons } from '@expo/vector-icons';
import ProductCardAdmin from '../components/ProductCardAdmin';

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedFilter, setSelectedFilter] = useState('');
  const [filterIcon, setFilterIcon] = useState('filter-list');
  const [showFilters, setShowFilters] = useState(false);
  const router = useRouter();

  const CATEGORIES = ['Todos', 'Comida', 'Bebida'];
  const FILTERS = ['A-Z', 'Z-A', 'Más pedidos'];

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await AdminApiService.getProducts(page);
      console.log(response)
      setProducts(response.data.products);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadPopularProducts = async () => {
    try {
      setLoading(true);
      const response = await AdminApiService.getPopularProducts();
      console.log(response)
      setProducts(response.data.products);
      setTotalPages(response.data.totalPages);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load products on page change
  useEffect(() => {
    loadProducts();
  }, [page]);

  // Refresh products when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [])
  );

  const handleSelectedFilter = (filter) => {
    if (filter === selectedFilter) {
      setSelectedFilter('');
      setFilterIcon('filter-list');
    } else if (filter === 'Más pedidos') {
      setFilterIcon('star');
      setSelectedFilter(filter)
      loadPopularProducts()
    } else {
      setSelectedFilter(filter);
      setFilterIcon(filter);
    }
    setShowFilters(false);
  };

  const getProductTypeLabel = (idProductType) => {
    switch (idProductType) {
      case 1:
        return 'Comida';
      case 2:
        return 'Bebida';
      default:
        return 'Otro';
    }
  };

  // Función para filtrar productos
  const getFilteredProducts = () => {
    return products.filter((product) => {
      // Filtrar por categoría
      const categoryMatch = selectedCategory === 'Todos' || getProductTypeLabel(product.idProductType) === selectedCategory;

      // Filtrar por búsqueda
      const searchMatch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      return categoryMatch && searchMatch;
    });
  };

  //Funcion para ordenar productos
  const getSortedProducts = () => {
    return getFilteredProducts().sort((a, b) => {
      if (selectedFilter === 'A-Z') {
        return a.name.localeCompare(b.name);
      } else if (selectedFilter === 'Z-A') {
        return b.name.localeCompare(a.name);
      } else if (selectedFilter === 'Más pedidos') {
        return 0 //(b.orderCount || 0) - (a.orderCount || 0); // Sort by most ordered
      } else {
        return 0; // No sorting if filter is not recognized
      }
    });
  };

  const renderAdminProduct = ({ item, index }) => {
    // console.log('Renderizando producto:', item.name);
    const isLastItem = index === getSortedProducts().length - 1;
    // console.log(isLastItem)
    return (
      <ProductCardAdmin
        product={item}
        isLastItem={isLastItem}
      />
    );
  }



  if (loading && page === 1) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text>Error: {error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>

          <View style={styles.logoContainer}>
            <Image source={logo} style={styles.logo} />
          </View>

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
            <TouchableOpacity style={styles.sortButton} onPress={() => { setShowFilters(!showFilters); !showFilters ? setFilterIcon('X') : setFilterIcon('filter-list') }}
            >{
                (filterIcon == 'filter-list' || filterIcon == 'star')
                && (<MaterialIcons name={filterIcon} size={24} color="#ffffff" />)
                || (<Text style={{ color: theme.colors.background }} >{filterIcon}</Text>)
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
          <View style={styles.categoriesContainer}>
            <CategoryChips
              categories={CATEGORIES}
              selectedCategory={selectedCategory}
              onSelect={setSelectedCategory}
              horizontal={true}
            />
          </View>



          <FlatList
            data={getSortedProducts()} // Filtramos y sorteamos productos antes de renderizar
            numColumns={2}
            renderItem={renderAdminProduct}
            keyExtractor={(item) => item.idProduct.toString()}
            contentContainerStyle={styles.productList}
            ListEmptyComponent={
              !loading && (
                <View style={styles.centered}>
                  <Text>No hay productos disponibles.</Text>
                </View>
              )
            }
            onEndReached={() => {
              if (!loading && page < totalPages) {
                setPage((prevPage) => prevPage + 1);
              }
            }}
            onEndReachedThreshold={0.5}
            ListFooterComponent={loading && page > 1 ? <ActivityIndicator style={styles.loadingMore} /> : null}
          />

        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

export const styles = StyleSheet.create({
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
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    flex: 1,
    textAlign: 'center',
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
  sortButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    height: 50,
    borderRadius: 13,
    backgroundColor: theme.colors.primary,
    color: theme.colors.background,
    marginRight: 0,

  },
  filtersContainer: {
    paddingHorizontal: 0,
    marginBottom: 10,
    right: 0,
  },
  productCard: {
    width: '48%', // Ajusta el ancho para que haya espacio para 2 elementos en la fila
    margin: 4, // Espacio entre los productos
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  lastProductCard: {
    width: '50%', // Ajusta el ancho para que haya espacio para 2 elementos en la fila
    margin: 4, // Espacio entre los productos
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  cardImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#F5F5F5',
  },
  cardTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    fontSize: 16,
    fontWeight: 600,
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
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  productActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingMore: {
    padding: 16,
  },
  activeStatus: {
    color: theme.colors.primary,
  },
  inactiveStatus: {
    color: theme.colors.error,
  },
  productList: {
    width: '100%',
    minHeight: '100%', // Permite que crezca sin limitar el scroll
    padding: 4,
    paddingBottom: 120, // Asegura suficiente espacio para evitar que el navbar lo tape
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
