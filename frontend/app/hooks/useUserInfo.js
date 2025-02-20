import { useState, useEffect } from 'react';
import UserService from '../api/UserService'; // Importa el servicio
import { Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';

export function useUserInfo() {
    const [userInfoH, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useFocusEffect(() => {
        async function fetchUserInfo() {
            try {
                const data = await UserService.getUserInfo();
                setUserInfo(data);
                setLoading(false);
            } catch (err) {
                console.error('Error al obtener la información del usuario:', err);
                setError('Hubo un error al cargar la información');
                setLoading(false);

                // Mostrar un Alert en caso de error
                Alert.alert(
                    'Error',
                    'Hubo un problema al cargar la información del usuario. Inténtalo nuevamente más tarde.',
                    [{ text: 'OK' }]
                );
            }
        }

        fetchUserInfo();
    }, []);

    return { userInfoH, loading, error };
}
