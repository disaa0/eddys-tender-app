import { View, StyleSheet, Image, ImageBackground } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { Link } from 'expo-router';
import { useState } from 'react';
import { theme } from '../theme';
import AuthService from '../api/AuthService';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    // Implementar lógica de login

    // console.log(email)
    // console.log(password)
    const userData = {
      email,
      password,
    };

    try {
      const response = await AuthService.login(userData);
      console.log(response);
    } catch (error) {
      console.error('Error en el login:', error);
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/background.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text variant="headlineMedium" style={styles.title}>
              ¡Bienvenido!
            </Text>
          </View>

          <TextInput
            mode="outlined"
            label="Correo electrónico"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
            theme={{
              colors: { primary: theme.colors.primary },
              roundness: 10,
            }}
          />

          <TextInput
            mode="outlined"
            label="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
            theme={{ colors: { primary: theme.colors.primary }, roundness: 10 }}
          />

          <Button
            mode="contained"
            onPress={handleLogin}
            style={styles.button}
            buttonColor={theme.colors.primary}
          >
            Iniciar Sesión
          </Button>

          <Link href="/register" asChild>
            <Button mode="text" textColor={theme.colors.surface}>
              ¿No tienes cuenta? Regístrate
            </Button>
          </Link>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)', // Semi-transparent overlay
    padding: 20,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  title: {
    color: theme.colors.surface,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 15, // Más espacio entre inputs
    backgroundColor: theme.colors.surface,
    borderRadius: 10, // Bordes más redondeados
    fontSize: 16, // Texto más legible
    paddingHorizontal: 12, // Espaciado interno mejorado
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, // Sombra sutil para resaltar el input
    shadowRadius: 4,
    elevation: 3, // Sombra en Android
    paddingTop: 10, // Eliminar padding superior
  },
  button: {
    marginTop: 10,
    marginBottom: 10,
    paddingVertical: 6,
  },
  inputContent: {
    paddingHorizontal: 12, // Mejor espaciado lateral
    height: 56, // Altura estándar para mantener el label visible
  },
});
