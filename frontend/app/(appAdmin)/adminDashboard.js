import { View, FlatList, StyleSheet, Alert, TouchableWithoutFeedback, Image, TouchableOpacity } from 'react-native';
import { Card, Text, Searchbar, Button, ActivityIndicator, IconButton, Switch } from 'react-native-paper';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { theme } from '../theme';
import { SafeAreaView } from 'react-native-safe-area-context';
const logo = require('../../assets/eddys.png');
import Animated, { FadeInDown, FadeIn, FadeOut, FadeInUp, Layout } from 'react-native-reanimated';
import AdminApiService from '../api/AdminApiService';
import CategoryChips from '../components/CategoryChips';
import { MaterialIcons } from '@expo/vector-icons';

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedFilter, setSelectedFilter] = useState('X');
  const [showFilters, setShowFilters] = useState(false);
  const router = useRouter();

  const CATEGORIES = ['Todos', 'Comida', 'Bebida'];
  const FILTERS = ['X', 'A-Z', 'Z-A', 'Más pedidos'];

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await AdminApiService.getProducts(page);
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

  const handleToggleStatus = async (id) => {
    try {
      await AdminApiService.toggleProductStatus(id);

      setProducts(products.map(product =>
        product.idProduct === id
          ? { ...product, status: !product.status }
          : product
      ));

      await loadProducts();
    } catch (err) {
      Alert.alert(
        'Error',
        'No se pudo cambiar el estado del producto. Por favor, intente nuevamente.',
        [{ text: 'OK' }]
      );
      console.error('Error toggling product status:', err);
    }
  };

  const handleEditProduct = (productId) => {
    router.push({
      pathname: '/(appAdmin)/product/[id]',
      params: { id: productId }
    });
  };

  const handleBack = () => {
    Alert.alert(
      'Salir del Panel',
      '¿Deseas salir del panel de administración?',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Salir',
          onPress: () => router.push('/(app)')
        }
      ]
    );
  };

  const handleAddProduct = () => {
    router.push('/(appAdmin)/addProduct');
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

  const renderProduct = ({ item }) => (
    <Card
      style={styles.productCard}
      onPress={() => handleEditProduct(item.idProduct)}
    >
      <Card.Content>
        <View style={styles.productHeader}>
          <Text variant="titleMedium">{item.name}</Text>
          <View style={styles.productActions}>
            <TouchableWithoutFeedback
              onPress={(e) => {
                e.stopPropagation();
                // handleToggleStatus(item.idProduct);
              }}
            >
              <View>
                <Switch
                  value={item.status}
                  onValueChange={() => handleToggleStatus(item.idProduct)} // Llama la función toggle
                />
              </View>
            </TouchableWithoutFeedback>

            <TouchableWithoutFeedback
              onPress={(e) => {
                e.stopPropagation();
                handleEditProduct(item.idProduct);
              }}
            >
              <View>
                <IconButton
                  icon="pencil"
                  size={20}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </View>
        <Text variant="bodySmall" style={styles.productType}>
          {getProductTypeLabel(item.idProductType)}
        </Text>
        <Text variant="bodyMedium">Precio: ${item.price}</Text>
        <Text variant="bodyMedium" style={item.status ? styles.activeStatus : styles.inactiveStatus}>
          Estado: {item.status ? 'Activo' : 'Inactivo'}
        </Text>
      </Card.Content>
    </Card>
  );

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
          >
            <MaterialIcons name="filter-list" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
        {/* Animación de filtros */}
        {showFilters && (
          <Animated.View
            entering={FadeIn.duration(300)}
            exiting={FadeOut.duration(300)}
            style={styles.filtersContainer}
          >
            <CategoryChips
              categories={FILTERS}
              selectedCategory={selectedFilter}
              onSelect={setSelectedFilter}
            />
          </Animated.View>
        )}
        {/* Componente de categorías con animación */}

        <CategoryChips
          categories={CATEGORIES}
          selectedCategory={selectedCategory}
          onSelect={setSelectedCategory}
        />

        <FlatList
          data={getFilteredProducts()} // Filtramos productos antes de renderizar
          renderItem={renderProduct}
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
  searchButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: theme.colors.primary,
  },
  productList: {
    padding: 16,
  },
  productCard: {
    marginBottom: 16,
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
});
