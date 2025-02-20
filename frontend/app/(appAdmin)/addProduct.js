import { View, Alert, StyleSheet, ScrollView, Image } from 'react-native';
import { Button, TextInput, IconButton, Text, Card, Snackbar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import * as ImagePicker from "expo-image-picker";
import AdminApiService from '../api/AdminApiService';
import RNPickerSelect from "react-native-picker-select";
import { theme } from '../theme';

export default function AddProduct() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    idProductType: "",
    status: true
  });
  const [image, setImage] = useState("");
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });

  // Validate form data
  const validateForm = () => {
    const errors = [];

    // Name validation
    if (!form.name.trim()) {
      errors.push('El nombre del producto es requerido');
    } else if (form.name.trim().length < 3) {
      errors.push('El nombre debe tener al menos 3 caracteres');
    }

    // Price validation
    const price = parseFloat(form.price);
    if (!form.price) {
      errors.push('El precio es requerido');
    } else if (isNaN(price) || price <= 0) {
      errors.push('El precio debe ser un número válido mayor a 0');
    }

    // Description validation
    if (!form.description.trim()) {
      errors.push('La descripción es requerida');
    } else if (form.description.trim().length < 10) {
      errors.push('La descripción debe tener al menos 10 caracteres');
    }

    // Product type validation
    if (!form.idProductType) {
      errors.push('El tipo de producto es requerido');
    }

    return errors;
  };

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
    if (error) setError('');
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  const handleAddProduct = async () => {
    try {
      const validationErrors = validateForm();
      if (validationErrors.length > 0) {
        setError(validationErrors.join('\n'));
        return;
      }

      setLoading(true);
      setError('');

      const productData = {
        ...form,
        price: parseFloat(form.price),
        idProductType: parseInt(form.idProductType),
      };

      const response = await AdminApiService.addProduct(productData);

      if (response) {
        setSnackbar({
          visible: true,
          message: 'Producto agregado correctamente'
        });

        setTimeout(() => {
          router.replace('/(appAdmin)/adminDashboard');
        }, 1500);
      }

    } catch (err) {
      setError(err.message || 'Error al agregar el producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => router.back()}
        />
        <Text variant="titleLarge" style={styles.title}>Agregar Producto</Text>
        <View style={{ width: 48 }} /> {/* Spacer */}
      </View>

      <ScrollView style={styles.scrollView}>
        <Card style={styles.card}>
          <Card.Content>
            <Button
              mode="contained"
              onPress={pickImage}
              style={styles.imageButton}
              icon="camera"
            >
              Seleccionar Imagen
            </Button>

            {image && (
              <Image
                source={{ uri: image }}
                style={styles.imagePreview}
              />
            )}

            <TextInput
              mode="outlined"
              label="Nombre del producto *"
              value={form.name}
              onChangeText={(text) => handleChange("name", text)}
              style={styles.input}
              maxLength={50}
            />

            <TextInput
              mode="outlined"
              label="Precio *"
              value={form.price}
              onChangeText={(text) => handleChange("price", text)}
              keyboardType="decimal-pad"
              style={styles.input}
              left={<TextInput.Affix text="$" />}
            />

            <TextInput
              mode="outlined"
              label="Descripción *"
              value={form.description}
              onChangeText={(text) => handleChange("description", text)}
              multiline
              numberOfLines={3}
              style={styles.input}
            />

            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Tipo de Producto *</Text>
              <RNPickerSelect
                onValueChange={(value) => handleChange("idProductType", value)}
                items={[
                  { label: "Comida", value: "1" },
                  { label: "Bebida", value: "2" },
                  { label: "Extra", value: "3" },
                ]}
                placeholder={{ label: "Seleccione un tipo", value: null }}
                style={pickerSelectStyles}
              />
            </View>

            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}

            <Button
              mode="contained"
              onPress={handleAddProduct}
              style={styles.addButton}
              loading={loading}
              disabled={loading}
            >
              Agregar Producto
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>

      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
        duration={1500}
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
    backgroundColor: theme.colors.background,
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
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  card: {
    margin: 16,
  },
  input: {
    marginBottom: 16,
  },
  imageButton: {
    marginBottom: 16,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    marginBottom: 16,
    borderRadius: 8,
  },
  pickerContainer: {
    marginBottom: 16,
  },
  pickerLabel: {
    marginBottom: 8,
    color: theme.colors.primary,
  },
  errorText: {
    color: theme.colors.error,
    marginBottom: 16,
    textAlign: 'center',
  },
  addButton: {
    marginTop: 8,
  },
  snackbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.primary,
  }
});

const pickerSelectStyles = {
  inputIOS: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 16,
    borderRadius: 5,
    marginTop: 10
  },
  inputAndroid: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 16,
    borderRadius: 5,
    marginTop: 10
  },
};