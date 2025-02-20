// You can change this in development to your local IP to test on physical devices
const DEV_API_URL = 'http://localhost:3000/api';
// const DEV_API_URL = 'http://192.168.1.100:3000/api'; // Example for physical device testing

const PROD_API_URL = 'https://your-production-api.com/api';

export const API_URL = __DEV__ ? DEV_API_URL : PROD_API_URL; 