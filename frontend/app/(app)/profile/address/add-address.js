import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { theme } from '../../../theme';

export default function AddAddress() {
    const [street, setStreet] = useState('');
    const [houseNumber, setHouseNumber] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [neighborhood, setNeighborhood] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    // Validation function
    const validateAddress = () => {
        if (!street || !houseNumber || !postalCode || !neighborhood) {
            return 'Todos los campos son requeridos';
        }
        return null;
    };

    const handleAddAddress = async () => {
        try {
            const validationError = validateAddress();
            if (validationError) {
                setError(validationError);
                return;
            }

            setLoading(true);
            setError('');

            // Llamar al hook de dirección aquí más adelante cuando esté listo
            // await addAddress({ street, houseNumber, postalCode, neighborhood });

            // Simulación de espera
            setTimeout(() => {
                // Redirige a la lista de direcciones o página anterior después de agregarla
                router.back();
            }, 1000);
        } catch (error) {
            setError('Error al agregar la dirección. Intenta nuevamente');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        router.back();
    };

    return (
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
                label="Barrio"
                value={neighborhood}
                onChangeText={setNeighborhood}
                style={styles.input}
                error={!!error}
                disabled={loading}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Button
                mode="contained"
                onPress={handleAddAddress}
                style={styles.button}
                loading={loading}
                disabled={loading || !street || !houseNumber || !postalCode || !neighborhood}
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
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
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
});
