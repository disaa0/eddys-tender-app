import { View, FlatList, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Text, Searchbar, ActivityIndicator, Button } from 'react-native-paper';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { theme } from '../theme';
import { MaterialIcons } from '@expo/vector-icons';
import ProductCard from '../components/ProductCard';
import CategoryChips from '../components/CategoryChips';
import { SafeAreaView } from 'react-native';
import SortChips from '../components/SortChips';
import { useFocusEffect } from '@react-navigation/native';
import apiService from '../api/ApiService';
import useUserProducts from '../hooks/useUserProducts';
import { API_URL } from '../config';

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

  const renderProduct = ({ item, index }) => {
    const isLastItem = (index === getSortedProducts().length - 1 && (getSortedProducts % 2 == 1));
    let image_url = item.image_url;
    if (image_url) {
      image_url = API_URL + image_url.replace('/api', '');
      image_url = { uri: image_url };
    } else {
      image_url = require('../../assets/products/tenders.png');
    }

    return (
      <View style={{ flex: 1, padding: 8 }}>
        <View
          style={styles.productContainer}
        >
          <ProductCard
            product={{
              ...item,
              imageSource: image_url,
            }}
            onPress={() => router.push(`/product/${item.idProduct}`)}
            isLastItem={isLastItem}
          />
        </View>
      </View>
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
        <Button mode="contained" onPress={refreshProducts} style={{ marginTop: 10 }}>
          Reintentar
        </Button>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View /* entering={FadeInUp.duration(800)} */ style={styles.logoContainer}>
          <Image source={logo} style={styles.logo} />
        </View>

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
          <View style={styles.filtersContainer}>
            <SortChips categories={FILTERS} selectedCategory={selectedFilter} onSelect={handleSelectedFilter} horizontal={false} />
          </View>
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
    backgroundColor: theme.colors.primary,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 0,
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
    marginBottom: 5,
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
  productList: {
    paddingBottom: 85,
  },
  productContainer: {
    flex: 1, // Ocupa el espacio disponible
    maxWidth: '100%', // Máximo 50% del ancho para 2 columnas
    margin: 0,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

});
