import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import apiService from '../api/ApiService';
import adminApiService from '../api/AdminApiService';

export const useAdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [reload, setReload] = useState(false);

    useFocusEffect(
        useCallback(() => {
            const fetchData = async () => {
                try {
                    setLoading(true);
                    const addressesData = await apiService.getShippingAdresses();
                    const activeOrders = await adminApiService.getActiveOrders();
                    setOrders(activeOrders.data.orders || []);
                    setAddresses(addressesData.data || []);
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
        }, [reload])
    );

    const reloadData = () => setReload(true);

    const formatAddress = (addressIdString) => {
        if (!addressIdString) {
            return "Pedido para recoger en sucursal";
        }
        const addressId = Number(addressIdString);
        const addressInfo = addresses[addressId - 1];
        return addressInfo
            ? `${addressInfo.street} ${addressInfo.houseNumber}, ${addressInfo.neighborhood}, ${addressInfo.postalCode}`
            : "Dirección no encontrada";
    };

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

    return {
        orders,
        addresses,
        error,
        loading,
        reloadData,
        formatAddress,
        formatDate,
    };
};
