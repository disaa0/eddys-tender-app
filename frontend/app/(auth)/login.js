import { View, StyleSheet, Image, ImageBackground, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { Link } from 'expo-router';
import { useState } from 'react';
import { theme } from '../theme';
import { useAuth } from '../context/AuthContext';
import { ActivityIndicator } from 'react-native-paper';
import { API_URL } from '../config';
import { useRouter } from 'expo-router';
import ConfirmationDialog from '../components/ConfirmationDialog';

export default function Login() {
  const { login, isAdmin } = useAuth();
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [messageDialogVisible, setMessageDialogVisible] = useState(false);
  const [messageDialogText, setMessageDialogText] = useState('');
  const router = useRouter();

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

      const resLogin = await login(credentials);
      console.log('resLogin:', resLogin);

    } catch (error) {
      setError(error.message);
      console.error('Error en el login:', error);
      // setMessageDialogText(error.message);
      // setMessageDialogVisible(true);

    } finally {
      setLoading(false);
    }
  };

  const getFieldError = (fieldName) => {
    return errors[fieldName]?._errors?.[0];
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/eddys.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <View style={styles.welcomeContainer}>
        <Text variant="headlineMedium" style={styles.welcomeMessage}>
          Inicia sesión o registrate
        </Text>
      </View>

      {
        error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : null
      }
      <View style={styles.formContainer}>
        <TextInput
          mode="outlined"
          label="Email o nombre de usuario"
          value={emailOrUsername}
          onChangeText={setEmailOrUsername}
          style={[styles.input, (getFieldError('email') || getFieldError('username')) && styles.inputError]}
          error={!!getFieldError('email') || !!getFieldError('username')}
          autoCapitalize="none"
        />
        {
          getFieldError('email') && (
            <Text style={styles.fieldError}>{getFieldError('email')}</Text>
          )
        }
        {
          getFieldError('username') && (
            <Text style={styles.fieldError}>{getFieldError('username')}</Text>
          )
        }

        <TextInput
          mode="outlined"
          label="Contraseña"
          value={password}
          onChangeText={setPassword}
          style={[styles.input, getFieldError('password') && styles.inputError]}
          error={!!getFieldError('password')}
          secureTextEntry
        />
        {
          getFieldError('password') && (
            <Text style={styles.fieldError}>{getFieldError('password')}</Text>
          )
        }

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

        <Link style={styles.link} href="/register" asChild>
          <Button mode="text" textColor={theme.colors.primary}>
            ¿No tienes cuenta? Regístrate.
          </Button>
        </Link>
      </View>


      <ConfirmationDialog
        visible={messageDialogVisible}
        onDismiss={() => setMessageDialogVisible(false)}
        title="Mensaje"
        content={messageDialogText}
        onConfirm={() => {
          setMessageDialogVisible(false)
          setMessageDialogText('')
        }}
        cancelButtonLabel=""
        confirmButtonLabel="Cerrar"
      />
    </KeyboardAvoidingView>
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
    height: 200,
    marginBottom: 5,
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
  welcomeContainer: {
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  welcomeMessage: {
    color: theme.colors.primary,
    fontSize: 24,
    fontWeight: 'bold',
  },
  formContainer: {
    marginTop: 0,
    justifyContent: 'center',
  },
  link: {
    color: theme.colors.primary,
    textAlign: 'center',
    marginTop: 10,
  },
});
