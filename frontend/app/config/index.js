/**
 * API Configuration
 *
 * API URLs are configured via environment variables.
 * See README.md for instructions on configuring the API URLs
 * properly for both emulators and physical devices.
 */

// Development API URL - fallback to localhost if env variable is not set
const DEV_API_URL = process.env.EXPO_PUBLIC_DEV_API_URL;

// Production API URL
const PROD_API_URL = process.env.EXPO_PUBLIC_PROD_API_URL;

export const API_URL = __DEV__ ? DEV_API_URL : PROD_API_URL;

// Export Stripe configuration
export const STRIPE_PUBLISHABLE_KEY =
  process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;
