import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { theme } from '../../theme';
// import AddressService from '../../api/AddressService';

export default function AddressList() {
    const [addresses, setAddresses] = useState([
        { id: '1', street: 'Calle 123', city: 'Ciudad A', country: 'País X' },
        { id: '2', street: 'Av. Principal 456', city: 'Ciudad B', country: 'País Y' },
    ]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleDelete = async (id) => {
        try {
            setLoading(true);
            await AddressService.deleteAddress(id);
            setAddresses(addresses.filter(address => address.id !== id));
        } catch (error) {
            console.error('Error al eliminar la dirección', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text variant="titleLarge" style={styles.title}>Direcciones de Envío</Text>
            <FlatList
                data={addresses}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <Card style={styles.card}>
                        <Card.Content>
                            <Text variant="bodyLarge">{item.street}</Text>
                            <Text variant="bodyMedium">{item.city}, {item.country}</Text>
                        </Card.Content>
                        <Card.Actions>
                            <Button mode="text" onPress={() => router.push(`/edit-address/${item.id}`)}>Editar</Button>
                            <Button mode="text" onPress={() => handleDelete(item.id)} loading={loading} disabled={loading}>Eliminar</Button>
                        </Card.Actions>
                    </Card>
                )}
            />
            <Button mode="contained" onPress={() => router.push('/add-address')} style={styles.button}>Agregar Dirección</Button>
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
