import { View, StyleSheet, Image, ImageBackground } from 'react-native';
import { TextInput, Button, Text, ActivityIndicator } from 'react-native-paper';
import { Link } from 'expo-router';
import { useState } from 'react';
import { theme } from '../theme';
import { useRouter } from 'expo-router';
import api from '../api/ApiService';

export default function Register() {
  const [name, setName] = useState('');
  const [lastNames, setLastNames] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});

  const handleRegister = async () => {
    setLoading(true);
    setError('');
    setErrors({});

    try {
      if (!name || !lastNames || !username || !email || !phone || !password) {
        throw new Error('Por favor complete los campos requeridos');
      }

      const [lastName, ...secondLastNameParts] = lastNames.trim().split(' ');
      const secondLastName = secondLastNameParts.join(' ') || undefined;

      const userData = {
        username,
        email,
        password,
        name,
        lastName,
        secondLastName,
        phone,
      };

      await api.register(userData);
      router.push('/login');
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setError(error.message || 'Error en el registro');
      }
      console.error('Error en el registro:', error);
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
              Crear Cuenta
            </Text>
          </View>

          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}

          <TextInput
            mode="outlined"
            label="Nombre"
            value={name}
            onChangeText={setName}
            style={[styles.input, getFieldError('name') && styles.inputError]}
            error={!!getFieldError('name')}
          />
          {getFieldError('name') && (
            <Text style={styles.fieldError}>{getFieldError('name')}</Text>
          )}

          <TextInput
            mode="outlined"
            label="Apellidos"
            value={lastNames}
            onChangeText={setLastNames}
            style={[
              styles.input,
              (getFieldError('lastName') || getFieldError('secondLastName')) && styles.inputError
            ]}
            error={!!getFieldError('lastName') || !!getFieldError('secondLastName')}
            placeholder="Apellido Paterno Apellido Materno (Opcional)"
          />
          {getFieldError('lastName') && (
            <Text style={styles.fieldError}>{getFieldError('lastName')}</Text>
          )}
          {getFieldError('secondLastName') && (
            <Text style={styles.fieldError}>{getFieldError('secondLastName')}</Text>
          )}

          <TextInput
            mode="outlined"
            label="Nombre de Usuario"
            value={username}
            onChangeText={setUsername}
            style={[styles.input, getFieldError('username') && styles.inputError]}
            error={!!getFieldError('username')}
          />
          {getFieldError('username') && (
            <Text style={styles.fieldError}>{getFieldError('username')}</Text>
          )}

          <TextInput
            mode="outlined"
            label="Correo electrónico"
            value={email}
            onChangeText={setEmail}
            style={[styles.input, getFieldError('email') && styles.inputError]}
            error={!!getFieldError('email')}
            keyboardType="email-address"
          />
          {getFieldError('email') && (
            <Text style={styles.fieldError}>{getFieldError('email')}</Text>
          )}

          <TextInput
            mode="outlined"
            label="Teléfono"
            value={phone}
            onChangeText={setPhone}
            style={[styles.input, getFieldError('phone') && styles.inputError]}
            error={!!getFieldError('phone')}
            keyboardType="phone-pad"
          />
          {getFieldError('phone') && (
            <Text style={styles.fieldError}>{getFieldError('phone')}</Text>
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
            onPress={handleRegister}
            style={styles.button}
            buttonColor={theme.colors.primary}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.colors.surface} />
            ) : (
              'Registrarse'
            )}
          </Button>

          <Link href="/login" asChild>
            <Button mode="text" textColor={theme.colors.surface}>
              ¿Ya tienes cuenta? Inicia sesión
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
    backgroundColor: 'rgba(0,0,0,0.4)',
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
    marginBottom: 15,
    backgroundColor: theme.colors.surface,
    borderRadius: 10,
    fontSize: 16,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    paddingTop: 10,
  },
  button: {
    marginTop: 10,
    marginBottom: 10,
    paddingVertical: 6,
  },
  inputContent: {
    paddingHorizontal: 12,
    height: 56,
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