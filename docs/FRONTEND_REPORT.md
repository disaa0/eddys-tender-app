# Reporte Técnico del Frontend

## 1. Resumen Ejecutivo

### 1.1 Descripción General
Frontend móvil para Eddy's Tender, una aplicación de gestión de pedidos de comida. Implementa autenticación, gestión de usuarios, productos, carrito de compras y sistema de personalización de productos.

### 1.2 Stack Tecnológico Principal
- **Framework**: React Native (Expo)
- **Routing**: Expo Router
- **UI Components**: React Native Paper
- **Autenticación**: JWT
- **Gestión de Estado**: Context API
- **Validación**: Zod
- **Estilos**: StyleSheet API

## 2. Arquitectura del Sistema

### 2.1 Estructura de Directorios
```
frontend/
├── app/
│   ├── (app)/           # Rutas protegidas de usuario
│   ├── (appAdmin)/      # Rutas protegidas de admin
│   ├── (auth)/          # Rutas públicas de auth
│   ├── api/             # Servicios API
│   ├── components/      # Componentes reutilizables
│   ├── context/         # Contextos globales
│   ├── hooks/           # Custom hooks
│   └── theme.js         # Configuración de tema
├── assets/              # Imágenes y recursos
└── docs/               # Documentación
```

### 2.2 Configuración de Navegación
```javascript
// Estructura de navegación principal
const Stack = createStackNavigator();

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
        <Stack.Screen name="(appAdmin)" options={{ headerShown: true }} />
      </Stack>
    </AuthProvider>
  );
}
```

## 3. Sistema de Autenticación

### 3.1 Gestión de Usuarios
1. **Login**
   ```javascript
   const handleLogin = async () => {
     try {
       const credentials = {
         [isEmail ? 'email' : 'username']: emailOrUsername,
         password,
       };
       const response = await login(credentials);
       
       // Redirección basada en rol
       if (response.user.idUserType === 1) {
         router.replace('/(appAdmin)');
       } else {
         router.replace('/(app)');
       }
     } catch (error) {
       setError(error.message);
     }
   };
   ```

2. **Registro**
   ```javascript
   const handleRegister = async () => {
     const userData = {
       username,
       email,
       password,
       name,
       lastName,
       secondLastName,
       phone,
     };
     await api.register(userData);
   };
   ```

### 3.2 Protección de Rutas
```javascript
function useProtectedRoute() {
  const segments = useSegments();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/login');
    }
  }, [isAuthenticated, segments]);
}
```

## 4. Interfaces Principales

### 4.1 Panel de Usuario
1. **Home**
   ```javascript
   export default function Index() {
     return (
       <View>
         <SearchBar />
         <CategoryChips />
         <ProductList />
       </View>
     );
   }
   ```

2. **Carrito**
   ```javascript
   export default function Cart() {
     return (
       <View>
         <CartItems />
         <OrderSummary />
         <CheckoutButton />
       </View>
     );
   }
   ```

### 4.2 Panel de Administrador
1. **Dashboard**
   ```javascript
   export default function AdminDashboard() {
     return (
       <View>
         <ProductManagement />
         <OrderManagement />
         <Analytics />
       </View>
     );
   }
   ```

2. **Gestión de Productos**
   ```javascript
   export default function ProductManagement() {
     const [products, setProducts] = useState([]);
     const [loading, setLoading] = useState(true);

     return (
       <View>
         <ProductList data={products} />
         <AddProductFAB />
       </View>
     );
   }
   ```

## 5. Componentes Reutilizables

### 5.1 UI Components
```javascript
// CategoryChips.js
export default function CategoryChips({ 
  categories, 
  selectedCategory, 
  onSelect 
}) {
  return (
    <ScrollView horizontal>
      {categories.map((category) => (
        <Chip
          selected={selectedCategory === category}
          onPress={() => onSelect(category)}
        >
          {category}
        </Chip>
      ))}
    </ScrollView>
  );
}
```

### 5.2 Formularios
```javascript
// ProductForm.js
export default function ProductForm({ 
  initialData, 
  onSubmit 
}) {
  const [form, setForm] = useState(initialData);
  
  return (
    <View>
      <TextInput
        label="Nombre"
        value={form.name}
        onChangeText={(text) => setForm({...form, name: text})}
      />
      <TextInput
        label="Precio"
        value={form.price}
        keyboardType="decimal-pad"
      />
      <Button onPress={() => onSubmit(form)}>
        Guardar
      </Button>
    </View>
  );
}
```

## 6. Estilos y Tema

### 6.1 Configuración del Tema
```javascript
export const theme = {
  colors: {
    primary: '#2196F3',
    accent: '#03A9F4',
    background: '#FFFFFF',
    surface: '#FFFFFF',
    text: '#000000',
    error: '#B00020',
  },
  roundness: 4,
  fonts: {
    regular: {
      fontFamily: 'sans-serif',
      fontWeight: 'normal',
    },
    medium: {
      fontFamily: 'sans-serif-medium',
      fontWeight: '500',
    },
  },
};
```

### 6.2 Estilos Comunes
```javascript
const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  card: {
    margin: 8,
    elevation: 2,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginVertical: 8,
  },
  errorText: {
    color: theme.colors.error,
    marginBottom: 8,
  },
});
```

## 7. Integración con Backend

### 7.1 Servicios API
```javascript
const ApiService = {
  login: async (credentials) => {
    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    return response.data;
  },
  
  getProducts: async () => {
    const response = await axios.get(`${API_URL}/products`);
    return response.data;
  },
  
  updateProduct: async (id, data) => {
    const response = await axios.put(`${API_URL}/products/${id}`, data);
    return response.data;
  }
};
```

### 7.2 Manejo de Errores
```javascript
const handleApiError = (error) => {
  if (error.response) {
    switch (error.response.status) {
      case 401:
        router.replace('/login');
        break;
      case 403:
        setError('No tienes permisos para realizar esta acción');
        break;
      default:
        setError('Error en el servidor');
    }
  } else {
    setError('Error de conexión');
  }
};
``` 