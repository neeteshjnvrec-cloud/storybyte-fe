import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, Alert, ActivityIndicator, 
  ScrollView, TouchableOpacity, Platform 
} from 'react-native';
import { useAudioPlayer } from 'expo-audio';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Screens & Components
import { LoginScreen, SignupScreen, ForgotPasswordScreen, OnboardingScreen } from './PremiumAuth';
import { Logo, Loader } from './src/components';
import { HomeScreen } from './src/screens/HomeScreen';
import { FavoritesScreen } from './src/screens/FavoritesScreen';

// Services & Config
import ApiService from './src/services/api';
import { signInWithGoogle } from './src/services/googleAuth';
import { API_CONFIG } from './src/constants/config';
import { StoryDetailScreen } from './src/screens/StoryDetailScreen';
import { useTheme, lightTheme, darkTheme } from './src/hooks/useTheme';

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

export default function App() {
  // Navigation & UI State
  const [screen, setScreen] = useState<string>('loading'); // Start with loading state
  const [activeTab, setActiveTab] = useState<string>('home');
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingStories, setLoadingStories] = useState<boolean>(false);

  // Theme
  const { themeMode, changeTheme, isDark } = useTheme();
  const theme = isDark ? darkTheme : lightTheme;

  const styles = StyleSheet.create({
    homeContainer: { flex: 1, backgroundColor: theme.background },
    header: { flexDirection: 'row', alignItems: 'center', padding: 24, paddingTop: 60, backgroundColor: theme.surface, gap: 8 },
    headerTitle: { fontSize: 24, fontWeight: '700', color: theme.text },
    tabBar: { flexDirection: 'row', backgroundColor: theme.surface, borderTopWidth: 1, borderTopColor: theme.border, paddingBottom: 25 },
    tab: { flex: 1, alignItems: 'center', paddingVertical: 10 },
    tabLabel: { fontSize: 20 },
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
    historyIcon: { fontSize: 24 },
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
    themeIcon: { fontSize: 32, marginBottom: 8 },
    themeText: { fontSize: 14, color: theme.textSecondary, fontWeight: '600' },
    themeTextActive: { color: theme.text },
    emptyText: { fontSize: 16, color: theme.textSecondary, textAlign: 'center', marginVertical: 40 },
    statsContainer: { marginBottom: 24 },
    statsRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
    statCard: { flex: 1, borderRadius: 10, overflow: 'hidden' },
    statGradient: { padding: 10, alignItems: 'center' },
    statIcon: { fontSize: 20, marginBottom: 4 },
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
    emptyIcon: { fontSize: 64, marginBottom: 16 },
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
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Audio State
 
  // const [sound, setSound] = useState<Audio.Sound | null>(null);
  const player = useAudioPlayer(selectedStory?.audioUrl || '');
  // const [position, setPosition] = useState<number>(0);
  // const [duration, setDuration] = useState<number>(0);

  // --- Effects ---

  // Check for stored auth token on app start
  useEffect(() => {
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
      // Always load stats when entering profile tab to get latest data
      if (profileTab === 'stats') {
        loadUserStats(true);
      }
    }
  }, [activeTab, user, profileTab]);

  const loadUserStats = async (forceRefresh = false) => {
    // Skip if already loaded and not forcing refresh
    if (!forceRefresh && userStats) {
      console.log('Using cached stats');
      return;
    }
    
    console.log('Loading stats, forceRefresh:', forceRefresh);
    setLoadingProfile(true);
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
      setLoadingProfile(false);
      console.log('Stats loading complete');
    }
  };

  const loadUserHistory = async (forceRefresh = false) => {
    // Skip if already loaded and not forcing refresh
    if (!forceRefresh && userHistory.length > 0) {
      console.log('Using cached history');
      return;
    }
    setLoadingProfile(true);
    try {
      const response = await ApiService.getHistory();
      console.log('History response:', response);
      setUserHistory(response.history || []);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const loadUserProgress = async (forceRefresh = false) => {
    // Skip if already loaded and not forcing refresh
    if (!forceRefresh && userProgress.length > 0) {
      console.log('Using cached progress');
      return;
    }
    setLoadingProfile(true);
    try {
      const response = await axios.get(`${API_URL}/user/progress`);
      setUserProgress(response.data.progress || []);
    } catch (error) {
      console.error('Failed to load progress:', error);
    } finally {
      setLoadingProfile(false);
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
    await AsyncStorage.removeItem('@story_teller:auth_token');
    setUser(null);
    setScreen('login');
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

  if (screen === 'home') {
    return (
      <View style={[styles.homeContainer, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
          <Logo size={40} variant="icon" />
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
                              <Text style={styles.statText}>⭐ {story.averageRating?.toFixed(1) || '0.0'}</Text>
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
                    <Text style={styles.emptyIcon}>✨</Text>
                    <Text style={styles.emptyTitle}>Coming Soon!</Text>
                    <Text style={styles.emptyMessage}>
                      We're crafting amazing {selectedGenre.toLowerCase()} stories for you.{'\n'}
                      Stay tuned for something magical! 🎧
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
          <FavoritesScreen navigation={{ navigate: (screen: string, params: any) => {
            if (screen === 'StoryDetail') {
              setSelectedStory(params.story);
              setScreen('detail');
            }
          }}} />
        ) : activeTab === 'profile' ? (
          <ScrollView contentContainerStyle={styles.profileContent}>
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
                    if (tab === 'stats') loadUserStats(true);
                    if (tab === 'history') loadUserHistory(true);
                    if (tab === 'progress') loadUserProgress(true);
                  }}
                >
                  <Text style={[styles.profileTabText, profileTab === tab && styles.profileTabTextActive]}>
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {loadingProfile ? (
              <Loader message={
                profileTab === 'stats' ? 'Loading stats...' :
                profileTab === 'history' ? 'Loading history...' :
                profileTab === 'progress' ? 'Loading progress...' :
                'Loading...'
              } />
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
                      <Text style={styles.statIcon}>⏱️</Text>
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
                      <Text style={styles.statIcon}>📚</Text>
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
                      <Text style={styles.statIcon}>❤️</Text>
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
                      <Text style={styles.statIcon}>✅</Text>
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
                      <Text style={styles.statIcon}>📖</Text>
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
                      <Text style={styles.statIcon}>▶️</Text>
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
                          <Text style={styles.historyIcon}>{item.completed ? '✅' : '▶️'}</Text>
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
                      <Text style={styles.themeIcon}>
                        {mode === 'light' ? '☀️' : mode === 'dark' ? '🌙' : '⚙️'}
                      </Text>
                      <Text style={[styles.themeText, themeMode === mode && styles.themeTextActive]}>
                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
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
          {['home', 'genres', 'favorites', 'profile'].map((tab) => (
            <TouchableOpacity key={tab} style={styles.tab} onPress={() => setActiveTab(tab)}>
              <Text style={[styles.tabLabel, activeTab === tab && styles.tabLabelActive]}>
                {tab === 'home' ? '🏠' : tab === 'genres' ? '🎭' : tab === 'favorites' ? '❤️' : '👤'}
              </Text>
              <Text style={[styles.tabSubLabel, activeTab === tab && styles.tabLabelActive]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <StatusBar style="light" />
      </View>
    );
  }
 const pauseAudio = () => {
  try {
    console.log('pauseAudio called, player:', player);
    if (player) {
      player.pause();
      setIsPlaying(false);
      console.log('Audio paused');
    }
  } catch (error) {
    console.error("Error pausing audio:", error);
  }
};

const playAudio = () => {
  try {
    console.log('playAudio called, player:', player);
    if (!player) {
      Alert.alert("Error", "Audio player not initialized");
      return;
    }

    if (!selectedStory?.audioUrl) {
      Alert.alert("Error", "No audio available");
      return;
    }

    // Start playback
    player.play();
    setIsPlaying(true);

    // Track play via API when starting audio
    // We don't await this to avoid delaying the audio start
    ApiService.trackPlay(
      selectedStory._id || selectedStory.id, 
      0, 
      0, 
      false
    ).catch(error => console.log('Failed to track play:', error));

  } catch (error) {
    console.error("Error playing audio:", error);
    Alert.alert("Error", "Could not play audio");
  }
};
if (screen === 'detail' && selectedStory) {
  console.log('Rendering StoryDetailScreen with:', {
    story: selectedStory.title,
    player: player ? 'exists' : 'null',
    playing: player?.playing
  });
  return (
    <StoryDetailScreen 
      story={selectedStory} 
      onBack={async () => {
        // Safe check: pause audio before navigating back
        if (player?.playing) {
          player.pause();
        }
        // Force refresh stories to get updated ratings/plays
        await loadStories(1, true);
        setScreen('home');
      }} 
      // Use the player's built-in state and your new functions
      onPlayPause={() => {
        console.log('onPlayPause clicked, currently playing:', isPlaying);
        if (isPlaying) {
          pauseAudio();
        } else {
          playAudio();
        }
      }}
      isPlaying={isPlaying}
      
      // Convert player's seconds to milliseconds for your UI
      position={(player?.currentTime || 0) * 1000} 
      duration={(player?.duration || 0) * 1000} 
    />
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