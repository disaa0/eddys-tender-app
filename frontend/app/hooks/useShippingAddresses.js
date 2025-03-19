import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import apiService from '../api/ApiService'; // Asegúrate de que este servicio tenga la función getShippingAddresses

export default function useShippingAddresses() {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Función para obtener las direcciones
    const fetchAddresses = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiService.getShippingAdresses();
            console.log(response);

            if (response.data && Array.isArray(response.data)) {
                setAddresses(response.data); // Aseguramos que 'data' es un array
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

    // Llamar fetchAddresses cuando la pantalla se enfoque
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
            // console.log('Dirección agregada con éxito:', response);
            console.log(response);

            if (response.data) {
                // Extrae la dirección dentro del objeto `data`
                // setAddresses((prevAddresses) => [...prevAddresses, response.data]);
                return response.data; // Retorna la dirección agregada
            }
        } catch (err) {
            // console.log(err.response);
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
            setAddresses((prevAddresses) =>
                prevAddresses.filter((address) => address.idLocation !== id)
            );
        } catch (err) {
            console.error('Error al eliminar la dirección', err);
        } finally {
            setLoading(false);
        }
    };

    return {
        addresses,
        loading,
        error,
        fetchAddresses,
        addShippingAddress,
        deleteAddress,
    };
}
