import { View, StyleSheet, Image, ImageBackground } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { Link } from 'expo-router';
import { useState } from 'react';
import { theme } from '../theme';
import { useAuth } from '../context/AuthContext';
import { ActivityIndicator } from 'react-native-paper';
import { API_URL } from '../config';

export default function Login() {
  const { login } = useAuth();
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    setErrors({});

    try {
      if (!emailOrUsername || !password) {
        throw new Error('Por favor ingrese sus credenciales');
      }

      const isEmail = emailOrUsername.includes('@');
      const credentials = {
        [isEmail ? 'email' : 'username']: emailOrUsername,
        password,
      };

      await login(credentials);
      // No need to handle navigation here, AuthContext will handle it

    } catch (error) {
      setError(error.message);
      console.error('Error en el login:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFieldError = (fieldName) => {
    return errors[fieldName]?._errors?.[0];
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

          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}

          <TextInput
            mode="outlined"
            label="Email o nombre de usuario"
            value={emailOrUsername}
            onChangeText={setEmailOrUsername}
            style={[styles.input, (getFieldError('email') || getFieldError('username')) && styles.inputError]}
            error={!!getFieldError('email') || !!getFieldError('username')}
            autoCapitalize="none"
          />
          {getFieldError('email') && (
            <Text style={styles.fieldError}>{getFieldError('email')}</Text>
          )}
          {getFieldError('username') && (
            <Text style={styles.fieldError}>{getFieldError('username')}</Text>
          )}

          <TextInput
            mode="outlined"
            label="Contraseña"
            value={password}
            onChangeText={setPassword}
            style={[styles.input, getFieldError('password') && styles.inputError]}
            error={!!getFieldError('password')}
            secureTextEntry
          />
          {getFieldError('password') && (
            <Text style={styles.fieldError}>{getFieldError('password')}</Text>
          )}

          <Button
            mode="contained"
            onPress={handleLogin}
            style={styles.button}
            buttonColor={theme.colors.primary}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.colors.surface} />
            ) : (
              'Iniciar Sesión'
            )}
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
  errorText: {
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.7)',
    padding: 10,
    borderRadius: 5,
  },
  fieldError: {
    color: theme.colors.error,
    fontSize: 12,
    marginTop: -10,
    marginBottom: 10,
    marginLeft: 5,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
});
