import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { theme } from '../../../theme';
import useShippingAddresses from '../../../hooks/useShippingAddresses'; // Asegúrate de importar el hook
import ConfirmationDialog from '../../../components/ConfirmationDialog';
import { useState } from 'react';

export default function AddressList() {
    const router = useRouter();
    const { addresses, loading, error, deleteAddress } = useShippingAddresses();
    const [openDialog, setOpenDialog] = useState(false);
    const [idLocationSelected, setIdLocationSelected] = useState(null);

    const openDialogFn = (idLocation) => {
        setOpenDialog(true)
        setIdLocationSelected(idLocation);
    };
    const closeDialogFn = () => {
        setOpenDialog(false)
        setIdLocationSelected(null);
    }

    const handleDelete = async () => {
        try {
            await deleteAddress(idLocationSelected);
            closeDialogFn();
        } catch (error) {
            console.error('Error deleting address:', error);
        }
    }

    if (loading) return <Text>Cargando...</Text>;
    if (error) return <Text>Error: {error.message}</Text>;

    if (!addresses.length) {
        return (
            <View style={styles.container}>
                <Text variant="titleLarge" style={styles.title}>Direcciones de Envío</Text>
                <Text>No hay direcciones registradas</Text>
                <Button mode="contained" onPress={() => router.push('profile/address/add-address')} style={styles.button}>Agregar Dirección</Button>
            </View>
        );
    }

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
                            <Button mode="text" onPress={() => router.push(`/profile/address/${item.idLocation}`)}>Editar</Button>
                            <Button mode="text" onPress={() => openDialogFn(item.idLocation)} loading={loading} disabled={loading}>Eliminar</Button>
                        </Card.Actions>
                    </Card>
                )}
            />
            <ConfirmationDialog
                visible={openDialog}
                onDismiss={closeDialogFn}
                onConfirm={handleDelete}
                title="Eliminar Dirección"
                message="¿Estás seguro de que deseas eliminar esta dirección?"
            />
            <Button mode="contained" onPress={() => router.push('profile/address/add-address')} style={styles.button}>Agregar Dirección</Button>
            <Button mode="outlined" onPress={() => router.push('profile')} style={styles.buttonCancel}>Volver</Button>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        paddingBottom: 100,
        backgroundColor: theme.colors.surface,
    },
    title: {
        marginBottom: 20,
        color: theme.colors.primary,
        textAlign: 'center',
    },
    card: {
        margin: 4,
        marginBottom: 10,
        backgroundColor: theme.colors.surface,
    },
    button: {
        marginTop: 20,
    },
    buttonCancel: {
        marginTop: 10,
        backgroundColor: theme.colors.surface,
    },
});
