import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import apiService from '../api/ApiService';
import adminApiService from '../api/AdminApiService';

export const useAdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [reload, setReload] = useState(false);
    const [totalPages, setTotalPages] = useState(1);
    const [page, setPage] = useState(1);

    useFocusEffect(
        useCallback(() => {
            const fetchData = async () => {
                try {

                    setLoading(true);
                    const activeOrders = await adminApiService.getActiveOrders(page);
                    setOrders(() => {
                        if (page === 1) return (activeOrders.data.orders || []);
                        return [...orders, ...(activeOrders.data.orders || [])];
                    });
                    setTotalPages(activeOrders?.data?.pagination?.totalPages || 1);
                } catch (err) {
                    setError('Error al cargar información');
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            };

            setOrders([]);
            setError('');
            setReload(false);
            fetchData();
        }, [reload, page])
    );

    const reloadData = () => setReload(true);

    const formatDate = (dateString) => {
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        };
        return new Date(dateString).toLocaleDateString('es-MX', options);
    };
    const formatAddress = (address) => {
        if (!address) {
            return "Pedido para recoger en sucursal"
        } else if (address) {
            return address;
        } else {
            return 'Error al cargar dirección de entrega'
        }
    };
    return {
        orders,
        error,
        loading,
        page,
        totalPages,
        formatAddress,
        setPage,
        reloadData,
        formatDate,
    };
};
