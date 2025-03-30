/**
 * API Configuration
 * 
 * See README.md for instructions on how to find your local IP address and
 * configure the API URLs properly for both emulators and physical devices.
 */

// Development API URL (comment/uncomment as needed)
// const DEV_API_URL = 'http://localhost:3000/api';  // For emulators
const DEV_API_URL = 'http://localhost:3000/api'; // For physical devices

// Production API URL
const PROD_API_URL = 'http://192.168.0.138:3000/api';

export const API_URL = __DEV__ ? DEV_API_URL : PROD_API_URL;

// Export Stripe configuration
export const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;
