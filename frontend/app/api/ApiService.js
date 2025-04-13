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

    async getProducts(page = 1) {
        return this.request('/products', 'GET', null, {
            params: { page, limit: 6 }
        });
    }

    async getProductById(id) {
        return this.request(`/products/${id}`, 'GET');
    }

    async getProductImageById(id) {
        return this.request(`/products/${id}/image`, 'GET');
    }

    async getCartItems() {
        return this.request('/cart', 'GET');
    }

    async getCartTotal() {
        return this.request('/cart/total', 'GET');
    }

    async getCartQuantity() {
        return this.request('/cart/quantity', 'GET');
    }

    async addCartItem(idProduct, quantity = 1) {
        return this.request(`/cart/items/${idProduct}`, 'PUT', { idProduct, quantity });
    }

    async addOneToCartItem(idProduct) {
        return this.request(`/cart/items/addOneItem/${idProduct}`, 'PUT');
    }

    async createOrder(idPaymentType, idShipmentType, shipmentValue, idLocation,) {
        return this.request('/orders', 'POST', { idPaymentType, idShipmentType, idLocation, shipmentValue });
    }

    async getUserOrders() {
        return this.request('/orders', 'GET');
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

    async updateShippingAddress(id, street, houseNumber, postalCode, neighborhood) {
        return this.request(`/shipping-address/${id}`, 'PUT', { street, houseNumber, postalCode, neighborhood });
    }

    async getProductPersonalizations(idProduct) {
        return this.request(`/products/${idProduct}/user/personalizations`, 'GET');
    }

    async setProductPersonalizationsStatus(idProduct, idProductPersonalization, status) {
        return this.request(`/products/${idProduct}}/user/personalization/${idProductPersonalization}/status`, 'PATCH', { status });
    }

    async reorderUserOrder(idOrder) {
        return this.request(`/orders/${idOrder}`, 'PUT');
    }
}

const apiService = new ApiService();
export default apiService;
