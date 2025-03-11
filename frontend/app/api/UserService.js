import api from './ApiService'; // Asegúrate de que 'ApiService' esté configurado para realizar las solicitudes.
import { BaseApiService } from './BaseApiService';

class UserService extends BaseApiService {
    // Método para obtener la información del usuario
    async getUserInfo() {
        try {
            const response = await api.getUserProfile();
            // console.log(response);
            return response; // Deberías tener el endpoint adecuado para traer la información.
        } catch (error) {
            console.error('Error obteniendo la información del usuario:', error);
            throw error; // O maneja el error de manera más adecuada
        }
    }
    async getProducts(page = 1) {
        try {
            const response = await this.request('/products', 'GET', null, {
                params: { page, limit: 5 }
            });
            return response?.data?.products;
        } catch (error) {
            console.error('Error obteniendo los productos:', error);
            throw error;
        }
    }
}

export default new UserService();
