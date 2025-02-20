import api from './ApiService'; // Asegúrate de que 'ApiService' esté configurado para realizar las solicitudes.

class UserService {
    // Método para obtener la información del usuario
    async getUserInfo() {
        try {
            const response = await api.get('/user/profile');
            // console.log(response);
            return response; // Deberías tener el endpoint adecuado para traer la información.
        } catch (error) {
            console.error('Error obteniendo la información del usuario:', error);
            throw error; // O maneja el error de manera más adecuada
        }
    }
}

export default new UserService();
