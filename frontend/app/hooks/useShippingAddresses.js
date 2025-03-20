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
        setLoading(true);
        setError(null);
        try {
            const response = await apiService.getShippingAdresses();
            // console.log(response);

            setAddresses(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            setError('Error al obtener direcciones');
            console.error("Error al obtener direcciones", err);
        } finally {
            setLoading(false);
        }
    };

    // Función para obtener una dirección por ID
    const fetchAddressById = async (id) => {
        setLoading(true);
        setError(null);

        try {
            console.log('Buscando dirección por ID:', id);
            const response = await apiService.getShippingAdresses();
            const fetchedAddresses = Array.isArray(response.data) ? response.data : [];
            console.log(fetchedAddresses);
            const foundAddress = fetchedAddresses.find((address) => address.idLocation == id);

            if (foundAddress) {
                return foundAddress; // Retornar en lugar de setear el estado
            } else {
                setError('Dirección no encontrada');
                return null;
            }
        } catch (err) {
            setError('Error al obtener la dirección');
            console.error("Error al obtener la dirección", err);
            return null;
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
        setLoading(true);
        setError(null);
        try {
            const { street, houseNumber, postalCode, neighborhood } = addressData;
            const response = await apiService.addShippingAdresses(street, houseNumber, postalCode, neighborhood);
            console.log(response);

            if (response.data) {
                setAddresses(prev => [...prev, response.data]);
                return response.data;
            }
        } catch (err) {
            console.error('Error al agregar la dirección', err);
            if (err?.response?.data?.error) return err.response.data;
        } finally {
            setLoading(false);
        }
    };

    const updateShippingAddress = async (id, addressData) => {
        setLoading(true);
        setError(null);
        try {
            const { street, houseNumber, postalCode, neighborhood } = addressData;
            const response = await apiService.updateShippingAddress(id, street, houseNumber, postalCode, neighborhood);
            console.log(response);

            if (response.data) {
                setAddresses(prev => prev.map(address => address.idLocation === id ? response.data : address));
                return response.data;
            }
        } catch (err) {
            console.error('Error al actualizar la dirección', err);
            if (err?.response?.data?.error) return err.response.data;
        } finally {
            setLoading(false);
        }
    }

    // Función para eliminar una dirección
    const deleteAddress = async (id) => {
        setLoading(true);
        try {
            await apiService.deleteShippingAddress(id);
            setAddresses(prevAddresses => prevAddresses.filter(address => address.idLocation !== id));
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
        updateShippingAddress,
    };
}
