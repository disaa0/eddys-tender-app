import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text, Snackbar } from 'react-native-paper';
import { useState, useCallback, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { theme } from '../../../theme';
import useShippingAddresses from '../../../hooks/useShippingAddresses';

export default function EditAddress() {
    const { id } = useLocalSearchParams();
    const [street, setStreet] = useState('');
    const [houseNumber, setHouseNumber] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [neighborhood, setNeighborhood] = useState('');
    const [error, setError] = useState('');
    const [snackbar, setSnackbar] = useState({ visible: false, message: '' });
    const [originalAddress, setOriginalAddress] = useState(null);
    const [isModified, setIsModified] = useState(false);

    const { fetchAddressById, updateShippingAddress, loading, address } = useShippingAddresses();
    const router = useRouter();

    const limpiarFormulario = () => {
        setStreet('');
        setHouseNumber('');
        setPostalCode('');
        setNeighborhood('');
        setError('');
        setSnackbar({ visible: false, message: '' });
    };

    useEffect(() => {
        if (id) {
            (async () => {
                const fetchedAddress = await fetchAddressById(id);
                if (fetchedAddress) {
                    setStreet(fetchedAddress.street || '');
                    setHouseNumber(String(fetchedAddress.houseNumber || ''));
                    setPostalCode(String(fetchedAddress.postalCode || ''));
                    setNeighborhood(fetchedAddress.neighborhood || '');
                    setOriginalAddress(fetchedAddress);
                    setIsModified(false);
                }
            })();
        }
    }, [id]);


    useFocusEffect(
        useCallback(() => {
            if (!originalAddress) return;

            const hasChanged =
                street !== originalAddress.street ||
                houseNumber !== String(originalAddress.houseNumber) ||
                postalCode !== String(originalAddress.postalCode) ||
                neighborhood !== originalAddress.neighborhood;

            setIsModified(hasChanged);
        }, [street, houseNumber, postalCode, neighborhood, originalAddress])
    );

    const validateAddress = () => {
        if (!street || !houseNumber || !postalCode || !neighborhood) {
            return 'Todos los campos son requeridos';
        }
        if (isNaN(houseNumber) || isNaN(postalCode)) {
            return 'Los campos de número de casa y código postal deben ser numéricos';
        }
        return null;
    };

    const handleUpdateAddress = async () => {
        const validationError = validateAddress();
        if (validationError) {
            setSnackbar({ visible: true, message: validationError });
            return;
        }

        try {
            const updatedAddress = await updateShippingAddress(id, {
                street,
                houseNumber,
                postalCode,
                neighborhood,
            });

            if (updatedAddress?.idLocation) {
                // limpiarFormulario();
                setSnackbar({ visible: true, message: 'Dirección actualizada correctamente' });
                setTimeout(() => {
                    router.push('/profile/address');
                }, 1500);
            } else {
                console.log(updatedAddress.error);

                // Formatear errores para mostrar en el Snackbar
                const errorMessage = updatedAddress.error
                    .map((err) => `⚠️ ${err.path[0]}: ${err.message}`)
                    .join('\n');

                setSnackbar({ visible: true, message: errorMessage });
            }
        } catch (err) {
            console.log(err.response);
            setSnackbar({ visible: true, message: 'Error al actualizar la dirección' });
        }
    };


    const handleCancel = () => {
        limpiarFormulario();
        router.push('/profile/address');
    };

    return (
        <View style={styles.container}>
            <Text variant="titleLarge" style={styles.title}>
                Editar Dirección de Envío
            </Text>

            <TextInput
                mode="outlined"
                label="Calle"
                value={street}
                onChangeText={setStreet}
                style={styles.input}
                error={!!error}
                disabled={loading}
            />

            <TextInput
                mode="outlined"
                label="Número de Casa"
                value={houseNumber}
                onChangeText={setHouseNumber}
                style={styles.input}
                keyboardType="numeric"
                error={!!error}
                disabled={loading}
            />

            <TextInput
                mode="outlined"
                label="Código Postal"
                value={postalCode}
                onChangeText={setPostalCode}
                style={styles.input}
                keyboardType="numeric"
                error={!!error}
                disabled={loading}
            />

            <TextInput
                mode="outlined"
                label="Colonia"
                value={neighborhood}
                onChangeText={setNeighborhood}
                style={styles.input}
                error={!!error}
                disabled={loading}
            />

            <Button
                mode="contained"
                onPress={handleUpdateAddress}
                style={[styles.button, !isModified && styles.disabledButton]}
                loading={loading}
                disabled={!isModified || loading}
            >
                Guardar Cambios
            </Button>

            <Button
                mode="text"
                onPress={handleCancel}
                style={styles.cancelButton}
                disabled={loading}
            >
                Cancelar
            </Button>

            <View style={styles.snackbarContainer}>
                <Snackbar
                    visible={snackbar.visible}
                    onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
                    duration={5000}
                    style={styles.snackbar}
                >
                    {snackbar.message}
                </Snackbar>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        paddingBottom: 80,
        backgroundColor: theme.colors.surface,
    },
    title: {
        marginBottom: 20,
        color: theme.colors.primary,
        textAlign: 'center',
    },
    input: {
        marginBottom: 15,
        backgroundColor: theme.colors.surface,
    },
    button: {
        marginTop: 20,
    },
    disabledButton: {
        backgroundColor: '#aaa',
    },
    cancelButton: {
        marginTop: 10,
    },
    snackbarContainer: {
        position: 'absolute',
        bottom: 80,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    snackbar: {
        width: '90%',
        backgroundColor: theme.colors.primary,
        borderRadius: 10,
    },
});
