import { View, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Card, Text, Chip, List, IconButton, Searchbar, ActivityIndicator, Button } from 'react-native-paper';
import { useRouter, useFocusEffect } from 'expo-router';
import { useState, useCallback, useEffect } from 'react';
import { SafeAreaView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker'; // Asegúrate de instalarlo
import apiService from '../api/ApiService';
import { theme } from '../theme';
import ConfirmationDialog from '../components/ConfirmationDialog';
import adminApiService from '../api/AdminApiService';

// Función para obtener el color según el estado
const getStatusColor = (status) => {
    switch (status) {
        case 1:
            return '#2196F3'; // Azul
        case 2:
            return '#FF9800'; // Naranja
        case 5:
            return '#9C27B0'; // Morado
        case 6:
            return '#4CAF50'; // Verde
        case 7:
            return '#F44336'; // Rojo
        default:
            return '#757575'; // Gris
    }
};

export default function OrdersHistory() {
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [orders, setOrders] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showDialog, setShowDialog] = useState(false);
    const [dialogMsg, setDialogMsg] = useState('');
    const router = useRouter();
    const isAndroid = Platform.OS === 'android';
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [customContent, setCustomContent] = useState(null);
    const [customTittle, setCustomTittle] = useState(null);
    const [showingOrdersByProduct, setShowingOrdersByProduct] = useState(false);

    useFocusEffect(
        useCallback(() => {
            // reset state when the screen is focused
            setStartDate(null);
            setEndDate(null);
            setOrders([]);
            setAddresses([]);
            setError('');
            setLoading(false);
            setShowStartPicker(false);
            setShowEndPicker(false);
            setShowDialog(false);
            setDialogMsg('');
            setSearchQuery('');

        }, [])
    );

    const formatDate = (dateString) => {
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        };
        return new Date(dateString).toLocaleDateString('es-MX', options);
    };

    const formatAddress = (addressIdString) => {
        if (!addressIdString) {
            return "Pedido para recoger en sucursal";
        }
        const addressId = Number(addressIdString);
        const addressInfo = addresses[addressId - 1];
        return addressInfo
            ? `${addressInfo.street} ${addressInfo.houseNumber}, ${addressInfo.neighborhood}, ${addressInfo.postalCode}`
            : "Dirección no encontrada";
    };

    const handleSearchOrdersByProduct = async (productId) => {
        try {
            // setOrders([]);
            // setStartDate(null);
            // setEndDate(null);
            setLoading(true);
            const resAdminGetOrdersByProduct = await adminApiService.getOrdersByProduct(productId);
            setOrders(resAdminGetOrdersByProduct);
            setCustomContent(null);
            setCustomTittle(null);
            setShowDialog(false);
            setDialogMsg(null);
            setError(null);
            setLoadingProducts(false);
            setLoading(false);
            setShowStartPicker(false);
            setShowEndPicker(false);
            setShowingOrdersByProduct(true);
            // setSelectedProduct(null);
        } catch (err) {
            setDialogMsg(err.message);
            setShowDialog(true);
            setCustomContent(null);
            setCustomTittle('Error');
            console.error(err);
        } finally {
            setLoading(false);
            setLoadingProducts(false);
            // setShowingOrdersByProduct(false);
        }
    }

    const handleStartDateChange = (event, selectedDate) => {
        setShowStartPicker(false);

        if (endDate != null && selectedDate > endDate) {
            console.log(endDate);
            setDialogMsg('La fecha de inicio no puede ser posterior a la fecha de fin.');
            setShowDialog(true);
        }
        if (!selectedDate) {
            setStartDate(null);
        }

        if (selectedDate) setStartDate(selectedDate);
    };

    const handleEndDateChange = (event, selectedDate) => {
        setShowEndPicker(false);

        if (startDate && selectedDate < startDate) {
            setDialogMsg('La fecha de fin no puede ser anterior a la fecha de inicio.');
            setShowDialog(true);
        }

        if (startDate && selectedDate > startDate) {
            setEndDate(selectedDate);
        }

        if (!startDate) {
            setDialogMsg('Primero selecciona una fecha de inicio.');
            setShowDialog(true);
        }

        if (!selectedDate) {
            setEndDate(null);
        }
    };

    const reloadData = async () => {
        try {
            setLoading(true);
            const addressesData = await apiService.getShippingAdresses();
            const activeOrders = await adminApiService.getOrderHistory(startDate, endDate);
            setOrders(activeOrders.data.orders || []);
            setAddresses(addressesData.data || []);
        } catch (err) {
            setError(err.message);
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    const handleSelectProduct = async () => {
        try {
            // setShowingOrdersByProduct(true);
            setLoadingProducts(true);
            const resAdminGetProductos = await adminApiService.getProducts();
            setProducts(resAdminGetProductos.data.products);
            setCustomTittle("Selecciona un producto");
            setCustomContent(
                <View style={{ padding: 20 }}>
                    {/* <Text style={{ fontSize: 18, marginBottom: 10 }}>Selecciona un producto:</Text> */}
                    {resAdminGetProductos.data.products.map((product) => (
                        <TouchableOpacity
                            key={product.idProduct}
                            onPress={() => {
                                setSelectedProduct(product.idProduct);
                                setCustomTittle("Producto Seleccionado");
                                setCustomContent(
                                    <View style={{ padding: 20 }}>
                                        {/* <Text style={{ fontSize: 18, marginBottom: 10 }}>Producto Seleccionado:</Text> */}
                                        <Text style={{ fontSize: 16 }}>{product.name}</Text>
                                        <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginTop: 15 }} />
                                    </View>
                                );
                                setShowDialog(true);
                                setDialogMsg(product.name);
                                handleSearchOrdersByProduct(product.idProduct);
                            }}
                            style={{
                                paddingVertical: 12,
                                paddingHorizontal: 16,
                                backgroundColor: '#fff',
                                borderRadius: 10,
                                borderWidth: 2,
                                borderColor: selectedProduct === product.idProduct ? theme.colors.primary : '#ccc',
                                marginBottom: 12,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                            }}
                        >
                            <Text style={{
                                fontSize: 16,
                                color: selectedProduct === product.idProduct ? theme.colors.primary : '#333',
                                fontWeight: selectedProduct === product.idProduct ? 'bold' : 'normal',
                            }}>
                                {product.name}
                            </Text>

                            {/* Puedes agregar un check o un círculo para marcar la selección */}
                            {selectedProduct === product.idProduct && (
                                <View style={{
                                    width: 20,
                                    height: 20,
                                    borderRadius: 10,
                                    backgroundColor: theme.colors.primary,
                                }} />
                            )}
                        </TouchableOpacity>

                    ))}
                </View>
            );
            setShowDialog(true);
        } catch (err) {
            setError(err.message);
            setShowingOrdersByProduct(false);
            console.error(err);
        } finally {
            setLoadingProducts(false);
        }
    }


    useEffect(() => {
        if (startDate && endDate) {
            reloadData();
        }
        // else {
        //     setOrders([]);
        //     setAddresses([]);
        // }
    }, [startDate, endDate]);


    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    // if (orders.length == 0 ) {
    //     return (
    //         <View style={styles.errorContainer}>
    //             <Text style={styles.errorText}>No hay pedidos activos</Text>
    //             <TouchableOpacity
    //                 onPress={() => router.push('/profile')}
    //                 style={styles.goBackButton}
    //             >
    //                 <Text style={styles.goBackButtonText}>Regresar</Text>
    //             </TouchableOpacity>
    //         </View>
    //     );
    // }

    const handleGoBack = () => {
        setStartDate(null);
        setEndDate(null);
        setOrders([]);
        setAddresses([]);
        setError('');
        setLoading(false);
        setShowStartPicker(false);
        setShowEndPicker(false);
        setShowDialog(false);
        setShowingOrdersByProduct(false);
        setDialogMsg('');
        setSearchQuery('');
        router.push('/profile');
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Error</Text>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity
                    onPress={() => reloadData()}
                    style={styles.goBackButton}
                >
                    <Text style={styles.goBackButtonText}>Reintentar</Text>
                </TouchableOpacity>
            </View>
        );
    }


    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.scrollContainer}>
                <Text style={styles.instructionText}>Selecciona un rango de fechas para ver los pedidos:</Text>

                <View style={styles.dateInputContainer}>
                    <Button
                        mode="outlined"
                        icon="calendar"
                        onPress={() => setShowStartPicker(true)}
                        style={styles.dateButton}
                        labelStyle={styles.dateLabel}
                    >
                        {startDate ? startDate.toLocaleDateString() : 'Fecha de inicio'}
                    </Button>

                    <Button
                        mode="outlined"
                        icon="calendar"
                        onPress={() => setShowEndPicker(true)}
                        style={styles.dateButton}
                        labelStyle={styles.dateLabel}
                    >
                        {endDate ? endDate.toLocaleDateString() : 'Fecha de fin'}
                    </Button>
                </View>

                {showStartPicker && (
                    <DateTimePicker
                        value={startDate || new Date()}
                        mode="date"
                        display={isAndroid ? 'calendar' : 'default'}
                        onChange={(event, selectedDate) => {
                            // if (isAndroid) setShowStartPicker(false);
                            if (selectedDate) {
                                handleStartDateChange(event, selectedDate);
                            }
                        }}
                    />
                )}

                {showEndPicker && (
                    <DateTimePicker
                        value={endDate || new Date()}
                        mode="date"
                        display={isAndroid ? 'calendar' : 'default'}
                        onChange={(event, selectedDate) => {
                            // if (isAndroid) setShowEndPicker(false);
                            if (selectedDate) {
                                handleEndDateChange(event, selectedDate);
                            }
                        }}
                    />
                )}

                {/* Mostrar Boton para filtrar por productos */}
                <Button
                    mode="contained"
                    icon="magnify"
                    onPress={handleSelectProduct}
                    style={styles.productFilterButton}>Mostrar Ordenes Por Producto</Button>


                {(startDate && endDate || showingOrdersByProduct) && (
                    <>
                        {/* <Searchbar
                            placeholder="Buscar"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            style={styles.searchbar}
                            inputStyle={styles.searchInput}
                            icon="magnify"
                            placeholderTextColor="#666"
                        /> */}
                        {loading ? (
                            <View style={styles.centered}>
                                <ActivityIndicator size="large" />
                            </View>
                        ) : (
                            orders.length === 0 ? (
                                <View style={styles.errorContainer}>
                                    <Text style={styles.errorText}>No hay pedidos registrados.</Text>
                                    <TouchableOpacity
                                        onPress={() => handleGoBack()}
                                        style={styles.goBackButton}
                                    >
                                        <Text style={styles.goBackButtonText}>Regresar</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View style={styles.instructionText}>
                                    <Text style={styles.errorText}>Pedidos encontrados: {orders.length}</Text>
                                </View>
                            )
                        )}
                        {orders.length > 0 && (
                            orders.map((order) => (
                                <Card key={order.idOrder} style={styles.orderCard}>
                                    <Card.Content>
                                        <View style={styles.orderHeader}>
                                            <View>
                                                <Text variant="titleMedium">Pedido #{order.idOrder}</Text>
                                                <Text variant="titleMedium">{order.clientName || 'Nombre no encontrado'}</Text>
                                                <Text variant="bodySmall">{formatDate(order.createdAt)}</Text>
                                            </View>
                                            <Chip
                                                style={[
                                                    styles.statusChip,
                                                    { backgroundColor: getStatusColor(order.orderStatus.idOrderStatus) }
                                                ]}
                                            >
                                                <Text style={styles.statusText}>{order.orderStatus.status}</Text>
                                            </Chip>
                                        </View>

                                        <List.Section>
                                            <List.Subheader>Productos</List.Subheader>
                                            {order.cart.itemsCart.map((item, index) => (
                                                <List.Item
                                                    key={index}
                                                    title="nombre del producto"
                                                    description={`Cantidad: ${item.quantity}`}
                                                    left={props => <List.Icon {...props} icon="food" />}
                                                    right={props => <Text {...props}>{`$${(item.quantity * item.individualPrice).toFixed(2)}`}</Text>}
                                                />
                                            ))}
                                            {/* {order.items.map((item, index) => (
                                                item.quantity > 0 ? (
                                                    <List.Item
                                                        key={index}
                                                        title={`${item.quantity} x ${item.product.name}`}
                                                        descriptionNumberOfLines={3}
                                                        description={`${item.personalizations ? item.personalizations.map(item => ` ${item.name}`) : null}`}
                                                        left={props => <List.Icon {...props} icon="food" />}
                                                        right={props => <Text {...props}>{`$${(item.quantity * item.product.price).toFixed(2)}`}</Text>}
                                                    />) : null
                                            ))} */}
                                        </List.Section>

                                        <List.Item
                                            title="Dirección de entrega"
                                            description={formatAddress(order.idLocation)}
                                            left={props => <List.Icon {...props} icon="map-marker" />}
                                        />

                                        <View style={styles.orderFooter}>
                                            <View>
                                                <Text variant="bodyMedium">Método de pago: {order.paymentType.type}</Text>
                                                <Text variant="titleMedium" style={styles.total}>
                                                    Total: ${order.totalPrice.toFixed(2)}
                                                </Text>
                                            </View>
                                        </View>
                                    </Card.Content>
                                </Card>
                            ))
                        )}
                    </>
                )}
                <View style={styles.container}>
                </View>
            </ScrollView>

            <ConfirmationDialog
                visible={showDialog}
                message={dialogMsg || error}
                onConfirm={() => {
                    setCustomContent(null);
                    setCustomTittle(null);
                    setSelectedProduct(null);
                    setDialogMsg(null);
                    setError(null);
                    setLoadingProducts(false);
                    setLoading(false);
                    setShowDialog(false);
                    setShowingOrdersByProduct(false);

                }}
                onDismiss={() => {
                    setShowDialog(false)
                    setCustomContent(null);
                    setCustomTittle(null);
                    setSelectedProduct(null);
                    setDialogMsg(null);
                    setError(null);
                    setLoadingProducts(false);
                    setLoading(false);
                    setShowingOrdersByProduct(false);
                }}
                title={customTittle ? customTittle : "Aviso"}
                cancelButtonLabel=""
                confirmButtonLabel="Cerrar"
                customContent={customContent || null}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: theme.colors.primary,
    },
    scrollContainer: {
        flex: 1,
        backgroundColor: theme.colors.surface,
    },
    searchbar: {
        flex: 1,
        elevation: 0,
        backgroundColor: '#ffffff',
        borderRadius: 17,
        height: 50,
        margin: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    orderCard: {
        margin: 8,
        backgroundColor: theme.colors.surface,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    statusChip: {
        borderRadius: 12,
    },
    statusText: {
        color: 'white',
    },
    orderFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
    },
    total: {
        fontWeight: 'bold',
        marginTop: 4,
    },
    error: {
        flex: 1,
        justifyContent: 'center !important',
        alignItems: 'center',
        textAlign: 'center',
        color: 'red',
        marginTop: "40vh",
        fontSize: 16, // Ajustar el tamaño del texto
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    errorText: {
        // color: 'red',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 10,
    },
    errorTextDescription: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 5,
    },
    goBackButton: {
        backgroundColor: '#2D221D', // Color oscuro similar al botón de la imagen
        // flex: 1, // Para que ocupe más espacio
        marginTop: 20,
        marginLeft: 10,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 0.5 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    goBackButtonText: {
        fontSize: 15,
        color: 'white',
        fontWeight: 'bold',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    instructionText: {
        marginTop: 16,
        marginHorizontal: 16,
        fontSize: 16,
        fontWeight: '500',
        color: theme.colors.onSurface,
    },
    dateInputContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        margin: 16,
    },
    dateButton: {
        flex: 1,
        marginRight: 8,
        borderRadius: 12,
    },
    dateLabel: {
        fontSize: 14,
        color: theme.colors.primary,
    },
    productFilterButton: {
        margin: 16,
        borderRadius: 12,
        backgroundColor: theme.colors.primary,
    },
    container: {
        height: 80,
        backgroundColor: theme.colors.surface
    }
}); 
