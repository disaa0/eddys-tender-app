# Guía de Implementación de Autocompletado de Direcciones

Este documento proporciona directrices para implementar la funcionalidad de autocompletado de direcciones en la aplicación Eddy's Tender para mejorar la experiencia del usuario al ingresar direcciones de envío.

## Tabla de Contenidos

1. [Introducción](#introducción)
2. [Opciones de API](#opciones-de-api)
3. [Implementación en el Backend](#implementación-en-el-backend)
4. [Implementación en el Frontend](#implementación-en-el-frontend)
5. [Seguridad y Mejores Prácticas](#seguridad-y-mejores-prácticas)
6. [Pruebas](#pruebas)

## Introducción

La funcionalidad de autocompletado de direcciones ayuda a los usuarios a ingresar direcciones de manera más precisa y eficiente. Esta característica sugiere opciones de direcciones a medida que el usuario escribe, reduce errores de entrada y asegura que las direcciones sean válidas y estandarizadas.

## Opciones de API

### Google Places API

La opción más completa con cobertura global.

**Pros:**

- Amplia cobertura global
- Alta precisión
- Actualizaciones regulares
- Características adicionales (geocodificación, detalles de lugares)

**Contras:**

- Límites de uso y costos para aplicaciones de alto volumen
- Requiere tarjeta de crédito para la clave API

**Precios:**

- $2.00-$4.00 USD por cada 1,000 solicitudes (depende del tipo de solicitud)
- Nivel gratuito mensual: $200 en crédito (~100,000 solicitudes)

### Mapbox

Excelente alternativa con precios competitivos.

**Pros:**

- Buena cobertura global
- API moderna
- Precios flexibles
- Compatible con código abierto

**Contras:**

- Puede tener menos cobertura que Google en algunas regiones

**Precios:**

- Nivel gratuito: 100,000 solicitudes/mes
- $0.75 por cada 1,000 solicitudes después del nivel gratuito

### HERE Geocoding and Search API

Buena opción empresarial con planes flexibles.

**Pros:**

- Buena documentación
- Precios competitivos para empresas

**Contras:**

- Menos popular en aplicaciones de consumo

**Precios:**

- Nivel gratuito: 250,000 transacciones/mes
- Precios empresariales para volúmenes mayores

# Implementación de Google Places API

## Implementación en el Backend

### 1. Configuración e Instalación

#### Instalar Paquete Requerido

```bash
npm install node-fetch@2 --save
```

#### Configuración del Entorno

Agregar al archivo `.env`:

```
GOOGLE_PLACES_API_KEY=tu_clave_api_aquí
```

#### Gestión de Clave API

Crear un servicio para manejar la comunicación con la API:

```javascript
// src/services/geocoding.service.js
const fetch = require("node-fetch");
require("dotenv").config();

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

// Autocompletado de direcciones (predicciones)
async function getAddressPredictions(query, country = "mx") {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&types=address&components=country:${country}&key=${GOOGLE_API_KEY}`,
    );

    const data = await response.json();
    if (data.status !== "OK") {
      throw new Error(`Error de Google Places API: ${data.status}`);
    }

    return data.predictions.map((prediction) => ({
      id: prediction.place_id,
      description: prediction.description,
      mainText: prediction.structured_formatting.main_text,
      secondaryText: prediction.structured_formatting.secondary_text,
    }));
  } catch (error) {
    console.error("Error al obtener predicciones de direcciones:", error);
    throw error;
  }
}

// Obtener detalles de dirección desde place_id
async function getAddressDetails(placeId) {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=address_component,geometry&key=${GOOGLE_API_KEY}`,
    );

    const data = await response.json();
    if (data.status !== "OK") {
      throw new Error(`Error de Google Places API: ${data.status}`);
    }

    // Analizar componentes de dirección
    const addressComponents = {};
    data.result.address_components.forEach((component) => {
      component.types.forEach((type) => {
        addressComponents[type] = component.long_name;
      });
    });

    return {
      street: `${addressComponents.route || ""}`,
      houseNumber: addressComponents.street_number || "",
      postalCode: addressComponents.postal_code || "",
      neighborhood:
        addressComponents.sublocality_level_1 ||
        addressComponents.sublocality ||
        "",
      city: addressComponents.locality || "",
      state: addressComponents.administrative_area_level_1 || "",
      country: addressComponents.country || "",
      coordinates: {
        lat: data.result.geometry.location.lat,
        lng: data.result.geometry.location.lng,
      },
    };
  } catch (error) {
    console.error("Error al obtener detalles de dirección:", error);
    throw error;
  }
}

module.exports = {
  getAddressPredictions,
  getAddressDetails,
};
```

### 2. Crear Endpoints del Controlador

```javascript
// src/controllers/geocoding.controller.js
const {
  getAddressPredictions,
  getAddressDetails,
} = require("../services/geocoding.service");

async function handleAddressPredictions(req, res) {
  try {
    const { query, country } = req.query;

    if (!query || query.length < 3) {
      return res
        .status(400)
        .json({ error: "La consulta debe tener al menos 3 caracteres" });
    }

    const predictions = await getAddressPredictions(query, country || "mx");
    res.json({ predictions });
  } catch (error) {
    console.error(
      "Error en el endpoint de predicciones de direcciones:",
      error,
    );
    res
      .status(500)
      .json({ error: "Error al obtener predicciones de direcciones" });
  }
}

async function handleAddressDetails(req, res) {
  try {
    const { placeId } = req.params;

    if (!placeId) {
      return res.status(400).json({ error: "Se requiere el ID del lugar" });
    }

    const addressDetails = await getAddressDetails(placeId);
    res.json({ address: addressDetails });
  } catch (error) {
    console.error("Error en el endpoint de detalles de dirección:", error);
    res.status(500).json({ error: "Error al obtener detalles de dirección" });
  }
}

module.exports = {
  handleAddressPredictions,
  handleAddressDetails,
};
```

### 3. Configurar Rutas

```javascript
// src/routes/geocoding.routes.js
const express = require("express");
const { authenticateToken } = require("../middlewares/auth.middleware.js");
const {
  handleAddressPredictions,
  handleAddressDetails,
} = require("../controllers/geocoding.controller.js");

const router = express.Router();

router.get("/predictions", authenticateToken, handleAddressPredictions);
router.get("/details/:placeId", authenticateToken, handleAddressDetails);

module.exports = router;
```

### 4. Registrar Rutas en App.js

```javascript
// Agregar a src/app.js
const geocodingRoutes = require("./routes/geocoding.routes");
app.use("/api/geocoding", geocodingRoutes);
```

## Implementación en el Frontend

### 1. Instalar Dependencias

```bash
cd frontend
npm install react-native-google-places-autocomplete
```

### 2. Crear Servicio API

```javascript
// app/services/geocodingService.js
import axios from "axios";
import { API_URL } from "../config/constants";
import { getToken } from "../utils/authStorage";

export const getPredictions = async (query, country = "mx") => {
  try {
    const token = await getToken();
    const response = await axios.get(
      `${API_URL}/geocoding/predictions?query=${encodeURIComponent(query)}&country=${country}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    return response.data.predictions;
  } catch (error) {
    console.error("Error al obtener predicciones:", error);
    throw error;
  }
};

export const getAddressDetails = async (placeId) => {
  try {
    const token = await getToken();
    const response = await axios.get(
      `${API_URL}/geocoding/details/${placeId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    return response.data.address;
  } catch (error) {
    console.error("Error al obtener detalles de dirección:", error);
    throw error;
  }
};
```

### 3. Crear Componente de Entrada de Dirección

```javascript
// app/components/AddressAutocomplete.js
import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { TextInput, List } from "react-native-paper";
import * as GeocodingService from "../services/geocodingService";

const AddressAutocomplete = ({ onAddressSelected }) => {
  const [query, setQuery] = useState("");
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPredictions = async () => {
      if (query.length < 3) {
        setPredictions([]);
        return;
      }

      setLoading(true);
      try {
        const results = await GeocodingService.getPredictions(query);
        setPredictions(results);
      } catch (error) {
        console.error("Error al obtener predicciones:", error);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchPredictions, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSelectAddress = async (placeId) => {
    try {
      setLoading(true);
      const addressDetails = await GeocodingService.getAddressDetails(placeId);
      onAddressSelected(addressDetails);
      setQuery(
        addressDetails.street +
          (addressDetails.houseNumber ? ` ${addressDetails.houseNumber}` : ""),
      );
      setPredictions([]);
    } catch (error) {
      console.error("Error al seleccionar dirección:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        label="Buscar dirección"
        value={query}
        onChangeText={setQuery}
        mode="outlined"
        style={styles.input}
        right={
          loading ? (
            <TextInput.Icon icon={() => <ActivityIndicator size={20} />} />
          ) : null
        }
      />

      {predictions.length > 0 && (
        <View style={styles.predictionsContainer}>
          {predictions.map((prediction) => (
            <List.Item
              key={prediction.id}
              title={prediction.mainText}
              description={prediction.secondaryText}
              onPress={() => handleSelectAddress(prediction.id)}
              style={styles.predictionItem}
              titleNumberOfLines={1}
              descriptionNumberOfLines={1}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    zIndex: 10,
  },
  input: {
    marginBottom: 4,
  },
  predictionsContainer: {
    backgroundColor: "#fff",
    borderRadius: 4,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    maxHeight: 200,
    overflow: "scroll",
  },
  predictionItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
});

export default AddressAutocomplete;
```

### 4. Implementar en el Formulario de Dirección

```javascript
// app/screens/AddressFormScreen.js (o formulario equivalente)
import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Button, TextInput, Snackbar } from "react-native-paper";
import AddressAutocomplete from "../components/AddressAutocomplete";
import { addShippingAddress } from "../services/addressService";

const AddressFormScreen = ({ navigation }) => {
  const [address, setAddress] = useState({
    street: "",
    houseNumber: "",
    postalCode: "",
    neighborhood: "",
    city: "",
    state: "",
    country: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAddressSelected = (addressDetails) => {
    setAddress({
      street: addressDetails.street || "",
      houseNumber: addressDetails.houseNumber || "",
      postalCode: addressDetails.postalCode || "",
      neighborhood: addressDetails.neighborhood || "",
      city: addressDetails.city || "",
      state: addressDetails.state || "",
      country: addressDetails.country || "",
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await addShippingAddress({
        street: address.street,
        houseNumber: address.houseNumber,
        postalCode: address.postalCode,
        neighborhood: address.neighborhood,
      });
      navigation.goBack();
    } catch (error) {
      setError("Error guardando la dirección");
      console.error("Error al guardar dirección:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <AddressAutocomplete onAddressSelected={handleAddressSelected} />

      <TextInput
        label="Calle"
        value={address.street}
        onChangeText={(text) => setAddress({ ...address, street: text })}
        mode="outlined"
        style={styles.input}
      />

      <TextInput
        label="Número"
        value={address.houseNumber}
        onChangeText={(text) => setAddress({ ...address, houseNumber: text })}
        mode="outlined"
        style={styles.input}
      />

      <TextInput
        label="Código Postal"
        value={address.postalCode}
        onChangeText={(text) => setAddress({ ...address, postalCode: text })}
        mode="outlined"
        style={styles.input}
        keyboardType="numeric"
      />

      <TextInput
        label="Colonia"
        value={address.neighborhood}
        onChangeText={(text) => setAddress({ ...address, neighborhood: text })}
        mode="outlined"
        style={styles.input}
      />

      <Button
        mode="contained"
        onPress={handleSave}
        loading={loading}
        style={styles.button}
      >
        Guardar
      </Button>

      <Snackbar
        visible={!!error}
        onDismiss={() => setError("")}
        action={{ label: "OK", onPress: () => setError("") }}
      >
        {error}
      </Snackbar>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  input: {
    marginBottom: 12,
  },
  button: {
    marginTop: 16,
  },
});

export default AddressFormScreen;
```

## Seguridad y Mejores Prácticas

### Protección de la Clave API

1. **Proxy de Backend**: Nunca expongas tu clave API en el frontend. Siempre utiliza un proxy de backend para realizar llamadas a la API.
2. **Restricción de Clave API**: En la Consola de Google Cloud, restringe tu clave API:
   - Establece restricciones de referencia HTTP
   - Habilita solo las APIs necesarias (Places API)
   - Establece cuotas para prevenir facturas inesperadas

### Rate Limiting

Implementa limitación de tasa en tus endpoints de geocodificación:

```javascript
// Importar en app.js
const rateLimit = require("express-rate-limit");

// Aplicar a las rutas de geocodificación
const geocodingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limita cada IP a 100 solicitudes por windowMs
  message: "Demasiadas solicitudes desde esta IP, por favor intenta más tarde",
});

app.use("/api/geocoding", geocodingLimiter, geocodingRoutes);
```

### Manejo de Errores

1. Implementa un manejo adecuado de errores para fallos de la API
2. Proporciona mensajes de error amigables para el usuario
3. Agrega registros para propósitos de depuración

### Optimización de Solicitudes

1. Implementa debouncing en el frontend (como se muestra en el ejemplo)
2. Almacena en caché resultados comunes o recientes
3. Solo obtén predicciones cuando el usuario haya escrito al menos 3 caracteres

## Pruebas

### Pruebas de Backend

1. Prueba el servicio de geocodificación con diferentes entradas
2. Prueba los endpoints de API con parámetros válidos e inválidos
3. Prueba escenarios de manejo de errores

### Pruebas de Frontend

1. Prueba la funcionalidad de autocompletado con varias entradas
2. Prueba el envío del formulario con direcciones seleccionadas
3. Prueba la capacidad de respuesta de la UI y estados de error
