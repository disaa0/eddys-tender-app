import { useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import apiService from '../api/ApiService';
import { useCartRefresh } from '../context/CartRefreshContext';

export default function useCart() {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [personalizacion, setPersonalizacion] = useState([]);
    const { reloadCart } = useCartRefresh();

    const fetchCartItems = async () => {
        try {
            setError(null);
            setLoading(true);
            const response = await apiService.viewCartItems();
            console.log(response);

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
                        const response = await apiService.getProductPersonalizations(item.idProduct);
                        if (response?.data?.personalizations) {
                            // Añadir cada personalización y asociar el id del item
                            const personalizationsWithItemId = response.data.personalizations.map(p => ({
                                ...p,
                                idItemCart: item.idItemCart,
                            }));
                            allPersonalizations.push(...personalizationsWithItemId);
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
        }, [])
    );

    const updateQuantity = async (id, newQuantity, idProduct) => {
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
        updateQuantity,
        removeItem,
        refreshCart: fetchCartItems,
        personalizacion,
    };
}
