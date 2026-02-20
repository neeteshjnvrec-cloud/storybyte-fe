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
    androidClientId: APP_CONFIG.GOOGLE_ANDROID_CLIENT_ID, // ✅ THIS WAS MISSING
    iosClientId: APP_CONFIG.GOOGLE_CLIENT_ID,
    offlineAccess: true,
    forceCodeForRefreshToken: true, // ✅ Fixes token issues on Android 11+
  });
  console.log('Google Sign-In configured successfully');
} catch (e) {
  console.log('Native Google Sign-In not available:', e);
}

export const signInWithGoogle = async (): Promise<string | null> => {
  try {
    console.log('signInWithGoogle called, Platform:', Platform.OS);

    if (Platform.OS === 'web') {
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
      if (!GoogleSignin) {
        throw new Error('Google Sign-In not available. Please use email/password to sign in.');
      }

      console.log('Checking Play Services...');
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true }); // ✅ Shows update dialog if needed

      // ✅ Sign out first to prevent cached account issues across devices
      try {
        await GoogleSignin.signOut();
      } catch (_) {}

      console.log('Signing in...');
      const userInfo = await GoogleSignin.signIn();
      console.log('User info received:', userInfo);

      console.log('Getting tokens...');
      const tokens = await GoogleSignin.getTokens();
      console.log('Tokens received');

      return tokens.idToken;
    }
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    if (error.code === 'SIGN_IN_CANCELLED') {
      console.log('User cancelled sign-in');
      return null;
    }
    throw error;
  }
};