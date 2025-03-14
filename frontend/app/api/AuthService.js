import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './ApiService';

class AuthService {
    async login(credentials) {
        try {
            const response = await api.login(credentials);
            if (response.token) {
                await this.setToken(response.token);
                await this.setUser(response.user);
                const currentUser = await this.getUser();
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

    async updateEmail(email) {
        try {
            const response = await api.updateEmail(email);
            // Update stored user data
            const currentUser = await this.getUser();
            if (currentUser) {
                currentUser.email = email;
                await this.setUser(currentUser);
            }
            return response;
        } catch (error) {
            console.error('Update email error:', error);
            throw error;
        }
    }

    async updatePassword(oldPassword, newPassword) {
        try {
            const response = await api.updatePassword(oldPassword, newPassword);
            return response;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async deleteProfile() {
        try {
            const response = await api.deleteProfile();
            // Clear local storage and session
            await this.logout();
            return response;
        } catch (error) {
            console.error('Delete profile error:', error);
            throw error;
        }
    }
}

export default new AuthService();
