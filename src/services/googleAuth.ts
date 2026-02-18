import * as WebBrowser from 'expo-web-browser';
import { APP_CONFIG } from '../constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

// Lazy load Google Sign-In (only available in native builds)
let GoogleSignin: any = null;
try {
  GoogleSignin = require('@react-native-google-signin/google-signin').GoogleSignin;
  GoogleSignin.configure({
    webClientId: APP_CONFIG.GOOGLE_CLIENT_ID,
    offlineAccess: true,
  });
} catch (e) {
  // Not available in Expo Go
  console.log('Native Google Sign-In not available');
}

export const signInWithGoogle = async (): Promise<string | null> => {
  try {
    if (Platform.OS === 'web') {
      // Web: redirect main window
      await AsyncStorage.setItem('google_auth_in_progress', 'true');
      const redirectUri = 'http://localhost:8081/';
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${APP_CONFIG.GOOGLE_CLIENT_ID}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=id_token` +
        `&scope=openid%20profile%20email` +
        `&nonce=${Math.random().toString(36)}`;
      window.location.href = authUrl;
      return null;
    } else {
      // iOS/Android: Use native Google Sign-In if available
      if (!GoogleSignin) {
        throw new Error('Google Sign-In requires a native build. Please build the app with "npx eas build" or use email/password to sign in.');
      }
      
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      
      // Get ID token
      const tokens = await GoogleSignin.getTokens();
      return tokens.idToken;
    }
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    if (error.code === 'SIGN_IN_CANCELLED') {
      return null; // User cancelled
    }
    throw error;
  }
};

