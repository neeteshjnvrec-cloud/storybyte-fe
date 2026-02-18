import { useColorScheme } from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark' | 'system';

export const useTheme = () => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const saved = await AsyncStorage.getItem('@story_teller:theme');
      if (saved) setThemeMode(saved as ThemeMode);
    } catch (error) {
      console.error('Failed to load theme:', error);
    }
  };

  const changeTheme = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem('@story_teller:theme', mode);
      setThemeMode(mode);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  const isDark = themeMode === 'system' 
    ? systemColorScheme === 'dark' 
    : themeMode === 'dark';

  return { themeMode, changeTheme, isDark };
};

export const lightTheme = {
  background: '#ffffff',
  surface: '#f5f5f5',
  card: '#ffffff',
  text: '#000000',
  textSecondary: '#666666',
  primary: '#667eea',
  border: '#e0e0e0',
  gradient: ['#667eea', '#764ba2'],
};

export const darkTheme = {
  background: '#0a0a0a',
  surface: '#1a1a1a',
  card: '#1e1e1e',
  text: '#ffffff',
  textSecondary: '#8b9dc3',
  primary: '#667eea',
  border: '#333333',
  gradient: ['#667eea', '#764ba2'],
};
