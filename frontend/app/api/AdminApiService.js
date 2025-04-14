import { BaseApiService } from './BaseApiService';

class AdminApiService extends BaseApiService {
    // Get all products with pagination
    async getProducts(page = 1) {
        return this.request('/admin/products', 'GET', null, {
            params: { page, limit: 5 }
        });
    }

    async getPopularProducts() {
        return this.request('/products/popular', 'GET', null, {
            params: { limit: 5 }
        });
    }

    // Get single product by ID
    async getProduct(id) {
        try {
            console.log('Fetching product with ID:', id);
            return this.request(`/admin/products/${id}`, 'GET');
        } catch (error) {
            console.error('Get Product Error:', error);
            throw this.handleError(error);
        }
    }

    // Add new product
    async addProduct(productData) {
        return this.request('/admin/products', 'POST', {
            idProductType: productData.idProductType,
            name: productData.name,
            description: productData.description,
            price: productData.price,
            status: productData.status || true
        });
    }

    // Update product details
    async updateProduct(id, productData) {
        try {
            console.log('Updating product:', { id, ...productData });

            const price = parseFloat(productData.price);
            if (isNaN(price)) {
                throw new Error('Precio inválido');
            }

            return this.request(`/admin/products/${id}`, 'PUT', {
                name: productData.name.trim(),
                description: productData.description.trim(),
                price: price,
                idProductType: productData.idProductType,
                status: productData.status
            });
        } catch (error) {
            console.error('Update Product Error:', error);
            throw this.handleError(error);
        }
    }

    // Toggle product status
    async toggleProductStatus(id) {
        return this.request(`/admin/products/${id}/status`, 'PATCH');
    }

    // Update product customization
    async updateProductCustomization(id, customizationData) {
        return this.request(`/admin/products/${id}/customization`, 'PUT', customizationData);
    }

    // Get product personalizations
    async getProductPersonalizations(productId) {
        return this.request(`/products/${productId}/personalizations`, 'GET');
    }

    // Update product personalization
    async updateProductPersonalization(productId, personalizationData) {
        return this.request(`/products/${productId}/personalization`, 'PUT', personalizationData);
    }

    // Toggle personalization status
    async togglePersonalizationStatus(productId, personalizationId, status) {
        return this.request(`/products/${productId}/personalization/${personalizationId}/status`, 'PATCH', {
            status
        });
    }

    // Get all active orders
    async getActiveOrders() {
        return this.request('/admin/orders/current', 'GET');
    }

    // Get all closed orders
    async getOrderHistory(date_from, date_to) {
        return this.request(`/admin/orders?date_from=${date_from}&date_to=${date_to}`, 'GET');
    }

    async getActiveOrderDetail(idOrder) {
        return this.request(`/admin/orders/${idOrder}`, 'GET')
    }

    async updateOrderStatus(idOrder, idOrderStatus) {
        return this.request(`/admin/order/${idOrder}`, 'PATCH', { idOrderStatus });
    }
}

// Export a single instance
const adminApiService = new AdminApiService();
export default adminApiService; 