import { View, StyleSheet, Image, ImageBackground } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { Link } from 'expo-router';
import { useState } from 'react';
import { theme } from '../theme';
import { useAuth } from '../context/AuthContext';
import { ActivityIndicator } from 'react-native-paper';
import { API_URL } from '../config';
import { useRouter } from 'expo-router';

export default function RegisterSuccesful() {

    return (
        <View style={styles.container}>
            <View style={styles.logoContainer}>
                <Image
                    source={require('../../assets/eddys.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </View>
            <View style={styles.welcomeContainer}>
                <Text variant="headlineMedium" style={styles.welcomeMessage}>
                    ¡Su cuenta se ha creado con éxito!
                </Text>
            </View>


            <Link href="/login" asChild>
                <Button mode="contained" textColor={theme.colors.surface}>
                    Iniciar sesión
                </Button>
            </Link>
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignContent: 'center',
        padding: 20,
        backgroundColor: 'rgba(255,255,255,0.7)',
        borderRadius: 10,
    },
    logoContainer: {
        alignItems: 'center',
        height: '20vh',
        marginBottom: 100,
        marginTop: -50,
    },
    logo: {
        width: 300,
        height: 300,
        marginBottom: 0,
    },
    title: {
        color: theme.colors.surface,
        fontWeight: 'bold',
    },
    button: {
        marginTop: 10,
        marginBottom: 10,
        paddingVertical: 6,
    },

    welcomeContainer: {
        marginBottom: 20,
        alignItems: 'flex-center',
    },
    welcomeMessage: {
        color: theme.colors.primary,
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center'
    },
});
