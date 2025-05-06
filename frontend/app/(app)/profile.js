import { View, StyleSheet, ScrollView } from 'react-native';
import { Avatar, Text, List, Divider, Surface, Button, Snackbar, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { theme } from '../theme';
import { useAuth } from '../context/AuthContext';
import { useUserInfo } from '../hooks/useUserInfo';
import { useState } from 'react';
import ConfirmationDialog from '../components/ConfirmationDialog';
import AuthService from '../api/AuthService';
import { SafeAreaView } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function Profile() {
  const router = useRouter();
  const { logout, user, isAdmin } = useAuth();
  // hook personalizado para obtener la información del usuario
  // Descomentar para usar el hook personalizado

  const { userInfoH, loading, error, fetchUserInfo } = useUserInfo(); // Usamos el hook aquí
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });
  const [retryCount, setRetryCount] = useState(0);
  const [logOutDialogVisible, setLogOutDialogVisible] = useState(false);

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      const response = await AuthService.deleteProfile();

      // Show success message briefly before logout
      setSnackbar({
        visible: true,
        message: response.message || 'Cuenta eliminada exitosamente'
      });

      // Wait a moment to show the message before logging out
      setTimeout(async () => {
        await logout();
      }, 1500);

    } catch (error) {
      console.error('Error deleting account:', error);
      setSnackbar({
        visible: true,
        message: error.message || 'Error al eliminar la cuenta'
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogVisible(false);
    }
  };

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
    setSnackbar({ visible: false, message: '' }); // Opcional, para ocultar errores previos
    fetchUserInfo();
  };


  // Si está cargando, muestra un mensaje de loading
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text>{error}</Text>
        <Button mode="contained" onPress={handleRetry} style={{ marginTop: 10 }}>
          Reintentar
        </Button>
        {retryCount >= 3 && (
          <Button mode="contained" onPress={logout} style={{ marginTop: 10 }}>
            Cerrar Sesión
          </Button>
        )}
      </View>
    );
  }

  // console.log(userInfoH);
  const userInfo = {
    name: 'Alejandro Fontes',
    email: 'alejandrofontes@gmail.com',
    phone: '+52 123 456 7890',
    address: 'Calle Principal 123, Colonia Centro',
    memberSince: '2024',
  };
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.primary }}>
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 80 }}>
          <Surface style={styles.header} elevation={2}>
            <Avatar.Image
              size={120}
              source={require('../../assets/profile.png')}
              style={[styles.avatar, styles.squareAvatar]}
            />
            <Text variant="bodyLarge" style={styles.memberSince}>
              Miembro desde {new Date(userInfoH.createdAt).getFullYear()}
            </Text>
          </Surface>

          <Surface style={styles.infoSection} elevation={1}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Información Personal
            </Text>
            <List.Item
              title="Nombre"
              description={userInfoH.userInformation.name + ' ' + userInfoH.userInformation.lastName}
              left={(props) => <List.Icon {...props} icon="account" />}
            />
            <Divider />
            <List.Item
              title="Cambiar Contraseña"
              left={(props) => <List.Icon {...props} icon="form-textbox-password" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => router.push('/profile/editPassword')}
            />
            <Divider />
            <List.Item
              title="Correo"
              description={userInfoH.email}
              left={(props) => <List.Icon {...props} icon="email" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => router.push('/profile/edit-email')}
            />
            <Divider />
            <List.Item
              title="Teléfono"
              description={userInfoH.userInformation.phone}
              left={(props) => <List.Icon {...props} icon="phone" />}
            />
            <Divider />
            <List.Item
              title="Dirección"
              description={userInfoH.userInformation?.address || 'No especificada'}
              left={(props) => <List.Icon {...props} icon="map-marker" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => router.push('/profile/address')}
            />
          </Surface>
          <Surface style={styles.infoSection} elevation={1}>
            <List.Item
              title="Historial de Pedidos"
              left={(props) => <List.Icon {...props} icon="history" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => router.push('/orders')}
            />
            {/* <Divider />
            <List.Item
              title="Métodos de Pago"
              left={(props) => <List.Icon {...props} icon="credit-card" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => router.push('/profile/payment-methods')}
            /> */}
            <Divider />
            <List.Item
              title="Cerrar Sesión"
              left={(props) => (
                <List.Icon {...props} icon="logout" color={theme.colors.error} />
              )}
              titleStyle={{ color: theme.colors.error }}
              onPress={() => setLogOutDialogVisible(true)}
            />
          </Surface>

          <ConfirmationDialog
            visible={logOutDialogVisible}
            onDismiss={() => setLogOutDialogVisible(false)}
            onConfirm={logout}
            title="Cerrar Sesión"
            message="¿Estás seguro que deseas cerrar sesión?"
            confirmButtonLabel="Cerrar Sesión"
            confirmButtonLoading={isDeleting}
          />

          {isAdmin && (<Surface style={styles.infoSection} elevation={1}>
            <List.Item
              title="Panel de Administrador"
              description={"Acceder al panel de control"}
              left={(props) => (
                <List.Icon {...props} icon="shield-account" color={theme.colors.primary} />
              )}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => router.push('/(appAdmin)/adminDashboard')}
            />
          </Surface>
          )}

          <Surface style={[styles.infoSection, styles.dangerSection]} elevation={1}>
            <List.Item
              title="Eliminar Cuenta"
              description="Esta acción no se puede deshacer"
              left={(props) => (
                <List.Icon {...props} icon="delete" color={theme.colors.error} />
              )}
              onPress={() => setDeleteDialogVisible(true)}
              disabled={isDeleting}
              titleStyle={{ color: theme.colors.error }}
            />
          </Surface>

          <ConfirmationDialog
            visible={deleteDialogVisible}
            onDismiss={() => !isDeleting && setDeleteDialogVisible(false)}
            onConfirm={handleDeleteAccount}
            title="Eliminar Cuenta"
            message="¿Estás seguro que deseas eliminar tu cuenta? Esta acción no se puede deshacer y perderás todo tu historial y datos."
            confirmButtonDisabled={isDeleting}
            confirmButtonLoading={isDeleting}
          />

          <Snackbar
            visible={snackbar.visible}
            onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
            duration={3000}
            style={styles.snackbar}
          >
            {snackbar.message}
          </Snackbar>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface, // O el que prefieras
    //paddingBottom: 80, // O comentar esta línea si no la necesitas
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: theme.colors.surface,
    marginBottom: 16,
  },
  avatar: {
    marginBottom: 16,
    width: 120,
    height: 120,
  },
  squareAvatar: {
    borderRadius: 8,
    transform: [{ scale: 1.2 }],
  },
  name: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  memberSince: {
    color: '#666',
    marginTop: 4,
  },
  infoSection: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  sectionTitle: {
    padding: 16,
    paddingBottom: 8,
    color: theme.colors.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  snackbar: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: theme.colors.error,
  },
  adminSection: {
    marginTop: 16,
  },
});
