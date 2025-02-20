// You can change this in development to your local IP to test on physical devices
// const DEV_API_URL = 'http://localhost:3000/api';
const DEV_API_URL = 'http://10.10.164.38:3000/api'; // Example for physical device testing

const PROD_API_URL = 'http://localhost:3000/api';

export const API_URL = __DEV__ ? DEV_API_URL : PROD_API_URL; 