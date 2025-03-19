import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text, Snackbar } from 'react-native-paper';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
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
    const { fetchAddressById, updateShippingAddress, loading } = useShippingAddresses();

    const router = useRouter();

    useEffect(() => {
        const fetchAddress = async () => {
            if (!id) return;
            const address = await fetchAddressById(id);
            if (address) {
                setStreet(address.street);
                setHouseNumber(String(address.houseNumber));
                setPostalCode(String(address.postalCode));
                setNeighborhood(address.neighborhood);
            }
        };
        fetchAddress();
    }, [id]);

    const validateAddress = () => {
        if (!street || !houseNumber || !postalCode || !neighborhood) {
            return 'Todos los campos son requeridos';
        }
        return null;
    };

    const handleUpdateAddress = async () => {
        const validationError = validateAddress();
        if (validationError) {
            setError(validationError);
            return;
        }
        setError('');

        if (isNaN(houseNumber) || isNaN(postalCode)) {
            setSnackbar({ visible: true, message: 'Los campos de número de casa y código postal deben ser números' });
            return;
        }

        const updatedAddress = await updateShippingAddress(id, {
            street,
            houseNumber,
            postalCode,
            neighborhood
        });

        if (updatedAddress?.idLocation) {
            setSnackbar({ visible: true, message: 'Dirección actualizada correctamente' });
            setTimeout(() => {
                router.push('/profile/address');
            }, 1500);
        } else {
            const errorMessage = updatedAddress?.error?.map(err => err.message).join(', ');
            setSnackbar({ visible: true, message: errorMessage || 'Error al actualizar la dirección' });
        }
    };

    const handleCancel = () => {
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
                label="Barrio"
                value={neighborhood}
                onChangeText={setNeighborhood}
                style={styles.input}
                error={!!error}
                disabled={loading}
            />

            <Button
                mode="contained"
                onPress={handleUpdateAddress}
                style={styles.button}
                loading={loading}
                disabled={loading}
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
        backgroundColor: theme.colors.background,
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
