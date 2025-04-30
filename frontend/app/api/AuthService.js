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
        // Get the push token and user token before removing AsyncStorage items
        const pushToken = await AsyncStorage.getItem('pushToken');
        const userToken = await AsyncStorage.getItem('userToken');
        
        // If we have both push token and user token, unregister it when logging out
        if (pushToken && userToken) {
            try {
                const notificationApiService = require('./NotificationApiService').default;
                await notificationApiService.unregisterToken(pushToken);
                console.log('Successfully unregistered push token on logout');
            } catch (error) {
                console.error('Failed to unregister push token:', error);
                // Continue with logout even if token unregistration fails
            }
        }
        
        // Remove user data from AsyncStorage
        await AsyncStorage.multiRemove(['userToken', 'userData']);
        
        // Remove push token from AsyncStorage as well
        if (pushToken) {
            await AsyncStorage.removeItem('pushToken');
        }
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
