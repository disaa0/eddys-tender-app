import { View, Image, StyleSheet, Alert } from 'react-native';
import { Surface, Text, Switch, TouchableRipple } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import adminApiService from '../api/AdminApiService';
import { theme } from '../theme';

export default function ProductCardAdmin({ product, isLastItem }) {
    const router = useRouter();
    const [localStatus, setLocalStatus] = useState(product.status === true || product.status === 'true');
    const [loading, setLoading] = useState(false);

    const { idProduct, name, price, description, imageSource } = product;

    if (!imageSource) {
        let imageDefault = require('../../assets/eddys.png');

    }

    const handleToggleStatus = async (id) => {
        try {
            setLoading(true);
            const newStatus = !localStatus;
            setLocalStatus(newStatus);
            await adminApiService.toggleProductStatus(id);
            console.log("Estado cambiado para el producto con id:", id);
        } catch (err) {
            setLocalStatus(!localStatus);
            Alert.alert(
                'Error',
                'No se pudo cambiar el estado del producto. Por favor, intente nuevamente.',
                [{ text: 'OK' }]
            );
            console.error('Error toggling product status:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleEditProduct = (productId) => {
        router.push({
            pathname: '/(appAdmin)/product/[id]',
            params: { id: productId }
        });
    };

    if (loading) {
        return (
            <Surface style={styles.card} elevation={1}>
                <View style={styles.cardContainer}>
                    <Text>Loading...</Text>
                </View>
            </Surface>
        );
    }
    if (!product) {
        return (
            <Surface style={styles.card} elevation={1}>
                <View style={styles.cardContainer}>
                    <Text>No product data available</Text>
                </View>
            </Surface>
        );
    }
    // console.log('Es ultimo ' + isLastItem)
    return (
        <Surface style={isLastItem ? styles.lastCard : styles.card} elevation={1}>
            <TouchableRipple onPress={() => { handleEditProduct(idProduct) }} style={styles.touchable}>
                <View style={styles.cardContainer}>
                    <Image
                        source={require('../../assets/products/tenders.png')}
                        style={styles.cardImage}
                        resizeMode="cover"
                    />
                    <View style={styles.cardContent}>
                        <Text style={styles.cardTitle}>{name}</Text>
                        {description && <Text style={styles.cardDescription}>{description}</Text>}
                    </View>
                    <View style={styles.priceAndStatusContainer}>
                        <Text style={styles.cardPrice}>${price.toFixed(2)}</Text>
                        <Switch
                            value={localStatus}
                            onValueChange={() => handleToggleStatus(idProduct)}
                            disabled={loading}
                        />
                    </View>
                </View>
            </TouchableRipple>
        </Surface>
    );
}

const styles = StyleSheet.create({
    card: {
        // flex: 1,
        width: '48%',
        margin: 4,
        borderRadius: 12,
        overflow: 'hidden',
        height: 300, // Agrega una altura fija
        backgroundColor: '#fff',
    },
    lastCard: {
        flexGrow: 1,
        width: '48%', // Mantiene el mismo ancho que los demás
        margin: 4,
        borderRadius: 12,
        overflow: 'hidden',
        height: 300,
        backgroundColor: '#fff',
    },
    touchable: {
        flex: 1,
    },
    cardContainer: {
        flex: 1,
        flexDirection: 'column',
    },
    cardImage: {
        width: '100%',
        height: 120,
        backgroundColor: '#F5F5F5',
    },
    cardContent: {
        flex: 1,
        padding: 12,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    cardDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    priceAndStatusContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between', // Alínea precio y switch
        alignItems: 'center', // Mantiene ambos elementos alineados verticalmente
        paddingHorizontal: 12,
        paddingBottom: 12,
    },
    cardPrice: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.primary,
    },
});
