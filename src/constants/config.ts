// API Configuration
export const API_CONFIG = {
  BASE_URL: 'http://localhost:3000/api/v1', // Local testing
  // BASE_URL: 'https://storybyte-be-production.up.railway.app/api/v1', // Production
  TIMEOUT: 60000,
};

// App Configuration
export const APP_CONFIG = {
  NAME: 'Story Teller',
  VERSION: '1.0.0',
  GOOGLE_CLIENT_ID: '147652281278-kdmfmk39vadq28fvc6lu6bffd0jjcuqr.apps.googleusercontent.com',
  GOOGLE_ANDROID_CLIENT_ID: '147652281278-qiicq6ubmbfa8rhkjs8uoucrpbdpq1q2.apps.googleusercontent.com', // TODO: Add Android Client ID from Google Cloud Console
};

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@story_teller:auth_token',
  USER_DATA: '@story_teller:user_data',
  LANGUAGE: '@story_teller:language',
  THEME: '@story_teller:theme',
};

// Audio Player Config
export const PLAYER_CONFIG = {
  UPDATE_INTERVAL: 5000, // Update progress every 5 seconds
  SEEK_INTERVAL: 15, // Seek forward/backward by 15 seconds
};
