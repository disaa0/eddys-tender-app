import { useState, useEffect } from 'react';
import { ActivityIndicator, View, Text } from 'react-native';
import { Button } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import UserService from '../api/UserService';

const useProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadProducts = async () => {
        setLoading(true);
        setError(null);
        try {
            const products = await UserService.getProducts();
            setProducts(products);
        } catch (err) {
            setError(err.message || 'Error cargando productos');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProducts();
    }, []);

    // Recargar productos cuando la pestaña obtiene el foco
    useFocusEffect(
        useCallback(() => {
            loadProducts();
        }, [])
    );

    const renderLoading = () => (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#6200ea" />
            <Text>Cargando productos...</Text>
        </View>
    );

    const renderError = () => (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: 'red', marginBottom: 10 }}>Error: {error}</Text>
            <Button mode="contained" onPress={loadProducts}>
                Reintentar
            </Button>
        </View>
    );

    return { products, loading, error, reload: loadProducts, renderLoading, renderError };
};

export default useProducts;
