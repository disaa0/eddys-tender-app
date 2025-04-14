import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import adminApiService from '../api/AdminApiService';

const useAdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    const getAll = async () => {
        setLoading(true);
        try {
            const response = await adminApiService.getAllOrders();
            if (response?.data?.length === 0) {
                setOrders([]);
                return;
            }
            setOrders(data);
        } catch (error) {
            console.error('Error fetching all orders:', error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            getAll();
        }, [])
    );

    return {
        orders,
        loading,
        getAll,
    };
};

export default useAdminOrders;