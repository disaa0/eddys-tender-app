import api from "./ApiService";

class AuthService {
    async login(userData) {
        return await api.post("/auth/login", userData);
    }
}

// Exportamos una instancia para reutilizar en toda la app
export default new AuthService();
