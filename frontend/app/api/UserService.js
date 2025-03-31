import api from './ApiService'; // Asegúrate de que 'ApiService' esté configurado para realizar las solicitudes.

class UserService {
    // Método para obtener la información del usuario
    async getUserInfo() {
        try {
            const response = await api.getUserProfile();
            // console.log(response);
            return response; // Deberías tener el endpoint adecuado para traer la información.
        } catch (error) {
            if (error.response?.status === 401) {
                // Maneja el error de autenticación aquí, si es necesario
                console.warn('Token inválido o expirado. Usuario no autenticado.');
                throw error
            }

            console.error('Error obteniendo la información del usuario:', error);
            throw error; // O maneja el error de manera más adecuada
        }
    }
}

export default new UserService();
