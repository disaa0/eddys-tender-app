import { View, FlatList, StyleSheet, Alert } from 'react-native';
import { Card, Text, Searchbar, Button, ActivityIndicator, IconButton } from 'react-native-paper';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { theme } from '../theme';
import AdminApiService from '../api/AdminApiService';

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

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
      loadProducts(); // Reload products after toggle
    } catch (err) {
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

  const renderProduct = ({ item }) => (
    <Card
      style={styles.productCard}
      onPress={() => handleEditProduct(item.idProduct)}
    >
      <Card.Content>
        <View style={styles.productHeader}>
          <Text variant="titleMedium">{item.name}</Text>
          <IconButton
            icon="pencil"
            size={20}
            onPress={() => handleEditProduct(item.idProduct)}
          />
        </View>
        <Text variant="bodyMedium">Precio: ${item.price}</Text>
        <Text variant="bodyMedium">
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
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={handleBack}
        />
        <Text variant="titleLarge" style={styles.title}>Panel de Administración</Text>
        <IconButton
          icon="plus"
          size={24}
          onPress={handleAddProduct}
        />
      </View>

      <Searchbar
        placeholder="Buscar productos"
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.searchbar}
      />

      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.idProduct.toString()}
        contentContainerStyle={styles.productList}
        onEndReached={() => {
          if (page < totalPages) {
            setPage(page + 1);
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading && page > 1 ? (
            <ActivityIndicator style={styles.loadingMore} />
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
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
  searchbar: {
    margin: 16,
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingMore: {
    padding: 16,
  },
});
