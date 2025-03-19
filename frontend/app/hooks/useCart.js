import { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import apiService from '../api/ApiService';

export default function useCart() {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    useFocusEffect(
        useCallback(() => {
            fetchCartItems();
        }, [])
    );

    const updateQuantity = (id, newQuantity) => {
        setCartItems((prevItems) =>
            prevItems.map((item) =>
                item.idItemCart === id ? { ...item, quantity: Math.max(1, newQuantity) } : item
            )
        );
    };

    const removeItem = async (id) => {
        try {
            const itemDeleted = await apiService.removeCartItem(id);
            console.log(itemDeleted);

            if (itemDeleted) {
                setCartItems((prevItems) => prevItems.filter((item) => item.idItemCart !== itemDeleted?.item?.idItemCart));
            }
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
    };
}
