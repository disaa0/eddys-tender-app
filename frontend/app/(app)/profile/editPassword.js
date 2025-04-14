import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { TextInput, Button, Text, Icon } from 'react-native-paper';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { theme } from '../../theme';
import AuthService from '../../api/AuthService';
import { MaterialIcons, Octicons } from '@expo/vector-icons';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function EditPassword() {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState([]);
    const router = useRouter();


    const handleUpdatePassword = async () => {
        try {
            setLoading(true);
            setError([]);
            await AuthService.updatePassword(oldPassword, newPassword);
            router.push('profile')
        } catch (error) {
            // Handle specific error cases
            if (error.response.data.message) {
                setError(['Contraseña actual incorrecta, intenta nuevamente.']);
            } else if (error.response.data.errors.newPassword._errors) {
                setError(['Nueva contraseña inválida, intenta nuevamente.', ...error.response.data.errors.newPassword._errors]);
            } else if (error.response?.status === 401) {
                setError(['Sesión expirada. Por favor, inicia sesión nuevamente.']);
                // Optionally redirect to login
                router.replace('/login');
            } else {
                setError([error.response]);
            }
        } finally {
            setLoading(false);
            setNewPassword('')
            setOldPassword('')
            setShowNewPassword(false)
            setShowOldPassword(false)
        }
    };

    // Clear error when password changes
    const handleOldPasswordChange = (text) => {
        setOldPassword(text);
        if (error) setError([]);
    };
    const handleNewPasswordChange = (text) => {
        setNewPassword(text);
        if (error) setError([]);
    };

    return (
        <SafeAreaProvider>
            <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.primary }}>
                <View style={styles.container}>
                    <Text variant="titleLarge" style={styles.title}>
                        Actualizar Contraseña
                    </Text>
                    <View style={styles.buttonContainer}>
                        <TextInput
                            mode="outlined"
                            label="Ingrese su contraseña actual"
                            value={oldPassword}
                            onChangeText={handleOldPasswordChange}
                            style={styles.input}
                            autoCapitalize="none"
                            error={!!error}
                            disabled={loading}
                            secureTextEntry={!showOldPassword}
                        />
                        <TouchableOpacity onPress={() => setShowOldPassword(!showOldPassword)} style={styles.hideShowButton}>
                            {showOldPassword ? <Octicons name='eye-closed' size={28} /> : <Octicons name='eye' size={28} />}
                        </TouchableOpacity>
                    </View>

                    <View style={styles.buttonContainer}>
                        <TextInput
                            mode="outlined"
                            label="Nueva contraseña"
                            value={newPassword}
                            onChangeText={handleNewPasswordChange}
                            style={styles.input}
                            autoCapitalize="none"
                            error={!!error}
                            disabled={loading}
                            secureTextEntry={!showNewPassword}
                        />
                        <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)} style={styles.hideShowButton}>
                            {showNewPassword ? <Octicons name='eye-closed' size={28} /> : <Octicons name='eye' size={28} />}
                        </TouchableOpacity>
                    </View>


                    {error.length > 0 ? (
                        error.map((err, index) => (
                            <Text key={index} style={styles.error}>{err}</Text>
                        ))
                    ) : null}

                    <Button
                        mode="contained"
                        onPress={handleUpdatePassword}
                        style={[styles.button]}
                        loading={loading}
                        disabled={loading || !newPassword.trim()}
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
            </SafeAreaView>
        </SafeAreaProvider>

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
    buttonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    input: {
        backgroundColor: theme.colors.surface,
        width: '90%'
    },
    hideShowButton: {
        paddingTop: 8,
        paddingLeft: 8,
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
        textAlign: 'left',
    },
}); 