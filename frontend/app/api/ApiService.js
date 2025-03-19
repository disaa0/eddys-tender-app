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

    async getCartItems() {
        return this.request('/cart', 'GET');
    }

    async addCartItem(idProduct, quantity = 1) {
        return this.request(`/cart/items/${idProduct}`, 'PUT', { idProduct, quantity })
    }

    async createOrder(idPaymentType, idShipmentType, idLocation) {
        return this.request('/orders', 'POST', { idPaymentType, idShipmentType, idLocation })
    }

    async viewCartItems() {
        return this.request(`/cart`, 'GET')
    }

    async removeCartItem(idProduct) {
        return this.request(`/cart/items/${idProduct}`, 'DELETE')
    }

    async getShippingAdresses() {
        return this.request('/shipping-address', 'GET');
    }

    async addShippingAdresses(street, houseNumber, postalCode, neighborhood) {
        return this.request('/shipping-address', 'POST', { street, houseNumber, postalCode, neighborhood });
    }

    async getShippingAddressById(id) {
        return this.request(`/shipping-address/${id}`, 'GET');
    }

    async deleteShippingAddress(id) {
        return this.request(`/shipping-address/${id}`, 'DELETE');
    }
}

const apiService = new ApiService();
export default apiService;
