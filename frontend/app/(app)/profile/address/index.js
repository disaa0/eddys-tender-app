import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { theme } from '../../../theme';
import useShippingAddresses from '../../../hooks/useShippingAddresses'; // Asegúrate de importar el hook

export default function AddressList() {
    const router = useRouter();
    const { addresses, loading, error, deleteAddress } = useShippingAddresses();

    const handleDelete = async (id) => {
        await deleteAddress(id); // Llamar al método para eliminar la dirección
    };

    if (loading) return <Text>Cargando...</Text>;
    if (error) return <Text>Error: {error.message}</Text>;

    return (
        <View style={styles.container}>
            <Text variant="titleLarge" style={styles.title}>Direcciones de Envío</Text>
            <FlatList
                data={addresses}
                keyExtractor={(item) => item.idLocation.toString()} // Usamos idLocation para las direcciones
                renderItem={({ item }) => (
                    <Card style={styles.card}>
                        <Card.Content>
                            <Text variant="bodyLarge">{item.street} {item.houseNumber}</Text>
                            <Text variant="bodyMedium">{item.neighborhood}</Text>
                            <Text variant="bodyMedium">{item.postalCode}</Text>
                        </Card.Content>
                        <Card.Actions>
                            <Button mode="text" onPress={() => router.push(`/address/${item.idLocation}`)}>Editar</Button>
                            <Button mode="text" onPress={() => handleDelete(item.idLocation)} loading={loading} disabled={loading}>Eliminar</Button>
                        </Card.Actions>
                    </Card>
                )}
            />
            <Button mode="contained" onPress={() => router.push('profile/address/add-address')} style={styles.button}>Agregar Dirección</Button>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        paddingBottom: 80,
        backgroundColor: theme.colors.background,
    },
    title: {
        marginBottom: 20,
        color: theme.colors.primary,
        textAlign: 'center',
    },
    card: {
        marginBottom: 10,
        backgroundColor: theme.colors.surface,
    },
    button: {
        marginTop: 20,
    },
});
