import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import apiService from '../api/ApiService';

export default function useShippingAddresses() {
    const [addresses, setAddresses] = useState([]);
    const [address, setAddress] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Función para obtener todas las direcciones
    const fetchAddresses = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiService.getShippingAdresses();
            console.log(response);

            if (response.data && Array.isArray(response.data)) {
                setAddresses(response.data);
            } else {
                setAddresses([]);
            }
        } catch (err) {
            setError('Error al obtener direcciones');
            console.error("Error al obtener direcciones", err);
        } finally {
            setLoading(false);
        }
    };

    // Función para obtener una dirección por ID
    const fetchAddressById = async (id) => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiService.getShippingAddressById(id);
            console.log(response);

            if (response.data) {
                setAddress(response.data);
            } else {
                setAddress(null);
            }
        } catch (err) {
            setError('Error al obtener la dirección');
            console.error("Error al obtener la dirección", err);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchAddresses();
        }, [])
    );

    // Función para agregar una nueva dirección
    const addShippingAddress = async (addressData) => {
        try {
            setLoading(true);
            setError(null);

            const { street, houseNumber, postalCode, neighborhood } = addressData;

            const response = await apiService.addShippingAdresses(street, houseNumber, postalCode, neighborhood);
            console.log(response);

            if (response.data) {
                return response.data;
            }
        } catch (err) {
            console.error('Error al agregar la dirección', err);
            if (err?.response?.data?.error) return err.response.data;
        } finally {
            setLoading(false);
        }
    };

    // Función para eliminar una dirección
    const deleteAddress = async (id) => {
        try {
            setLoading(true);
            await apiService.deleteShippingAddress(id);
            setAddresses((prevAddresses) => prevAddresses.filter((address) => address.idLocation !== id));
        } catch (err) {
            console.error('Error al eliminar la dirección', err);
        } finally {
            setLoading(false);
        }
    };

    return {
        addresses,
        address,
        loading,
        error,
        fetchAddresses,
        fetchAddressById,
        addShippingAddress,
        deleteAddress,
    };
}