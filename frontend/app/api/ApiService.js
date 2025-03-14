import { BaseApiService } from './BaseApiService';

class ApiService extends BaseApiService {
    async login(credentials) {
        return this.request('/auth/login', 'POST', credentials);
    }

    async register(userData) {
        return this.request('/auth/register', 'POST', userData);
    }

    async getUserProfile() {
        return this.request('/user/profile', 'GET');
    }

    async updateEmail(email) {
        return this.request('/auth/email', 'PUT', { email });
    }
    async updatePassword(oldPassword, newPassword) {
        return this.request('/auth/password', 'PUT', { oldPassword, newPassword });
    }

    async deleteProfile() {
        return this.request('/auth/profile', 'DELETE');
    }
}

const apiService = new ApiService();
export default apiService;
