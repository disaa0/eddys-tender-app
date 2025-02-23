import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/index';

export class BaseApiService {
    constructor() {
        this.baseURL = API_URL;
    }

    async getHeaders() {
        const token = await AsyncStorage.getItem('userToken');
        return {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
    }

    async request(endpoint, method = 'GET', body = null) {
        try {
            const headers = await this.getHeaders();
            const url = `${this.baseURL}${endpoint}`;

            const config = {
                method,
                headers,
                ...(body ? { body: JSON.stringify(body) } : {}),
            };

            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error en la petición');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }
} 