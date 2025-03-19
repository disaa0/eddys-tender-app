import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import apiService from '../api/ApiService'; // Asegúrate de que este servicio tenga la función getShippingAdresses

export default function useShippingAddresses(userId) {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Función para obtener las direcciones
    const fetchAddresses = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiService.getShippingAdresses(userId); // Ahora se pasa el userId
            console.log(response);

            if (response.data && Array.isArray(response.data)) {
                setAddresses(response.data); // Asumimos que 'data' contiene las direcciones
            } else {
                setAddresses([]);
            }
        } catch (err) {
            setError(err);
            console.error("Error al obtener direcciones", err);
        } finally {
            setLoading(false);
        }
    };

    // Llamar fetchAddresses cuando la pantalla se enfoque
    useFocusEffect(
        useCallback(() => {
            fetchAddresses();
        }, []) // Si el userId cambia, vuelve a llamar fetchAddresses
    );

    // Función para agregar una nueva dirección
    const addShippingAddress = async (addressData) => {
        try {
            setLoading(true);
            setError(null);
            // Llamar a la API para agregar la nueva dirección
            const response = await apiService.addShippingAddress(userId, addressData); // Se pasa userId y addressData
            console.log('Dirección agregada con éxito:', response);

            // Si la respuesta es exitosa, actualiza las direcciones
            if (response.data) {
                setAddresses((prevAddresses) => [...prevAddresses, response.data]);
            }
        } catch (err) {
            setError('Error al agregar la dirección');
            console.error('Error al agregar la dirección', err);
        } finally {
            setLoading(false);
        }
    };

    // Función para eliminar una dirección
    const deleteAddress = async (id) => {
        try {
            setLoading(true);
            await apiService.deleteShippingAddress(id); // Asume que tienes un método de eliminación en apiService
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
        addShippingAddress, // Exponer la función de agregar dirección
        deleteAddress,
    };
}
