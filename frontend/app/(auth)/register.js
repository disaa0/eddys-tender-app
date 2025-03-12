import { View, StyleSheet, Image, ImageBackground, ScrollView } from 'react-native';
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
      router.push('/registerCompleted');
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
    <ScrollView style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/eddys.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <View style={styles.welcomeContainer}>
        <Text variant="headlineMedium" style={styles.welcomeMessage}>
          Registrate
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
          'Crear cuenta'
        )}
      </Button>

      <Link style={styles.link} href="/login" asChild>
        <Button mode="text" textColor={theme.colors.primary}>
          ¿Ya tienes cuenta? Inicia sesión
        </Button>
      </Link>
    </ScrollView>
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
    marginBottom: 50,
    marginTop: -100,
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
  welcomeContainer: {
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  welcomeMessage: {
    color: theme.colors.primary,
    fontSize: 24,
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
  link: {
    marginBottom: "80px"
  }
}); 