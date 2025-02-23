import { View, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Button, Card, Text, TextInput, IconButton, Switch, Snackbar } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import AdminApiService from '../../api/AdminApiService';
import { theme } from '../../theme';

// Remove static data since we're using the API now
export default function ProductDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [product, setProduct] = useState(null);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });
  const [form, setForm] = useState({
    name: '',
    price: '',
    description: '',
    idProductType: 1,
    status: true
  });

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const response = await AdminApiService.getProduct(id);

      console.log('API Response:', response);

      if (response?.data?.product) {
        const productData = response.data.product;
        console.log('Product Data:', productData);

        setProduct(productData);
        setForm({
          name: productData.name || '',
          price: productData.price?.toString() || '0',
          description: productData.description || '',
          idProductType: productData.idProductType || 1,
          status: productData.status ?? true
        });
      } else {
        throw new Error('Producto no encontrado');
      }
    } catch (err) {
      console.error('Load Product Error:', err);
      setError(err.message);
      Alert.alert('Error', err.message || 'No se pudo cargar el producto');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = [];

    // Name validation
    if (!form.name.trim()) {
      errors.push('El nombre del producto es requerido');
    } else if (form.name.trim().length < 3) {
      errors.push('El nombre debe tener al menos 3 caracteres');
    } else if (form.name.trim().length > 50) {
      errors.push('El nombre no puede exceder 50 caracteres');
    }

    // Price validation
    const price = parseFloat(form.price);
    if (!form.price) {
      errors.push('El precio es requerido');
    } else if (isNaN(price)) {
      errors.push('El precio debe ser un número válido');
    } else if (price <= 0) {
      errors.push('El precio debe ser mayor a 0');
    } else if (price > 99999.99) {
      errors.push('El precio no puede exceder 99,999.99');
    }

    // Description validation
    if (!form.description.trim()) {
      errors.push('La descripción es requerida');
    } else if (form.description.trim().length < 10) {
      errors.push('La descripción debe tener al menos 10 caracteres');
    } else if (form.description.trim().length > 500) {
      errors.push('La descripción no puede exceder 500 caracteres');
    }

    return errors;
  };

  const handleChange = (key, value) => {
    // Clear any visible error messages when user starts typing
    if (snackbar.visible) {
      setSnackbar({ ...snackbar, visible: false });
    }

    // Real-time validation for specific fields
    if (key === 'name' && value.length > 50) {
      setSnackbar({
        visible: true,
        message: 'El nombre no puede exceder 50 caracteres'
      });
      return;
    }

    if (key === 'description' && value.length > 500) {
      setSnackbar({
        visible: true,
        message: 'La descripción no puede exceder 500 caracteres'
      });
      return;
    }

    if (key === 'price') {
      // Only allow numbers and one decimal point
      const regex = /^\d*\.?\d{0,2}$/;
      if (value && !regex.test(value)) {
        return;
      }
      // Convert empty string to '0'
      if (value === '') {
        value = '0';
      }
    }

    setForm({ ...form, [key]: value });
  };

  const handleCancel = () => {
    // Check if form has been modified
    const hasUnsavedChanges =
      product && (
        form.name !== product.name ||
        form.price !== product.price.toString() ||
        form.description !== product.description ||
        form.status !== product.status
      );

    if (hasUnsavedChanges) {
      Alert.alert(
        'Cambios sin Guardar',
        '¿Deseas descartar los cambios realizados?',
        [
          {
            text: 'Continuar Editando',
            style: 'cancel'
          },
          {
            text: 'Descartar',
            style: 'destructive',
            onPress: () => router.replace('/(appAdmin)/adminDashboard')
          }
        ]
      );
    } else {
      router.replace('/(appAdmin)/adminDashboard');
    }
  };

  const handleSave = async () => {
    try {
      const validationErrors = validateForm();

      if (validationErrors.length > 0) {
        Alert.alert(
          'Error de Validación',
          validationErrors.join('\n'),
          [{ text: 'OK' }]
        );
        return;
      }

      // Ensure price is a number and has 2 decimal places
      const price = parseFloat(parseFloat(form.price).toFixed(2));

      console.log('Sending update with data:', {
        id,
        name: form.name.trim(),
        description: form.description.trim(),
        price: price,
        idProductType: form.idProductType,
        status: form.status
      });

      const response = await AdminApiService.updateProduct(id, {
        name: form.name.trim(),
        description: form.description.trim(),
        price: price,
        idProductType: form.idProductType,
        status: form.status
      });

      console.log('Update Response:', response);

      if (response?.message === "Detalles del producto actualizados correctamente") {
        setSnackbar({
          visible: true,
          message: 'Producto actualizado correctamente'
        });

        setTimeout(() => {
          router.replace('/(appAdmin)/adminDashboard');
        }, 1500);
      } else {
        throw new Error('Error al actualizar el producto');
      }
    } catch (error) {
      console.error('Save Error:', error);
      setSnackbar({
        visible: true,
        message: error.message || 'No se pudo actualizar el producto'
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text variant="bodyLarge" style={styles.errorText}>Error: {error}</Text>
        <Button
          mode="contained"
          onPress={loadProduct}
          style={styles.retryButton}
        >
          Reintentar
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Add header with back button */}
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={handleCancel}
        />
        <Text variant="titleLarge" style={styles.title}>Editar Producto</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <Card style={styles.card}>
          <Card.Content style={styles.content}>
            <TextInput
              mode="outlined"
              label="Nombre del producto *"
              value={form.name}
              multiline
              numberOfLines={1}
              onChangeText={(text) => handleChange('name', text)}
              style={[styles.input, { textAlignVertical: 'top', height: 100 }]}
              placeholder="Ingrese el nombre del producto"
              maxLength={50}
              right={<TextInput.Affix text={`${form.name.length}/50`} />}
            />

            {/* CAMBIAR SI SE PIDE */}
            {/* <TextInput
              mode="outlined"
              label="Precio *"
              value={form.price}
              onChangeText={(text) => handleChange('price', text)}
              keyboardType="decimal-pad"
              style={styles.input}
              placeholder="0.00"
              left={<TextInput.Affix text="$" />}
              right={<TextInput.Affix text={form.price ? `$${parseFloat(form.price).toFixed(2)}` : '$0.00'} />}
            /> */}

            <TextInput
              mode="outlined"
              label="Descripción *"
              value={form.description}
              onChangeText={(text) => handleChange('description', text)}
              multiline
              numberOfLines={3}
              style={[styles.input, { textAlignVertical: 'center' }]}
              placeholder="Describa el producto"
              maxLength={500}
              right={<TextInput.Affix text={`${form.description.length}/500`} />}
            />

            {/* CAMBIAR SI SE PIDE */}
            {/* <View style={styles.switchContainer}>
              <Text>Estado del producto</Text>
              <Switch
                value={form.status}
                onValueChange={(value) => handleChange('status', value)}
                color={theme.colors.primary}
              />
            </View> */}
          </Card.Content>
        </Card>

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleSave}
            style={styles.button}
            icon="content-save"
          >
            Guardar Cambios
          </Button>

          <Button
            mode="outlined"
            onPress={handleCancel}
            style={styles.button}
            icon="close"
          >
            Cancelar
          </Button>
        </View>
      </ScrollView>

      {/* Add Snackbar for messages */}
      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
        duration={2000}
        style={styles.snackbar}
      >
        {snackbar.message}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    flex: 1,
    marginLeft: 16,
  },
  scrollView: {
    flex: 1,
  },
  card: {
    margin: 16,
  },
  content: {
    padding: 16,
  },
  input: {
    marginVertical: 8,

  },
  buttonContainer: {
    padding: 16,
    gap: 8,
  },
  button: {
    marginVertical: 4,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  retryButton: {
    marginTop: 16,
  },
  errorText: {
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
    paddingVertical: 8,
  },
  snackbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
}); 