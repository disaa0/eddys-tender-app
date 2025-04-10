import { View, FlatList, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Text, Searchbar, ActivityIndicator, Button } from 'react-native-paper';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { theme } from '../theme';
import { MaterialIcons } from '@expo/vector-icons';
import ProductCard from '../components/ProductCard';
import CategoryChips from '../components/CategoryChips';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp, Layout } from 'react-native-reanimated';
import SortChips from '../components/SortChips';
import AdminApiService from '../api/AdminApiService';
import { useFocusEffect } from '@react-navigation/native';
import apiService from '../api/ApiService';
import useUserProducts from '../hooks/useUserProducts';

const logo = require('../../assets/eddys.png');

export default function Index() {
  const {
    products,
    loading,
    error,
    page,
    totalPages,
    setPage,
    selectedFilter,
    setSelectedFilter,
    loadPopularProducts,
    refreshProducts,
  } = useUserProducts();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [filterIcon, setFilterIcon] = useState('filter-list');
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const router = useRouter();

  const CATEGORIES = ['Todos', 'Comida', 'Bebida'];
  const FILTERS = ['A-Z', 'Z-A', 'Más pedidos'];

  const onRefreshFn = async () => {
    setLoading(true);
    setRefreshing(true);
    setPage(1); // Reinicia la paginación
    try {
      await loadProducts(); // Vuelve a cargar los productos
    } catch (error) {
      console.error(error);
    } finally {
      setRefreshing(false);
    }
  };

  const loadProducts = async () => {
    try {
      setProducts([]);
      setError(null);
      setLoading(true);
      const response = await apiService.getProducts(page);
      setProducts(response?.data?.products);
      setTotalPages(response?.data?.totalPages);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // useEffect(() => {
  //   loadProducts();
  // }, [page]);

  useFocusEffect(
    useCallback(() => {
      refreshProducts();
    }, [])
  );

  const handleSelectedFilter = (filter) => {
    if (filter === selectedFilter) {
      setSelectedFilter('');
      setFilterIcon('filter-list');
    } else if (filter === 'Más pedidos') {
      setFilterIcon('star');
      setSelectedFilter(filter);
      loadPopularProducts();
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

  const getFilteredProducts = () => {
    return products.filter((product) => {
      const categoryMatch = selectedCategory === 'Todos' || getProductTypeLabel(product.idProductType) === selectedCategory;
      const searchMatch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const activeProducts = product.status == 1;
      return categoryMatch && searchMatch && activeProducts;
    });
  };

  const getSortedProducts = () => {
    return getFilteredProducts().sort((a, b) => {
      if (selectedFilter === 'A-Z') return a.name.localeCompare(b.name);
      if (selectedFilter === 'Z-A') return b.name.localeCompare(a.name);
      return a.name.localeCompare(b.name);
    });
  };

  const renderProduct = ({ item, index }) => (
    <View style={{ flex: 1, padding: 8 }}>
      <Animated.View
        entering={FadeInDown.delay(index * 100).springify()}
        layout={Layout.springify()}
        style={styles.productContainer}
      >
        <ProductCard
          product={{
            ...item,
            imageSource: require('../../assets/products/tenders.png'),
          }}
          onPress={() => router.push(`/product/${item.idProduct}`)}
        />
      </Animated.View>
    </View>
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
        <Button mode="contained" onPress={refreshProducts} style={{ marginTop: 10 }}>
          Reintentar
        </Button>
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
            icon="magnify"
            placeholderTextColor="#666"
          />
          <TouchableOpacity style={styles.searchButton} onPress={() => setShowFilters(!showFilters)}>
            {(filterIcon === 'filter-list' || filterIcon === 'star') ? (
              <MaterialIcons name={filterIcon} size={24} color="#ffffff" />
            ) : (
              <Text style={{ color: theme.colors.background }}>{filterIcon}</Text>
            )}
          </TouchableOpacity>
        </View>

        {showFilters && (
          <Animated.View entering={FadeInDown.duration(300)} style={styles.filtersContainer}>
            <SortChips categories={FILTERS} selectedCategory={selectedFilter} onSelect={handleSelectedFilter} horizontal={false} />
          </Animated.View>
        )}

        <FlatList
          data={getSortedProducts()}
          numColumns={2}
          renderItem={renderProduct}
          keyExtractor={(item) => item.idProduct.toString()}
          contentContainerStyle={styles.productList}
          refreshing={refreshing}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text>No hay productos disponibles</Text>
            </View>
          }
          ListHeaderComponent={
            <>
              <CategoryChips categories={CATEGORIES} selectedCategory={selectedCategory} onSelect={setSelectedCategory} />
              {loading && <ActivityIndicator size="large" />}
            </>
          }
          ListHeaderComponentStyle={{ paddingHorizontal: 16, marginBottom: 10 }}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          stickyHeaderIndices={[0]}
          onRefresh={refreshProducts}
          onEndReached={() => {
            if (!loading && page < totalPages) setPage((prevPage) => prevPage + 1);
          }}
          onEndReachedThreshold={0.5}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  logo: {
    width: 300,
    height: 90,
    resizeMode: 'contain',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
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
  },
  searchButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    height: 50,
    borderRadius: 13,
    backgroundColor: theme.colors.primary,
  },
  filtersContainer: {
    paddingHorizontal: 0,
    marginBottom: 10,
  },
  productList: {
    padding: 4,
    paddingBottom: 85,
  },
  productContainer: {
    flex: 1, // Ocupa el espacio disponible
    padding: 0, // Margen entre productos
    maxWidth: '100%', // Máximo 50% del ancho para 2 columnas
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

});