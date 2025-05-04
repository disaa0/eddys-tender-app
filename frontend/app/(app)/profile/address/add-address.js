import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text, Snackbar } from 'react-native-paper';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { theme } from '../../../theme';
import useShippingAddresses from '../../../hooks/useShippingAddresses';
import { SafeAreaView } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function AddAddress() {
    const [street, setStreet] = useState('');
    const [houseNumber, setHouseNumber] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [neighborhood, setNeighborhood] = useState('');
    const [error, setError] = useState('');
    const [snackbar, setSnackbar] = useState({ visible: false, message: '' });
    // const [snackbar, setSnackbar] = useState({ visible: true, message: 'Probando mi snackbar' });
    const { addShippingAddress, loading } = useShippingAddresses();

    const router = useRouter();

    const limpiarCampos = () => {
        setStreet('');
        setHouseNumber('');
        setPostalCode('');
        setNeighborhood('');
    }

    // Validación
    const validateAddress = () => {
        if (!street || !houseNumber || !postalCode || !neighborhood) {
            return 'Todos los campos son requeridos';
        }
        return null;
    };

    const handleAddAddress = async () => {
        const validationError = validateAddress();
        if (validationError) {
            setError(validationError);
            return;
        }

        setError('');

        // verificar si son numeros los campos pertinentes
        if (isNaN(houseNumber) || isNaN(postalCode)) {
            setSnackbar({ visible: true, message: 'Los campos de número de casa y código postal deben ser números' });
            return;
        }

        const newAddress = await addShippingAddress({
            street,
            houseNumber,
            postalCode,
            neighborhood
        });

        // console.log(newAddress);

        if (newAddress?.idLocation) {
            setSnackbar({ visible: true, message: 'Dirección añadida correctamente' });
            setTimeout(() => {
                router.push('/profile/address');
            }, 1500);
            // limpiar campos
            limpiarCampos();

        } else {
            console.log(newAddress);
            const errorMessage = newAddress?.error.map((err) => err.message).join(', ');
            setSnackbar({ visible: true, message: errorMessage });
        }
    };

    const handleCancel = () => {
        limpiarCampos();
        router.push('/profile/address');
    }

    return (
        <SafeAreaProvider>
            <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.primary }}>
                <View style={styles.container}>
                    <Text variant="titleLarge" style={styles.title}>
                        Agregar Dirección de Envío
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
                        onPress={handleAddAddress}
                        style={styles.button}
                        loading={loading}
                        disabled={loading}
                    >
                        Agregar Dirección
                    </Button>

                    <Button
                        mode="text"
                        onPress={handleCancel}
                        style={styles.cancelButton}
                        disabled={loading}
                    >
                        Cancelar
                    </Button>
                    {/* Contenedor absoluto para el Snackbar */}
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
            </SafeAreaView>
        </SafeAreaProvider>
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
    error: {
        color: theme.colors.error,
        marginBottom: 10,
        textAlign: 'center',
    },
    snackbarContainer: {
        position: 'absolute',
        bottom: 80, // Ajusta según la altura del navbar
        left: 0,
        right: 0,
        alignItems: 'center', // Centra el Snackbar
    },
    snackbar: {
        width: '90%',
        backgroundColor: theme.colors.primary,
        borderRadius: 10,
    },
});
