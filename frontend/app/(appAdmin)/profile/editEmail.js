import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { theme } from '../../theme';
import AuthService from '../../api/AuthService';

export default function EditEmail() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    // Email validation function
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) return 'El correo electrónico es requerido';
        if (!emailRegex.test(email)) return 'El correo electrónico no es válido';
        return null;
    };

    const handleUpdateEmail = async () => {
        try {
            // Validate email before submitting
            const validationError = validateEmail(email);
            if (validationError) {
                setError(validationError);
                return;
            }

            setLoading(true);
            setError('');

            await AuthService.updateEmail(email);
            router.push('profile');
        } catch (error) {
            // Handle specific error cases
            if (error.response?.status === 400) {
                setError('Este correo electrónico ya está en uso');
            } else if (error.response?.status === 401) {
                setError('Sesión expirada. Por favor, inicia sesión nuevamente');
                // Optionally redirect to login
                router.replace('/login');
            } else {
                setError('Error al actualizar el correo electrónico. Intenta nuevamente');
            }
        } finally {
            setLoading(false);
            setEmail('')
        }
    };

    // Clear error when email changes
    const handleEmailChange = (text) => {
        setEmail(text);
        if (error) setError('');
    };

    return (
        <View style={styles.container}>
            <Text variant="titleLarge" style={styles.title}>
                Actualizar Correo Electrónico
            </Text>

            <TextInput
                mode="outlined"
                label="Nuevo correo electrónico"
                value={email}
                onChangeText={handleEmailChange}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                error={!!error}
                disabled={loading}
            />

            {error ? (
                <Text style={styles.error}>{error}</Text>
            ) : null}

            <Button
                mode="contained"
                onPress={handleUpdateEmail}
                style={styles.button}
                loading={loading}
                disabled={loading || !email.trim()}
            >
                Actualizar
            </Button>

            <Button
                mode="text"
                onPress={() => router.push('profile')}
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
        backgroundColor: theme.colors.surface,
    },
    title: {
        marginBottom: 20,
        color: theme.colors.primary,
        textAlign: 'center',
    },
    input: {
        marginBottom: 20,
        backgroundColor: theme.colors.surface,
    },
    button: {
        marginTop: 10,
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