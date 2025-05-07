import { useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import apiService from '../api/ApiService';
import { useCartRefresh } from '../context/CartRefreshContext';

export default function useCart() {
    const [cartItems, setCartItems] = useState([]);
    const [cartCount, setCartCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [personalizacion, setPersonalizacion] = useState([]);
    const { reloadCart } = useCartRefresh();

    const fetchCartCount = async () => {
        try {
            const responseCartCount = await apiService.getCartQuantity(); // API call
            setCartCount(responseCartCount.totalQuantity.totalQuantity);
        } catch (error) {
            console.error('Failed to fetch cart quantity:', error);
        }
    };

    const fetchCartItems = async () => {
        try {
            setError(null);
            setLoading(true);
            const response = await apiService.viewCartItems();
            //console.log(response);

            // Extraemos la lista de productos correctamente
            if (response.items && Array.isArray(response.items.items)) {
                setCartItems(response.items.items);
            } else {
                setCartItems([]); // En caso de error en la estructura
            }
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const loadAllPersonalizations = async () => {
            try {
                if (cartItems.length > 0) {
                    const allPersonalizations = [];

                    for (const item of cartItems) {
                        const response = await apiService.getPersonalizationsItemCart(item.idItemCart);
                        // console.log(response.data);
                        if (response?.data) {
                            // Añadir cada personalización a la lista
                            const personalizationsSelectedByItemCart = response.data.map((personalization) => ({
                                idItemCart: item.idItemCart,
                                productPersonalization: personalization.productPersonalization,
                            }));
                            allPersonalizations.push(...personalizationsSelectedByItemCart);
                        }
                    }

                    setPersonalizacion(allPersonalizations);
                } else {
                    setPersonalizacion([]);
                }
            } catch (err) {
                console.error(err);
            }
        };

        loadAllPersonalizations();
    }, [cartItems]);


    useFocusEffect(
        useCallback(() => {
            fetchCartItems();
            fetchCartCount();
        }, [])
    );

    const updateQuantity = async (id, newQuantity, idProduct) => {
        fetchCartCount();
        setCartItems((prevItems) =>
            prevItems.map((item) =>
                item.idItemCart === id ? { ...item, quantity: Math.max(1, newQuantity) } : item
            )
        );
        try {
            const response = await apiService.addCartItem(idProduct, newQuantity);
            console.log(response);
            reloadCart();
        } catch (err) {
            console.error(err);
        }

    };

    const loadPersonalizacion = async (id) => {
        try {
            const response = await apiService.getProductPersonalizations(id);
            console.log(response);
            setPersonalizacion(response?.data?.personalizations);
        } catch (err) {
            console.error(err);
        }
    };

    const removeItem = async (id) => {
        try {
            const itemDeleted = await apiService.removeCartItem(id);
            console.log(itemDeleted);

            if (itemDeleted) {
                setCartItems((prevItems) => prevItems.filter((item) => item.idItemCart !== itemDeleted?.item?.idItemCart));
            }
            reloadCart();
        } catch (err) {
            console.log(err);
        }
    };

    return {
        cartItems,
        loading,
        error,
        cartCount,
        updateQuantity,
        removeItem,
        refreshCart: fetchCartItems,
        personalizacion,
    };
}
