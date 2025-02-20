import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './ApiService';

class AuthService {
    async login(userData) {
        const response = await api.post("/auth/login", userData);
        console.log(response);
        if (response.token) {
            await AsyncStorage.setItem('userToken', response.token);
        }
        return response;
    }

    async getToken() {
        return await AsyncStorage.getItem('userToken');
    }

    async logout() {
        await AsyncStorage.removeItem('userToken');
    }
}

export default new AuthService();
