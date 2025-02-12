import { View, StyleSheet, ScrollView } from 'react-native';
import { Avatar, Text, List, Divider, Surface } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { theme } from '../theme';

export default function Profile() {
  const router = useRouter();

  const userInfo = {
    name: 'Alejandro Fontes',
    email: 'alejandrofontes@gmail.com',
    phone: '+52 123 456 7890',
    address: 'Calle Principal 123, Colonia Centro',
    memberSince: '2024',
  };

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.header} elevation={2}>
        <Avatar.Image
          size={120}
          source={require('../../assets/profile.png')}
          style={[styles.avatar, styles.squareAvatar]}
        />
        <Text variant="headlineSmall" style={styles.name}>
          {userInfo.name}
        </Text>
        <Text variant="bodyLarge" style={styles.memberSince}>
          Miembro desde {userInfo.memberSince}
        </Text>
      </Surface>

      <Surface style={styles.infoSection} elevation={1}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Información Personal
        </Text>
        <List.Item
          title="Correo"
          description={userInfo.email}
          left={props => <List.Icon {...props} icon="email" />}
        />
        <Divider />
        <List.Item
          title="Teléfono"
          description={userInfo.phone}
          left={props => <List.Icon {...props} icon="phone" />}
        />
        <Divider />
        <List.Item
          title="Dirección"
          description={userInfo.address}
          left={props => <List.Icon {...props} icon="map-marker" />}
        />
      </Surface>

      <Surface style={styles.infoSection} elevation={1}>
        <List.Item
          title="Historial de Pedidos"
          left={props => <List.Icon {...props} icon="history" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => router.push('/orders')}
        />
        <Divider />
        <List.Item
          title="Métodos de Pago"
          left={props => <List.Icon {...props} icon="credit-card" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => router.push('/profile/payment-methods')}
        />
        <Divider />
        <List.Item
          title="Cerrar Sesión"
          left={props => <List.Icon {...props} icon="logout" color={theme.colors.error} />}
          titleStyle={{ color: theme.colors.error }}
        />
      </Surface>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
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
    transform: [{scale: 1.2}],
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
}); 