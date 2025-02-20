import { useState, useEffect, useCallback } from 'react';
import UserService from '../api/UserService';
import { Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';

export function useUserInfo() {
    const [userInfoH, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchUserInfo = useCallback(async () => {
        setLoading(true);
        try {
            const data = await UserService.getUserInfo();
            setUserInfo(data);
            setError(null); // Limpiar error si la petición tiene éxito
        } catch (err) {
            console.error('Error al obtener la información del usuario:', err);
            setError('Hubo un error al cargar la información');
            Alert.alert(
                'Error',
                'Hubo un problema al cargar la información del usuario. Inténtalo nuevamente más tarde.',
                [{ text: 'OK' }]
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchUserInfo();
        }, [fetchUserInfo])
    );

    return { userInfoH, loading, error };
}
