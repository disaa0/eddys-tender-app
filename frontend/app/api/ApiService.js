class ApiService {
    constructor(baseURL) {
        this.baseURL = baseURL;
    }

    async request(endpoint, method = "GET", body = null, headers = {}) {
        try {
            const config = {
                method,
                headers: {
                    "Content-Type": "application/json",
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
const api = new ApiService("http://localhost:3000/api");

export default api;
