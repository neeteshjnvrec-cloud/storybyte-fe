import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, Alert, ActivityIndicator, 
  ScrollView, TouchableOpacity, Platform, RefreshControl 
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Screens & Components
import { LoginScreen, SignupScreen, ForgotPasswordScreen, OnboardingScreen } from './PremiumAuth';
import { Logo, Loader, FloatingAudioPlayer, StarIcon, HeartIcon, ClockIcon, BookOpenIcon, HeadphonesIcon, CheckCircleIcon, Toast } from './src/components';
import { HomeScreen } from './src/screens/HomeScreen';
import { FavoritesScreen } from './src/screens/FavoritesScreen';

// Services & Config
import ApiService from './src/services/api';
import { signInWithGoogle } from './src/services/googleAuth';
import { API_CONFIG } from './src/constants/config';
import { StoryDetailScreen } from './src/screens/StoryDetailScreen';
import { useTheme, ThemeProvider, lightTheme, darkTheme } from './src/hooks/useTheme';
import { AudioPlayerProvider, useAudioPlayer } from './src/context/AudioPlayerContext';
import { trackAppOpened } from './src/utils/analytics';

// --- Types ---
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

const API_URL = API_CONFIG.BASE_URL;

// Setup axios interceptor
axios.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('@story_teller:auth_token');
    if (token && config.headers && !config.url?.includes('/auth/')) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

function AppContent() {
  // Navigation & UI State
  const [screen, setScreen] = useState<string>('loading'); // Start with loading state
  const [activeTab, setActiveTab] = useState<string>('home');
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingStories, setLoadingStories] = useState<boolean>(false);

  // Theme
  const { themeMode, changeTheme, isDark } = useTheme();
  const theme = isDark ? darkTheme : lightTheme;
  
  // Audio Player Toast
  const { toastVisible, toastMessage } = useAudioPlayer();
  const [localToastVisible, setLocalToastVisible] = useState(false);

  // Icon components
  const HomeIcon = ({ color }: { color: string }) => (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path d="M10.0693 2.81984L3.13929 8.36983C2.35929 8.98983 1.85929 10.2999 2.02929 11.2799L3.35929 19.2398C3.59929 20.6598 4.95928 21.8098 6.39928 21.8098H17.5993C19.0293 21.8098 20.3993 20.6498 20.6393 19.2398L21.9693 11.2799C22.1293 10.2999 21.6293 8.98983 20.8593 8.36983L13.9293 2.82985C12.8593 1.96985 11.1293 1.96984 10.0693 2.81984Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M12 15.5C13.3807 15.5 14.5 14.3807 14.5 13C14.5 11.6193 13.3807 10.5 12 10.5C10.6193 10.5 9.5 11.6193 9.5 13C9.5 14.3807 10.6193 15.5 12 15.5Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );

  const ProfileIcon = ({ color }: { color: string }) => (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M20.5899 22C20.5899 18.13 16.7399 15 11.9999 15C7.25991 15 3.40991 18.13 3.40991 22" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );

  const GenresIcon = ({ color }: { color: string }) => (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path d="M22 16.74V4.67C22 3.47 21.02 2.58 19.83 2.68H19.77C17.67 2.86 14.48 3.93 12.7 5.05L12.53 5.16C12.24 5.34 11.76 5.34 11.47 5.16L11.22 5.01C9.44 3.9 6.26 2.84 4.16 2.67C2.97 2.57 2 3.47 2 4.66V16.74C2 17.7 2.78 18.6 3.74 18.72L4.03 18.76C6.2 19.05 9.55 20.15 11.47 21.2L11.51 21.22C11.78 21.37 12.21 21.37 12.47 21.22C14.39 20.16 17.75 19.05 19.93 18.76L20.26 18.72C21.22 18.6 22 17.7 22 16.74Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M12 5.49V20.49" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );

  const FavoritesIcon = ({ color }: { color: string }) => (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path d="M12.62 20.81C12.28 20.93 11.72 20.93 11.38 20.81C8.48 19.82 2 15.69 2 8.69C2 5.6 4.49 3.1 7.56 3.1C9.38 3.1 10.99 3.98 12 5.34C13.01 3.98 14.63 3.1 16.44 3.1C19.51 3.1 22 5.6 22 8.69C22 15.69 15.52 19.82 12.62 20.81Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );

  const SunIcon = ({ color }: { color: string }) => (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <Path d="M12 2V4M12 20V22M4 12H2M6.31412 6.31412L4.8999 4.8999M17.6859 6.31412L19.1001 4.8999M6.31412 17.69L4.8999 19.1042M17.6859 17.69L19.1001 19.1042M22 12H20M17 12C17 14.7614 14.7614 17 12 17C9.23858 17 7 14.7614 7 12C7 9.23858 9.23858 7 12 7C14.7614 7 17 9.23858 17 12Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );

  const MoonIcon = ({ color }: { color: string }) => (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );

  const SystemIcon = ({ color }: { color: string }) => (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <Path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20V4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill={color}/>
    </Svg>
  );

  const styles = StyleSheet.create({
    homeContainer: { flex: 1, backgroundColor: theme.background },
    header: { flexDirection: 'row', alignItems: 'center', padding: 24, paddingTop: 60, backgroundColor: theme.surface, gap: 8 },
    headerTitle: { fontSize: 24, fontWeight: '700', color: theme.text },
    tabBar: { flexDirection: 'row', backgroundColor: theme.surface, borderTopWidth: 1, borderTopColor: theme.border, paddingBottom: 25 },
    tab: { flex: 1, alignItems: 'center', paddingVertical: 10 },
    tabIcon: { fontSize: 28, color: theme.textSecondary },
    tabIconActive: { color: '#667eea' },
    tabSubLabel: { fontSize: 10, color: theme.textSecondary, marginTop: 2 },
    tabLabelActive: { color: '#667eea' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    whiteText: { color: theme.text },
    profileContent: { padding: 24, flexGrow: 1 },
    profileHeader: { alignItems: 'center', marginBottom: 32 },
    avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#667eea', justifyContent: 'center', alignItems: 'center' },
    avatarText: { fontSize: 32, fontWeight: '700', color: '#fff' },
    profileName: { fontSize: 24, fontWeight: '700', color: theme.text, marginTop: 16 },
    profileEmail: { color: theme.textSecondary, marginTop: 4 },
    profileTabs: { flexDirection: 'row', marginBottom: 20, gap: 8 },
    profileTab: { flex: 1, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, backgroundColor: theme.card, alignItems: 'center' },
    profileTabActive: { backgroundColor: '#667eea' },
    profileTabText: { color: theme.textSecondary, fontSize: 12, fontWeight: '600' },
    profileTabTextActive: { color: '#fff' },
    listContainer: { marginBottom: 20 },
    historyItem: { borderRadius: 12, overflow: 'hidden', marginBottom: 12 },
    historyGradient: { padding: 16 },
    historyHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    historyIcon: { marginRight: 12 },
    historyInfo: { flex: 1 },
    historyStatus: { fontSize: 16, fontWeight: '600', color: theme.text, marginBottom: 4 },
    historyDate: { fontSize: 13, color: theme.textSecondary },
    listItem: { backgroundColor: theme.card, borderRadius: 12, padding: 16, marginBottom: 12 },
    listTitle: { fontSize: 16, fontWeight: '600', color: theme.text, marginBottom: 4 },
    listSubtitle: { fontSize: 14, color: theme.textSecondary },
    progressItem: { backgroundColor: theme.card, borderRadius: 12, padding: 16, marginBottom: 12 },
    progressBar: { height: 6, backgroundColor: theme.border, borderRadius: 3, marginVertical: 8, overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: '#667eea' },
    progressText: { fontSize: 12, color: theme.textSecondary, textAlign: 'right' },
    preferencesContainer: { backgroundColor: theme.card, borderRadius: 12, padding: 20, marginBottom: 20 },
    preferenceTitle: { fontSize: 18, fontWeight: '700', color: theme.text, marginBottom: 16 },
    preferenceText: { fontSize: 14, color: theme.textSecondary, lineHeight: 20 },
    themeOptions: { flexDirection: 'row', gap: 12 },
    themeOption: { flex: 1, backgroundColor: theme.surface, borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
    themeOptionActive: { borderColor: '#667eea', backgroundColor: '#667eea20' },
    themeIcon: { marginBottom: 8 },
    themeText: { fontSize: 14, color: theme.textSecondary, fontWeight: '600' },
    themeTextActive: { color: theme.text },
    legalItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: theme.surface, borderRadius: 10, padding: 16, marginTop: 10 },
    legalItemText: { fontSize: 15, color: theme.text, fontWeight: '500' },
    legalItemArrow: { fontSize: 24, color: theme.textSecondary },
    emptyText: { fontSize: 16, color: theme.textSecondary, textAlign: 'center', marginVertical: 40 },
    statsContainer: { marginBottom: 24 },
    statsRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
    statCard: { flex: 1, borderRadius: 10, overflow: 'hidden' },
    statGradient: { padding: 10, alignItems: 'center' },
    statIcon: { marginBottom: 4, alignItems: 'center', justifyContent: 'center' },
    statValue: { fontSize: 18, fontWeight: '700', color: isDark ? '#fff' : '#1a1a1a', marginBottom: 2 },
    statLabel: { color: theme.textSecondary, fontSize: 10, textAlign: 'center' },
    logoutButton: { backgroundColor: '#f87171', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 20 },
    logoutButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
    genresContent: { padding: 24, paddingBottom: 100 },
    sectionTitle: { fontSize: 24, fontWeight: '700', color: theme.text, marginBottom: 20 },
    loadButton: { backgroundColor: '#667eea', borderRadius: 12, padding: 16, alignItems: 'center' },
    loadButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
    backButton: { marginBottom: 16 },
    backButtonText: { color: '#667eea', fontSize: 16, fontWeight: '600' },
    premiumCard: { marginBottom: 16, borderRadius: 20, overflow: 'hidden', backgroundColor: theme.card },
    cardGradient: { padding: 16, flexDirection: 'row' },
    accentBar: { width: 4, borderRadius: 2, marginRight: 12 },
    cardContent: { flex: 1 },
    premiumTitle: { fontSize: 18, fontWeight: '700', color: theme.text, marginBottom: 8 },
    premiumDesc: { color: theme.textSecondary, marginVertical: 8, lineHeight: 18, fontSize: 14 },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 },
    statGroup: { flexDirection: 'row', alignItems: 'center' },
    statText: { color: theme.textSecondary, fontSize: 12 },
    readMore: { fontWeight: '700', fontSize: 14 },
    categoryCount: { color: theme.textSecondary, fontSize: 14, marginTop: 4 },
    emptyState: { 
      alignItems: 'center', 
      justifyContent: 'center', 
      paddingVertical: 60, 
      paddingHorizontal: 32 
    },
    emptyIcon: { marginBottom: 16, alignItems: 'center', justifyContent: 'center' },
    emptyTitle: { 
      fontSize: 24, 
      fontWeight: '700', 
      color: theme.text, 
      marginBottom: 12 
    },
    emptyMessage: { 
      fontSize: 16, 
      color: theme.textSecondary, 
      textAlign: 'center', 
      lineHeight: 24 
    }
  });

  // Auth & User State
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [resetCode, setResetCode] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [forgotStep, setForgotStep] = useState<number>(1);
  const [tempToken, setTempToken] = useState<string>('');
  const [user, setUser] = useState<User | null>(null);
  const [userStats, setUserStats] = useState<any>(null);
  const [profileTab, setProfileTab] = useState<'stats' | 'history' | 'progress' | 'preferences'>('stats');
  const [userHistory, setUserHistory] = useState<any[]>([]);
  const [userProgress, setUserProgress] = useState<any[]>([]);
  
  // Story Data State
  const [stories, setStories] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [selectedStory, setSelectedStory] = useState<any>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<'all' | 'en' | 'hi'>('all');
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryStories, setCategoryStories] = useState<any[]>([]);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingGenres, setLoadingGenres] = useState(false);
  const [loadingCategory, setLoadingCategory] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(false);

  // --- Effects ---

  // Check for stored auth token on app start
  useEffect(() => {
    trackAppOpened();
    checkStoredAuth();
  }, []);

  const checkStoredAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('@story_teller:auth_token');
      if (token) {
        console.log('Found stored auth token, fetching user profile...');
        setLoading(true);
        try {
          const response = await ApiService.getProfile();
          console.log('Profile response:', JSON.stringify(response, null, 2));
          // API returns user object directly, not wrapped
          const userData = response.user || response;
          console.log('User data:', userData);
          setUser(userData);
          setScreen('home');
          loadStories();
          console.log('Auto-login successful, user set to:', userData);
        } catch (error) {
          console.error('Auto-login failed, clearing token:', error);
          await AsyncStorage.removeItem('@story_teller:auth_token');
          setScreen('onboarding');
        } finally {
          setLoading(false);
        }
      } else {
        setScreen('onboarding');
      }
    } catch (error) {
      console.error('Error checking stored auth:', error);
      setScreen('onboarding');
    }
  };

  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const checkGoogleAuth = async () => {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const idToken = params.get('id_token');
        
        if (idToken) {
          setLoading(true);
          try {
            const response = await ApiService.googleAuth(idToken);
            setUser(response.user);
            setScreen('home');
            loadStories();
          } catch (error) {
            Alert.alert('Error', 'Google sign-in failed');
          } finally {
            setLoading(false);
          }
        }
      };
      checkGoogleAuth();
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'profile' && user) {
      // Load all profile data once when first entering profile
      if (!userStats) loadUserStats(false);
      if (userHistory.length === 0) loadUserHistory(false);
      if (userProgress.length === 0) loadUserProgress(false);
    }
  }, [activeTab, user]);

  const loadUserStats = async (forceRefresh = false) => {
    // Skip if already loaded and not forcing refresh
    if (!forceRefresh && userStats) {
      console.log('Using cached stats');
      return;
    }
    
    console.log('Loading stats, forceRefresh:', forceRefresh);
    setLoadingStats(true);
    try {
      const response = await ApiService.getStats();
      console.log('Stats API response:', JSON.stringify(response, null, 2));
      // API returns { stats: { ... } }
      const stats = response.stats || response;
      console.log('Setting userStats to:', JSON.stringify(stats, null, 2));
      setUserStats(stats);
    } catch (error) {
      console.error('Failed to load stats:', error);
      setUserStats(null); // Reset on error
    } finally {
      setLoadingStats(false);
      console.log('Stats loading complete');
    }
  };

  const loadUserHistory = async (forceRefresh = false) => {
    // Skip if already loaded and not forcing refresh
    if (!forceRefresh && userHistory.length > 0) {
      console.log('Using cached history');
      return;
    }
    setLoadingHistory(true);
    try {
      const response = await ApiService.getHistory();
      console.log('History response:', response);
      setUserHistory(response.history || []);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const loadUserProgress = async (forceRefresh = false) => {
    // Skip if already loaded and not forcing refresh
    if (!forceRefresh && userProgress.length > 0) {
      console.log('Using cached progress, count:', userProgress.length);
      return;
    }
    
    console.log('Loading progress, forceRefresh:', forceRefresh, 'current length:', userProgress.length);
    setLoadingProgress(true);
    try {
      const response = await axios.get(`${API_URL}/user/progress`);
      const progressData = response.data.progress || [];
      console.log('Progress API returned:', progressData.length, 'items');
      setUserProgress(progressData);
    } catch (error) {
      console.error('Failed to load progress:', error);
      setUserProgress([]); // Set empty array on error
    } finally {
      setLoadingProgress(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/categories`);
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadGenreCategories = async (genre: string) => {
    setLoadingGenres(true);
    try {
      const response = await axios.get(`${API_URL}/categories`);
      const allCategories = response.data.categories || [];
      // Filter categories by genre (assuming categories have genre field)
      const genreCategories = allCategories.filter((cat: any) => 
        cat.category.toLowerCase().includes(genre.toLowerCase())
      );
      setCategories(genreCategories);
      setSelectedGenre(genre);
    } catch (error) {
      console.error('Failed to load genre categories:', error);
    } finally {
      setLoadingGenres(false);
    }
  };

  const loadCategoryStories = async (category: string) => {
    setLoadingCategory(true);
    try {
      const response = await axios.get(`${API_URL}/categories/${category}`, {
        params: { limit: 100 }
      });
      setCategoryStories(response.data.stories || []);
      setSelectedCategory(category);
    } catch (error) {
      console.error('Failed to load category stories:', error);
    } finally {
      setLoadingCategory(false);
    }
  };

  // --- Handlers ---

  const loadStories = async (pageNum = 1, forceRefresh = false) => {
    // Skip if already have stories and not forcing refresh
    if (!forceRefresh && pageNum === 1 && stories.length > 0) {
      console.log('Using cached stories, skipping API call');
      return;
    }
    
    if (pageNum === 1) {
      setLoadingStories(true);
    } else {
      setLoadingMore(true);
    }
    try {
      const limit = 15;
      const skip = (pageNum - 1) * limit;
      const response = await axios.get(`${API_URL}/stories`, {
        params: { limit, skip }
      });
      const newStories = response.data.stories || [];
      console.log(`Page ${pageNum}: Loaded ${newStories.length} stories, skip=${skip}`);
      
      if (pageNum === 1) {
        setStories(newStories);
        console.log(`Set ${newStories.length} stories for page 1`);
      } else {
        // Filter out duplicates
        setStories(prev => {
          const existingIds = new Set(prev.map((s: { _id?: string; id?: string }) => s._id || s.id));
          const uniqueNew = newStories.filter((s: { _id?: string; id?: string }) => !existingIds.has(s._id || s.id));
          console.log(`Added ${uniqueNew.length} unique stories out of ${newStories.length}`);
          return [...prev, ...uniqueNew];
        });
      }
      
      setHasMore(newStories.length === limit);
      setPage(pageNum);
    } catch (error) {
      console.error('Story load error:', error);
    } finally {
      setLoadingStories(false);
      setLoadingMore(false);
    }
  };

  const loadMoreStories = () => {
    console.log('loadMoreStories called', { loadingMore, hasMore, page });
    if (!loadingMore && hasMore) {
      console.log('Loading page', page + 1);
      loadStories(page + 1);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert('Error', 'Please enter email and password');
    if (!email.includes('@')) return Alert.alert('Error', 'Please enter a valid email address');
    if (password.length < 8) return Alert.alert('Error', 'Password must be at least 8 characters');
    
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      await AsyncStorage.setItem('@story_teller:auth_token', response.data.token);
      setUser(response.data.user);
      setScreen('home');
      loadStories();
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Invalid email or password';
      Alert.alert('Login Failed', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!name || !email || !password) return Alert.alert('Error', 'Please fill in all fields');
    if (name.length < 2) return Alert.alert('Error', 'Name must be at least 2 characters');
    if (!email.includes('@')) return Alert.alert('Error', 'Please enter a valid email address');
    if (password.length < 8) return Alert.alert('Error', 'Password must be at least 8 characters');
    
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/signup`, { email, password, name });
      await AsyncStorage.setItem('@story_teller:auth_token', response.data.token);
      setUser(response.data.user);
      setScreen('home');
      loadStories();
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Signup failed. Please try again';
      Alert.alert('Signup Failed', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      console.log('Starting Google Sign-In...');
      const idToken = await signInWithGoogle();
      
      if (!idToken) {
        console.log('Google Sign-In cancelled or failed');
        setLoading(false);
        return;
      }

      console.log('Got ID token, authenticating with backend...');
      const response = await ApiService.googleAuth(idToken);
      
      await AsyncStorage.setItem('@story_teller:auth_token', response.token);
      setUser(response.user);
      setScreen('home');
      loadStories();
      console.log('Google Sign-In successful');
    } catch (error: any) {
      console.error('Google Sign-In error:', error);
      Alert.alert('Google Sign-In Failed', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('@story_teller:auth_token');
            setUser(null);
            setScreen('login');
          }
        }
      ]
    );
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    setLoading(true);
    try {
      await ApiService.forgotPassword(email);
      Alert.alert('Success', 'Reset code sent to your email');
      setForgotStep(2);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to send reset code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!resetCode) {
      Alert.alert('Error', 'Please enter the reset code');
      return;
    }
    setLoading(true);
    try {
      const response = await ApiService.verifyResetCode(email, resetCode);
      setTempToken(response.tempToken);
      Alert.alert('Success', 'Code verified');
      setForgotStep(3);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword) {
      Alert.alert('Error', 'Please enter a new password');
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      await ApiService.resetPassword(tempToken, newPassword);
      Alert.alert('Success', 'Password reset successfully', [
        { text: 'OK', onPress: () => {
          setForgotStep(1);
          setResetCode('');
          setNewPassword('');
          setTempToken('');
          setScreen('login');
        }}
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  // --- Main Render Logic ---

  // Detail Screen
  if (screen === 'detail' && selectedStory) {
    return (
      <>
        <StoryDetailScreen 
          story={selectedStory} 
          onBack={async () => {
            // Force refresh stories to get updated ratings/plays
            await loadStories(1, true);
            setScreen('home');
          }}
          onFavoriteToggle={(storyId: string, isFavorite: boolean) => {
            if (isFavorite) {
              // Add to favorites if not already there
              if (!favorites.find((f: any) => (f._id || f.id) === storyId)) {
                setFavorites([...favorites, selectedStory]);
              }
            } else {
              // Remove from favorites
              setFavorites(favorites.filter((f: any) => (f._id || f.id) !== storyId));
            }
          }}
        />
        <FloatingAudioPlayer key={`audio-player-${themeMode}`} />
      <Toast 
        message={toastMessage} 
        visible={toastVisible} 
        onHide={() => setLocalToastVisible(false)} 
      />
      </>
    );
  }

  if (screen === 'home') {
    return (
      <>
      <View style={[styles.homeContainer, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
          <Logo size={35} variant="icon" />
          <Text style={styles.headerTitle}>StoryByte</Text>
        </View>

        {activeTab === 'home' ? (
          loadingStories ? (
            <Loader message="Loading stories..." />
          ) : (
            <HomeScreen 
            stories={stories}
            setSelectedStory={(story: any) => {
               console.log('setSelectedStory called with:', story.title);
               setSelectedStory(story);
               setScreen('detail');
            }}
            setScreen={setScreen}
            selectedLanguage={selectedLanguage}
            setSelectedLanguage={setSelectedLanguage}
            loadingStories={loadingStories}
            onLoadMore={loadMoreStories}
            hasMore={hasMore}
            loadingMore={loadingMore}
          />
          )
        ) : activeTab === 'genres' ? (
          loadingGenres || loadingCategory ? (
            <Loader message={loadingGenres ? "Loading genres..." : "Loading stories..."} />
          ) : (
          <ScrollView contentContainerStyle={styles.genresContent}>
            {selectedCategory ? (
              <>
                <TouchableOpacity 
                  style={styles.backButton} 
                  onPress={() => {
                    setSelectedCategory(null);
                    setCategoryStories([]);
                  }}
                >
                  <Text style={styles.backButtonText}>← Back to Categories</Text>
                </TouchableOpacity>
                <Text style={styles.sectionTitle}>{selectedCategory}</Text>
                {categoryStories.map((story: any, index: number) => {
                  const colors = ['#667eea', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b'];
                  const cardColor = colors[index % colors.length];
                  return (
                    <TouchableOpacity 
                      key={story._id || index} 
                      style={styles.premiumCard}
                      onPress={() => {
                        setSelectedStory(story);
                        setScreen('detail');
                      }}
                      activeOpacity={0.9}
                    >
                      <LinearGradient
                        colors={[cardColor + '30', 'rgba(255,255,255,0.05)']}
                        start={{ x: 0, y: 0 }} 
                        end={{ x: 1, y: 1 }}
                        style={styles.cardGradient}
                      >
                        <View style={[styles.accentBar, { backgroundColor: cardColor }]} />
                        <View style={styles.cardContent}>
                          <Text style={styles.premiumTitle} numberOfLines={1}>{story.title}</Text>
                          <Text style={styles.premiumDesc} numberOfLines={2}>{story.description}</Text>
                          <View style={styles.cardFooter}>
                            <View style={styles.statGroup}>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <StarIcon color="#f59e0b" size={14} filled />
                                <Text style={styles.statText}>{story.averageRating?.toFixed(1) || '0.0'}</Text>
                              </View>
                              <Text style={[styles.statText, { marginLeft: 12 }]}>▶ {story.plays || 0}</Text>
                            </View>
                            <Text style={[styles.readMore, { color: cardColor }]}>Listen Now →</Text>
                          </View>
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  );
                })}
              </>
            ) : selectedGenre ? (
              <>
                <TouchableOpacity 
                  style={styles.backButton} 
                  onPress={() => {
                    setSelectedGenre(null);
                    setCategories([]);
                  }}
                >
                  <Text style={styles.backButtonText}>← Back to Genres</Text>
                </TouchableOpacity>
                <Text style={styles.sectionTitle}>{selectedGenre}</Text>
                {categories.length === 0 ? (
                  <View style={styles.emptyState}>
                    <View style={styles.emptyIcon}>
                      <Svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                        <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#f59e0b"/>
                      </Svg>
                    </View>
                    <Text style={styles.emptyTitle}>Coming Soon!</Text>
                    <Text style={styles.emptyMessage}>
                      We're crafting amazing {selectedGenre.toLowerCase()} stories for you.{'\n'}
                      Stay tuned for something magical!
                    </Text>
                  </View>
                ) : (
                  categories.map((cat: any, index: number) => {
                    const colors = ['#667eea', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b'];
                    const cardColor = colors[index % colors.length];
                    return (
                      <TouchableOpacity 
                        key={index} 
                        style={styles.premiumCard}
                        onPress={() => loadCategoryStories(cat.category)}
                        activeOpacity={0.9}
                      >
                        <LinearGradient
                          colors={[cardColor + '30', 'rgba(255,255,255,0.05)']}
                          start={{ x: 0, y: 0 }} 
                          end={{ x: 1, y: 1 }}
                          style={styles.cardGradient}
                        >
                          <View style={[styles.accentBar, { backgroundColor: cardColor }]} />
                          <View style={styles.cardContent}>
                            <Text style={styles.premiumTitle}>{cat.category}</Text>
                            <Text style={styles.categoryCount}>{cat.count} stories available</Text>
                            <Text style={[styles.readMore, { color: cardColor, marginTop: 8 }]}>Browse →</Text>
                          </View>
                        </LinearGradient>
                      </TouchableOpacity>
                    );
                  })
                )}
              </>
            ) : (
              <>
                <Text style={styles.sectionTitle}>Browse by Genre</Text>
                {['Romance', 'Horror', 'Mystery', 'Fantasy', 'Drama'].map((genre, index) => {
                  const colors = ['#667eea', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b'];
                  const cardColor = colors[index % colors.length];
                  return (
                    <TouchableOpacity 
                      key={genre} 
                      style={styles.premiumCard}
                      onPress={() => loadGenreCategories(genre)}
                      activeOpacity={0.9}
                    >
                      <LinearGradient
                        colors={[cardColor + '30', 'rgba(255,255,255,0.05)']}
                        start={{ x: 0, y: 0 }} 
                        end={{ x: 1, y: 1 }}
                        style={styles.cardGradient}
                      >
                        <View style={[styles.accentBar, { backgroundColor: cardColor }]} />
                        <View style={styles.cardContent}>
                          <Text style={styles.premiumTitle}>{genre}</Text>
                          <Text style={[styles.readMore, { color: cardColor, marginTop: 8 }]}>Explore →</Text>
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  );
                })}
              </>
            )}
          </ScrollView>
          )
        ) : activeTab === 'favorites' ? (
          <FavoritesScreen 
            favorites={favorites}
            setFavorites={setFavorites}
            navigation={{ navigate: (screen: string, params: any) => {
              if (screen === 'StoryDetail') {
                setSelectedStory(params.story);
                setScreen('detail');
              }
            }}} 
          />
        ) : activeTab === 'profile' ? (
          <ScrollView 
            contentContainerStyle={styles.profileContent}
            refreshControl={
              <RefreshControl
                refreshing={
                  profileTab === 'stats' ? loadingStats :
                  profileTab === 'history' ? loadingHistory :
                  profileTab === 'progress' ? loadingProgress : false
                }
                onRefresh={() => {
                  if (profileTab === 'stats') loadUserStats(true);
                  else if (profileTab === 'history') loadUserHistory(true);
                  else if (profileTab === 'progress') loadUserProgress(true);
                }}
                tintColor={theme.text}
              />
            }
          >
            <View style={styles.profileHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text>
              </View>
              <Text style={styles.profileName}>{user?.name || 'Guest'}</Text>
              <Text style={styles.profileEmail}>{user?.email}</Text>
            </View>

            <View style={styles.profileTabs}>
              {['stats', 'history', 'progress', 'preferences'].map((tab) => (
                <TouchableOpacity
                  key={tab}
                  style={[styles.profileTab, profileTab === tab && styles.profileTabActive]}
                  onPress={() => {
                    setProfileTab(tab as any);
                  }}
                >
                  <Text style={[styles.profileTabText, profileTab === tab && styles.profileTabTextActive]}>
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {loadingStats && profileTab === 'stats' ? (
              <Loader message="Loading stats..." />
            ) : loadingHistory && profileTab === 'history' ? (
              <Loader message="Loading history..." />
            ) : loadingProgress && profileTab === 'progress' ? (
              <Loader message="Loading progress..." />
            ) : profileTab === 'stats' && userStats ? (
              <View style={styles.statsContainer}>
                <View style={styles.statsRow}>
                  <View style={styles.statCard}>
                    <LinearGradient
                      colors={isDark ? ['#667eea30', 'rgba(255,255,255,0.05)'] : ['#667eea40', 'rgba(102,126,234,0.1)']}
                      start={{ x: 0, y: 0 }} 
                      end={{ x: 1, y: 1 }}
                      style={styles.statGradient}
                    >
                      <View style={styles.statIcon}>
                        <ClockIcon color="#667eea" size={24} />
                      </View>
                      <Text style={styles.statValue}>{Math.floor((userStats.totalListeningTime || 0) / 60)}h {(userStats.totalListeningTime || 0) % 60}m</Text>
                      <Text style={styles.statLabel}>Listen Time</Text>
                    </LinearGradient>
                  </View>
                  <View style={styles.statCard}>
                    <LinearGradient
                      colors={isDark ? ['#ec489930', 'rgba(255,255,255,0.05)'] : ['#ec489940', 'rgba(236,72,153,0.1)']}
                      start={{ x: 0, y: 0 }} 
                      end={{ x: 1, y: 1 }}
                      style={styles.statGradient}
                    >
                      <View style={styles.statIcon}>
                        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <Path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <Path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </Svg>
                      </View>
                      <Text style={styles.statValue}>{userStats.totalStories || 0}</Text>
                      <Text style={styles.statLabel}>Stories</Text>
                    </LinearGradient>
                  </View>
                </View>
                <View style={styles.statsRow}>
                  <View style={styles.statCard}>
                    <LinearGradient
                      colors={isDark ? ['#8b5cf630', 'rgba(255,255,255,0.05)'] : ['#8b5cf640', 'rgba(139,92,246,0.1)']}
                      start={{ x: 0, y: 0 }} 
                      end={{ x: 1, y: 1 }}
                      style={styles.statGradient}
                    >
                      <View style={styles.statIcon}>
                        <HeartIcon color="#8b5cf6" size={24} filled />
                      </View>
                      <Text style={styles.statValue}>{userStats.favoriteStories || 0}</Text>
                      <Text style={styles.statLabel}>Favorites</Text>
                    </LinearGradient>
                  </View>
                  <View style={styles.statCard}>
                    <LinearGradient
                      colors={isDark ? ['#10b98130', 'rgba(255,255,255,0.05)'] : ['#10b98140', 'rgba(16,185,129,0.1)']}
                      start={{ x: 0, y: 0 }} 
                      end={{ x: 1, y: 1 }}
                      style={styles.statGradient}
                    >
                      <View style={styles.statIcon}>
                        <CheckCircleIcon color="#10b981" size={24} />
                      </View>
                      <Text style={styles.statValue}>{userStats.completedStories || 0}</Text>
                      <Text style={styles.statLabel}>Completed</Text>
                    </LinearGradient>
                  </View>
                </View>
                <View style={styles.statsRow}>
                  <View style={styles.statCard}>
                    <LinearGradient
                      colors={isDark ? ['#f59e0b30', 'rgba(255,255,255,0.05)'] : ['#f59e0b40', 'rgba(245,158,11,0.1)']}
                      start={{ x: 0, y: 0 }} 
                      end={{ x: 1, y: 1 }}
                      style={styles.statGradient}
                    >
                      <View style={styles.statIcon}>
                        <BookOpenIcon color="#f59e0b" size={24} />
                      </View>
                      <Text style={styles.statValue}>{userStats.inProgressStories || 0}</Text>
                      <Text style={styles.statLabel}>In Progress</Text>
                    </LinearGradient>
                  </View>
                  <View style={styles.statCard}>
                    <LinearGradient
                      colors={isDark ? ['#667eea30', 'rgba(255,255,255,0.05)'] : ['#667eea40', 'rgba(102,126,234,0.1)']}
                      start={{ x: 0, y: 0 }} 
                      end={{ x: 1, y: 1 }}
                      style={styles.statGradient}
                    >
                      <View style={styles.statIcon}>
                        <HeadphonesIcon color="#10b981" size={24} />
                      </View>
                      <Text style={styles.statValue}>{userStats.totalPlays || 0}</Text>
                      <Text style={styles.statLabel}>Total Plays</Text>
                    </LinearGradient>
                  </View>
                </View>
              </View>
            ) : profileTab === 'stats' && !userStats ? (
              <Text style={styles.emptyText}>No stats available</Text>
            ) : profileTab === 'history' ? (
              <View style={styles.listContainer}>
                {userHistory.length === 0 ? (
                  <Text style={styles.emptyText}>No listening history yet</Text>
                ) : (
                  userHistory.map((item: any, index: number) => (
                    <View key={index} style={styles.historyItem}>
                      <LinearGradient
                        colors={isDark ? ['#667eea20', 'rgba(255,255,255,0.05)'] : ['#667eea30', 'rgba(102,126,234,0.1)']}
                        start={{ x: 0, y: 0 }} 
                        end={{ x: 1, y: 1 }}
                        style={styles.historyGradient}
                      >
                        <View style={styles.historyHeader}>
                          <View style={styles.historyIcon}>
                            {item.completed ? <CheckCircleIcon color="#10b981" size={20} /> : <HeadphonesIcon color="#667eea" size={20} />}
                          </View>
                          <View style={styles.historyInfo}>
                            <Text style={styles.historyStatus}>
                              {item.completed ? 'Completed' : 'Played'}
                            </Text>
                            <Text style={styles.historyDate}>
                              {new Date(item.lastPlayed).toLocaleDateString()} • {item.playCount} plays
                            </Text>
                          </View>
                        </View>
                        {item.progress > 0 && !item.completed && (
                          <View style={styles.progressBar}>
                            <View style={[styles.progressFill, { width: `${item.progress}%` }]} />
                          </View>
                        )}
                      </LinearGradient>
                    </View>
                  ))
                )}
              </View>
            ) : profileTab === 'progress' ? (
              <View style={styles.listContainer}>
                {userProgress.length === 0 ? (
                  <Text style={styles.emptyText}>No progress tracked yet</Text>
                ) : (
                  userProgress.map((item: any, index: number) => (
                    <View key={index} style={styles.progressItem}>
                      <Text style={styles.listTitle}>{item.story?.title || 'Unknown'}</Text>
                      <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${item.progress || 0}%` }]} />
                      </View>
                      <Text style={styles.progressText}>{Math.round(item.progress || 0)}% complete</Text>
                    </View>
                  ))
                )}
              </View>
            ) : profileTab === 'preferences' ? (
              <View style={styles.preferencesContainer}>
                <Text style={styles.preferenceTitle}>Theme</Text>
                <View style={styles.themeOptions}>
                  {(['light', 'dark', 'system'] as const).map((mode) => (
                    <TouchableOpacity
                      key={mode}
                      style={[styles.themeOption, themeMode === mode && styles.themeOptionActive]}
                      onPress={() => changeTheme(mode)}
                    >
                      <View style={styles.themeIcon}>
                        {mode === 'light' ? (
                          <SunIcon color={themeMode === mode ? '#667eea' : theme.textSecondary} />
                        ) : mode === 'dark' ? (
                          <MoonIcon color={themeMode === mode ? '#667eea' : theme.textSecondary} />
                        ) : (
                          <SystemIcon color={themeMode === mode ? '#667eea' : theme.textSecondary} />
                        )}
                      </View>
                      <Text style={[styles.themeText, themeMode === mode && styles.themeTextActive]}>
                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={[styles.preferenceTitle, { marginTop: 30 }]}>Legal</Text>
                <TouchableOpacity 
                  style={styles.legalItem}
                  onPress={() => WebBrowser.openBrowserAsync(`${API_CONFIG.BACKEND_URL}/legal/about`)}
                >
                  <Text style={styles.legalItemText}>About</Text>
                  <Text style={styles.legalItemArrow}>›</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.legalItem}
                  onPress={() => WebBrowser.openBrowserAsync(`${API_CONFIG.BACKEND_URL}/legal/privacy`)}
                >
                  <Text style={styles.legalItemText}>Privacy Policy</Text>
                  <Text style={styles.legalItemArrow}>›</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.legalItem}
                  onPress={() => WebBrowser.openBrowserAsync(`${API_CONFIG.BACKEND_URL}/legal/terms`)}
                >
                  <Text style={styles.legalItemText}>Terms & Conditions</Text>
                  <Text style={styles.legalItemArrow}>›</Text>
                </TouchableOpacity>

                <Text style={[styles.preferenceTitle, { marginTop: 30 }]}>Account</Text>
                <TouchableOpacity 
                  style={[styles.legalItem, { backgroundColor: '#fee' }]}
                  onPress={() => {
                    Alert.alert(
                      'Delete Account',
                      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { 
                          text: 'Delete', 
                          style: 'destructive',
                          onPress: async () => {
                            try {
                              const token = await AsyncStorage.getItem('@story_teller:auth_token');
                              if (!token) {
                                Alert.alert('Error', 'Not authenticated');
                                return;
                              }
                              await axios.delete(`${API_CONFIG.BASE_URL}/user/account`, {
                                headers: { Authorization: `Bearer ${token}` }
                              });
                              handleLogout();
                            } catch (error) {
                              console.error('Delete account error:', error);
                              Alert.alert('Error', 'Failed to delete account. Please try again.');
                            }
                          }
                        }
                      ]
                    );
                  }}
                >
                  <Text style={[styles.legalItemText, { color: '#c00' }]}>Delete Account</Text>
                  <Text style={styles.legalItemArrow}>›</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </ScrollView>
        ) : (
          <View style={styles.centered}><Text style={styles.whiteText}>Section Coming Soon</Text></View>
        )}

        {/* Tab Bar Navigation */}
        <View style={styles.tabBar}>
          {['home', 'genres', 'favorites', 'profile'].map((tab) => {
            const isActive = activeTab === tab;
            const iconColor = isActive ? '#667eea' : theme.textSecondary;
            
            return (
              <TouchableOpacity key={tab} style={styles.tab} onPress={() => setActiveTab(tab)}>
                {tab === 'home' ? (
                  <HomeIcon color={iconColor} />
                ) : tab === 'profile' ? (
                  <ProfileIcon color={iconColor} />
                ) : tab === 'genres' ? (
                  <GenresIcon color={iconColor} />
                ) : (
                  <FavoritesIcon color={iconColor} />
                )}
                <Text style={[styles.tabSubLabel, isActive && styles.tabLabelActive]}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <StatusBar style="light" />
      </View>
      <FloatingAudioPlayer />
      <Toast 
        message={toastMessage} 
        visible={toastVisible} 
        onHide={() => setLocalToastVisible(false)} 
      />
      </>
    );
  }

  // Show loading screen while checking auth
  if (screen === 'loading') return <Loader message="Loading..." />;
  
  // Auth Routing
  if (screen === 'onboarding') return <OnboardingScreen onComplete={() => setScreen('login')} />;
  if (screen === 'signup') return <SignupScreen name={name} setName={setName} email={email} setEmail={setEmail} password={password} setPassword={setPassword} loading={loading} onSignup={handleSignup} onLogin={() => setScreen('login')} onGoogleSignIn={handleGoogleSignIn} />;
  if (screen === 'login') return <LoginScreen email={email} setEmail={setEmail} password={password} setPassword={setPassword} loading={loading} onLogin={handleLogin} onSignup={() => setScreen('signup')} onGoogleSignIn={handleGoogleSignIn} onForgot={() => setScreen('forgot')} />;
  if (screen === 'forgot') return (
    <ForgotPasswordScreen 
      email={email}
      setEmail={setEmail}
      resetCode={resetCode}
      setResetCode={setResetCode}
      newPassword={newPassword}
      setNewPassword={setNewPassword}
      forgotStep={forgotStep}
      loading={loading}
      onSendCode={handleForgotPassword}
      onVerifyCode={handleVerifyCode}
      onResetPassword={handleResetPassword}
      onBack={() => {
        setForgotStep(1);
        setResetCode('');
        setNewPassword('');
        setTempToken('');
        setScreen('login');
      }}
    />
  );

  return null;
}

export default function App() {
  return (
    <ThemeProvider>
      <AudioPlayerProvider>
        <AppContent />
      </AudioPlayerProvider>
    </ThemeProvider>
  );
}