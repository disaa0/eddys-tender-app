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

    async request(endpoint, method = 'GET', body = null, adittionalConfig = {}) {
        try {
            const baseHeaders = await this.getHeaders();
            const headers = { ...baseHeaders, ...adittionalConfig.headers };
            const url = `${this.baseURL}${endpoint}`;

            const config = {
                method,
                headers,
                ...(body ? { body: body instanceof FormData ? body : JSON.stringify(body) } : {}),
            };

            const response = await fetch(url, config);

            let data;
            if (adittionalConfig.responseType === 'blob') {
                data = await response.blob();
            } else if (adittionalConfig.responseType === 'text') {
                data = await response.text();
            } else {
                data = await response.json();
            }

            if (!response.ok) {
                const error = new Error(data?.message || 'Error en la petición');
                error.response = { data, status: response.status };
                throw error;
            }

            return data;
        } catch (error) {
            if (error.response) {
                throw error; // Re-throw if already formatted
            }
            console.error('API Error:', error);
            throw error;
        }
    }
} 