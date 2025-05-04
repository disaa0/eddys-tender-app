import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/index';

// Create standalone service without extending BaseApiService to avoid dependency issues
class NotificationApiService {
  constructor() {
    this.baseURL = API_URL;
    this.endpoint = '/notifications';
  }
  
  async getHeaders() {
    const token = await AsyncStorage.getItem('userToken');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async request(endpoint, method = 'GET', body = null, additionalConfig = {}) {
    try {
        const baseHeaders = await this.getHeaders();
        const headers = { ...baseHeaders, ...additionalConfig.headers };
        const url = `${this.baseURL}${endpoint}`;

        console.log(`Making ${method} request to: ${url}`);
        
        const config = {
            method,
            headers,
            ...(body ? { body: body instanceof FormData ? body : JSON.stringify(body) } : {}),
        };

        const response = await fetch(url, config);

        let data;
        if (additionalConfig.responseType === 'blob') {
            data = await response.blob();
        } else if (additionalConfig.responseType === 'text') {
            data = await response.text();
        } else {
            // For empty responses, avoid trying to parse JSON
            const text = await response.text();
            data = text ? JSON.parse(text) : {};
        }

        if (!response.ok) {
            const error = new Error(data?.message || 'Error in request');
            error.response = { data, status: response.status };
            throw error;
        }

        return { data };
    } catch (error) {
        if (error.response) {
            throw error; // Re-throw if already formatted
        }
        console.error('API Error:', error);
        throw error;
    }
  }

  // Helper methods for HTTP requests
  async get(path, config = {}) {
    return this.request(`${this.endpoint}${path}`, 'GET', null, config);
  }

  async post(path, data = {}, config = {}) {
    return this.request(`${this.endpoint}${path}`, 'POST', data, config);
  }

  async put(path, data = {}, config = {}) {
    return this.request(`${this.endpoint}${path}`, 'PUT', data, config);
  }

  async patch(path, data = {}, config = {}) {
    return this.request(`${this.endpoint}${path}`, 'PATCH', data, config);
  }

  async delete(path, config = {}) {
    return this.request(`${this.endpoint}${path}`, 'DELETE', null, config);
  }
  
  /**
   * Register a push notification token with the server
   * @param {string} token - The Expo push notification token
   * @param {Object} deviceInfo - Information about the device
   * @returns {Promise} - Response from the server
   */
  async registerToken(token, deviceInfo = {}) {
    try {
      // Make sure we have a userToken before attempting to register
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        console.log('No user token available, skipping push token registration');
        return null;
      }
      
      console.log('Attempting to register push token:', token);
      const response = await this.post('/register', { token, deviceInfo });
      return response.data;
    } catch (error) {
      console.error('Error registering push token:', error);
      throw error;
    }
  }
  
  /**
   * Unregister a push notification token from the server
   * @param {string} token - The Expo push notification token to unregister
   * @returns {Promise} - Response from the server
   */
  async unregisterToken(token) {
    try {
      if (!token) {
        console.log('No token provided for unregistration');
        return null;
      }
      
      // Make sure we have a userToken before attempting to unregister
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        console.log('No user token available, skipping push token unregistration');
        return null;
      }
      
      console.log('Attempting to unregister push token:', token);
      const response = await this.post('/unregister', { token });
      return response.data;
    } catch (error) {
      console.error('Error unregistering push token:', error);
      throw error;
    }
  }

  /**
   * Send a test notification to the current user
   * @returns {Promise} - Response from the server
   */
  async sendTestNotification() {
    try {
      const response = await this.post('/test');
      return response.data;
    } catch (error) {
      console.error('Error sending test notification:', error);
      throw error;
    }
  }

  /**
   * Get all notifications for the current user
   * @returns {Promise} - Response from the server with notifications
   */
  async getUserNotifications() {
    try {
      const response = await this.get('/user');
      return response.data;
    } catch (error) {
      console.error('Error getting user notifications:', error);
      throw error;
    }
  }

  /**
   * Mark a notification as read
   * @param {number} notificationId - ID of the notification to mark as read
   * @returns {Promise} - Response from the server
   */
  async markNotificationAsRead(notificationId) {
    try {
      const response = await this.patch(`/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }
}

// Create and export a single instance
const notificationApiService = new NotificationApiService();
export default notificationApiService;
