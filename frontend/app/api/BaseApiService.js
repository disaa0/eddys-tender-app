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

    async request(endpoint, method = 'GET', body = null, adittionalHeaders = {}) {
        try {
            const baseHeaders = await this.getHeaders();
            const headers = { ...baseHeaders, ...adittionalHeaders };
            const url = `${this.baseURL}${endpoint}`;

            const config = {
                method,
                headers,
                ...(body ? { body: body instanceof FormData ? body : JSON.stringify(body) } : {}),
            };


            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                const error = new Error(data.message || 'Error en la petición');
                error.response = { data, status: response.status };
                throw error;
            }

            return data;
        } catch (error) {
            if (error.response) {
                throw error; // Re-throw if we already formatted the error
            }
            console.error('API Error:', error);
            throw error;
        }
    }
} 