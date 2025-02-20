import AuthService from "./AuthService";

class ApiService {
    constructor(baseURL) {
        this.baseURL = baseURL;
    }

    // Método para obtener el token y agregarlo a los headers
    async getAuthHeaders() {
        const token = await AuthService.getToken(); // Obtener el token del almacenamiento
        return {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "", // Si el token existe, se agrega al header
        };
    }

    async request(endpoint, method = "GET", body = null, headers = {}) {
        try {
            const authHeaders = await this.getAuthHeaders(); // Obtener los headers con el token

            const config = {
                method,
                headers: {
                    ...authHeaders, // Agregar los headers de autenticación
                    ...headers,
                },
            };

            if (body) {
                config.body = JSON.stringify(body);
            }

            const response = await fetch(`${this.baseURL}${endpoint}`, config);

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Error en la API:", error);
            throw error;
        }
    }

    get(endpoint, headers = {}) {
        return this.request(endpoint, "GET", null, headers);
    }

    post(endpoint, body, headers = {}) {
        return this.request(endpoint, "POST", body, headers);
    }

    put(endpoint, body, headers = {}) {
        return this.request(endpoint, "PUT", body, headers);
    }

    delete(endpoint, headers = {}) {
        return this.request(endpoint, "DELETE", null, headers);
    }
}

// Crear una instancia de la API con la URL base
// const api = new ApiService("http://10.10.128.183:3000/api"); // 🔥 Cambiar por la IP de tu servidor local para probar en tu telefono con la app de Expo Go
const api = new ApiService("http://localhost:3000/api");

export default api;
