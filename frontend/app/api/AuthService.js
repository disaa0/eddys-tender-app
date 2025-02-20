import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './ApiService';

class AuthService {
    async login(credentials) {
        try {
            const response = await api.login(credentials);
            if (response.token) {
                await this.setToken(response.token);
                await this.setUser(response.user);
                return response;
            }
            throw new Error('No se recibió token de autenticación');
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    async setToken(token) {
        await AsyncStorage.setItem('userToken', token);
    }

    async setUser(user) {
        await AsyncStorage.setItem('userData', JSON.stringify(user));
    }

    async getToken() {
        return await AsyncStorage.getItem('userToken');
    }

    async getUser() {
        const userData = await AsyncStorage.getItem('userData');
        return userData ? JSON.parse(userData) : null;
    }

    async logout() {
        await AsyncStorage.multiRemove(['userToken', 'userData']);
    }
}

export default new AuthService();
