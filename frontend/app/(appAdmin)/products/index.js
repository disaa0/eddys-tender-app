import { View, FlatList, StyleSheet } from 'react-native';
import { Card, Text, Searchbar, Button, ActivityIndicator, FAB } from 'react-native-paper';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { theme } from '../../theme';
import AdminApiService from '../../api/AdminApiService';

export default function ProductsList() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();

    useEffect(() => {
        loadProducts();
    }, [page]);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const response = await AdminApiService.getProducts(page);

            if (response.message === "Productos obtenidos correctamente") {
                setProducts(prevProducts =>
                    page === 1 ? response.data.products : [...prevProducts, ...response.data.products]
                );
                setTotalPages(response.data.totalPages);
            }
        } catch (err) {
            setError(err.message);
            console.error('Error loading products:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLoadMore = () => {
        if (!loading && page < totalPages) {
            setPage(page + 1);
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await AdminApiService.toggleProductStatus(id);
            // Reload current page
            setPage(1);
            loadProducts();
        } catch (err) {
            console.error('Error toggling product status:', err);
        }
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

    const renderProduct = ({ item }) => (
        <Card style={styles.productCard}>
            <Card.Content>
                <View style={styles.cardHeader}>
                    <View>
                        <Text variant="titleMedium">{item.name}</Text>
                        <Text variant="bodySmall" style={styles.productType}>
                            {getProductTypeLabel(item.idProductType)}
                        </Text>
                    </View>
                    <Text variant="titleMedium" style={styles.price}>
                        ${item.price.toFixed(2)}
                    </Text>
                </View>

                <Text variant="bodyMedium" style={styles.description}>
                    {item.description}
                </Text>

                <View style={styles.cardActions}>
                    <Button
                        mode="contained"
                        onPress={() => handleToggleStatus(item.idProduct)}
                        style={[
                            styles.statusButton,
                            { backgroundColor: item.status ? theme.colors.error : theme.colors.primary }
                        ]}
                    >
                        {item.status ? 'Desactivar' : 'Activar'}
                    </Button>
                    <Button
                        mode="outlined"
                        onPress={() => router.push(`/products/${item.idProduct}`)}
                    >
                        Editar
                    </Button>
                    <Button
                        mode="outlined"
                        onPress={() => router.push(`/products/${item.idProduct}/customization`)}
                    >
                        Personalización
                    </Button>
                </View>
            </Card.Content>
        </Card>
    );

    if (error) {
        return (
            <View style={styles.centered}>
                <Text>Error: {error}</Text>
                <Button mode="contained" onPress={loadProducts} style={styles.retryButton}>
                    Reintentar
                </Button>
            </View>
        );
    }

    return (
        <View style={styles.container}>
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
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={
                    loading ? (
                        <ActivityIndicator style={styles.loadingMore} color={theme.colors.primary} />
                    ) : null
                }
                ListEmptyComponent={
                    !loading ? (
                        <Text style={styles.emptyText}>No hay productos disponibles</Text>
                    ) : null
                }
            />

            <FAB
                icon="plus"
                style={styles.fab}
                onPress={() => router.push('/products/add')}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
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
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    productType: {
        color: theme.colors.primary,
        marginTop: 4,
    },
    price: {
        color: theme.colors.primary,
    },
    description: {
        marginBottom: 16,
    },
    cardActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 8,
    },
    statusButton: {
        marginRight: 8,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    loadingMore: {
        padding: 16,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 32,
        color: '#666',
    },
    retryButton: {
        marginTop: 16,
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
        backgroundColor: theme.colors.primary,
    },
}); 