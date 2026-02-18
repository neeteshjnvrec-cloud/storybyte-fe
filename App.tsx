import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, FlatList, ScrollView, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoginScreen, SignupScreen, ForgotPasswordScreen, OnboardingScreen } from './PremiumAuth';
import { Logo } from './src/components';
import ApiService from './src/services/api';
import { signInWithGoogle } from './src/services/googleAuth';
import { API_CONFIG } from './src/constants/config';

const { width } = Dimensions.get('window');
const API_URL = API_CONFIG.BASE_URL;

// Setup axios interceptor to add token to all requests
axios.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token && !config.url?.includes('/auth/')) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default function App() {
  const [screen, setScreen] = useState('onboarding'); // 'onboarding', 'login', 'signup', 'forgot', 'home', 'detail', 'filtered'
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'genres', 'categories', 'profile'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [tempToken, setTempToken] = useState('');
  const [forgotStep, setForgotStep] = useState(1); // 1: email, 2: code, 3: new password
  const [loading, setLoading] = useState(false);
  const [loadingStories, setLoadingStories] = useState(false);
  const [token, setToken] = useState('');
  const [user, setUser] = useState<any>(null);
  const [stories, setStories] = useState([]);
  const [selectedStory, setSelectedStory] = useState<any>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<'all' | 'en' | 'hi'>('all');
  const [filterType, setFilterType] = useState<'genre' | 'category' | null>(null);
  const [filterValue, setFilterValue] = useState<string>('');
  const [reviews, setReviews] = useState<any[]>([]);

  // Check for Google OAuth redirect on mount (web only)
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location) {
      const checkGoogleAuth = async () => {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const idToken = params.get('id_token');
        
        const inProgress = await AsyncStorage.getItem('google_auth_in_progress');
        
        if (idToken && inProgress) {
          await AsyncStorage.removeItem('google_auth_in_progress');
          window.location.hash = ''; // Clear hash
          
          // Auto-login with Google token
          setLoading(true);
          try {
            const response = await ApiService.googleAuth(idToken);
            setToken(response.token);
            setUser(response.user);
            setScreen('home');
            loadStories(response.token);
          } catch (error: any) {
            Alert.alert('Sign-In Failed', error.response?.data?.error || 'Failed to sign in with Google');
            setScreen('login');
          } finally {
            setLoading(false);
          }
        }
      };
      checkGoogleAuth();
    }
  }, []);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });
      setToken(response.data.token);
      setUser(response.data.user);
      setScreen('home');
      loadStories(response.data.token);
    } catch (error: any) {
      Alert.alert('Login Failed', error.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/auth/signup`, {
        email,
        password,
        name: name || 'User',
      });
      Alert.alert('Success', 'Account created! Please login.');
      setScreen('login');
      setName('');
      setPassword('');
    } catch (error: any) {
      Alert.alert('Signup Failed', error.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/auth/forgot-password`, { email }, {
        timeout: 60000 // 60 seconds for email sending
      });
      Alert.alert('Success', 'Reset code sent to your email');
      setForgotStep(2);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to send code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!resetCode) {
      Alert.alert('Error', 'Please enter the code');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/verify-reset-code`, {
        email,
        code: resetCode,
      });
      setTempToken(response.data.tempToken);
      setForgotStep(3);
    } catch (error: any) {
      Alert.alert('Error', 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword) {
      Alert.alert('Error', 'Please enter new password');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      console.log('Resetting password with token:', tempToken);
      const response = await axios.post(`${API_URL}/auth/reset-password`, {
        tempToken,
        newPassword,
      });
      console.log('Reset response:', response.data);
      Alert.alert('Success', 'Password reset! Please login with your new password.');
      setScreen('login');
      setForgotStep(1);
      setResetCode('');
      setNewPassword('');
      setPassword('');
      setTempToken('');
    } catch (error: any) {
      console.error('Reset error:', error.response?.data || error.message);
      Alert.alert('Error', error.response?.data?.error || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    console.log('=== GOOGLE SIGN IN STARTED ===');
    setLoading(true);
    try {
      console.log('Calling signInWithGoogle...');
      const idToken = await signInWithGoogle();
      console.log('Got token:', idToken ? 'YES' : 'NO');
      
      if (!idToken) {
        Alert.alert('Cancelled', 'Google sign-in was cancelled');
        setLoading(false);
        return;
      }

      console.log('Calling backend...');
      const response = await ApiService.googleAuth(idToken);
      console.log('Backend response:', response);
      setToken(response.token);
      setUser(response.user);
      setScreen('home');
      loadStories(response.token);
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      Alert.alert('Sign-In Failed', error.message || error.response?.data?.error || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const loadStories = async (authToken: string) => {
    setLoadingStories(true);
    try {
      await AsyncStorage.setItem('token', authToken);
      const response = await axios.get(`${API_URL}/stories`);
      console.log('Stories loaded:', response.data.stories?.length || 0);
      setStories(response.data.stories || []);
    } catch (error: any) {
      console.error('Failed to load stories:', error.message);
      Alert.alert('Error', 'Failed to load stories. Check if backend is running.');
    } finally {
      setLoadingStories(false);
    }
  };

  const playAudio = async () => {
    try {
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }
      
      // Reset state
      setPosition(0);
      setDuration(0);
      setIsPlaying(false);

      if (!selectedStory?.audioUrl) {
        Alert.alert('No Audio', 'This story does not have an audio file.');
        return;
      }

      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
      });

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: selectedStory.audioUrl },
        { shouldPlay: true }
      );

      setSound(newSound);
      setIsPlaying(true);

      // Track play start
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          await axios.post(`${API_URL}/stories/${selectedStory._id}/play`, {
            progress: 0,
            duration: 0,
            completed: false
          });
          setSelectedStory({...selectedStory, plays: (selectedStory.plays || 0) + 1});
        }
      } catch (err) {
        console.log('Failed to track play:', err);
      }

      newSound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.isLoaded) {
          setPosition(status.positionMillis);
          setDuration(status.durationMillis);
          if (status.didJustFinish) {
            setIsPlaying(false);
            setPosition(0);
            // Track completion
            trackPlayCompletion(status.durationMillis);
          }
        }
      });
    } catch (error: any) {
      Alert.alert('Playback Error', error.message);
    }
  };

  const trackPlayCompletion = async (totalDuration: number) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token && selectedStory) {
        await axios.post(`${API_URL}/stories/${selectedStory._id}/play`, {
          progress: 100,
          duration: Math.floor(totalDuration / 1000),
          completed: true
        });
      }
    } catch (err) {
      console.log('Failed to track completion:', err);
    }
  };

  const getRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    if (seconds < 2592000) return `${Math.floor(seconds / 604800)} weeks ago`;
    return `${Math.floor(seconds / 2592000)} months ago`;
  };

  const pauseAudio = async () => {
    if (sound) {
      await sound.pauseAsync();
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  if (screen === 'home') {
    const renderContent = () => {
      if (activeTab === 'home') {
        // Show loader while fetching stories
        if (loadingStories) {
          return (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#667eea" />
            </View>
          );
        }

        // Filter stories by language
        const filteredStories = selectedLanguage === 'all' 
          ? stories 
          : stories.filter((s: any) => s.language === selectedLanguage);

        return (
          <>
            {/* Language Toggle */}
            <View style={styles.languageToggle}>
              <TouchableOpacity 
                style={[styles.langBtn, selectedLanguage === 'all' && styles.langBtnActive]}
                onPress={() => setSelectedLanguage('all')}
              >
                <Text style={[styles.langBtnText, selectedLanguage === 'all' && styles.langBtnTextActive]}>
                  All
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.langBtn, selectedLanguage === 'en' && styles.langBtnActive]}
                onPress={() => setSelectedLanguage('en')}
              >
                <Text style={[styles.langBtnText, selectedLanguage === 'en' && styles.langBtnTextActive]}>
                  English
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.langBtn, selectedLanguage === 'hi' && styles.langBtnActive]}
                onPress={() => setSelectedLanguage('hi')}
              >
                <Text style={[styles.langBtnText, selectedLanguage === 'hi' && styles.langBtnTextActive]}>
                  हिंदी
                </Text>
              </TouchableOpacity>
            </View>

            {filteredStories.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No stories found</Text>
              </View>
            ) : (
              <FlatList
                data={filteredStories}
                keyExtractor={(item: any) => item.id}
                renderItem={({ item }: any) => (
                  <TouchableOpacity 
                    style={styles.storyCard}
                    onPress={async () => {
                      setSelectedStory(item);
                      setScreen('detail');
                      // Fetch user's rating and reviews
                      try {
                        const token = await AsyncStorage.getItem('token');
                        if (token) {
                          const [ratingRes, reviewsRes] = await Promise.all([
                            axios.get(`${API_URL}/stories/${item._id}/rating`),
                            axios.get(`${API_URL}/stories/${item._id}/reviews`)
                          ]);
                          setReviews(reviewsRes.data.reviews || []);
                          if (ratingRes.data.userRating) {
                            setSelectedStory({...item, userRating: ratingRes.data.userRating});
                          }
                        }
                      } catch (err) {
                        console.log('Failed to fetch data:', err);
                      }
                    }}
                  >
                    <Text style={styles.storyTitle}>{item.title}</Text>
                    <Text style={styles.storyDescription} numberOfLines={2}>
                      {item.description}
                    </Text>
                    <View style={styles.storyMeta}>
                      <Text style={styles.metaText}>⭐ {item.averageRating?.toFixed(1) || '0.0'}</Text>
                      <Text style={styles.metaText}>▶ {item.plays || 0}</Text>
                      <Text style={styles.metaText}>{item.language?.toUpperCase() || 'EN'}</Text>
                    </View>
                  </TouchableOpacity>
                )}
                contentContainerStyle={styles.list}
              />
            )}
          </>
        );
      }

      if (activeTab === 'genres') {
        const genres = ['Romance', 'Mystery', 'Drama', 'Comedy', 'Thriller'];
        return (
          <ScrollView contentContainerStyle={styles.list}>
            {genres.map((genre) => {
              const genreStories = stories.filter((s: any) => 
                s.category?.toLowerCase().includes(genre.toLowerCase())
              );
              return (
                <TouchableOpacity 
                  key={genre} 
                  style={styles.genreCard}
                  onPress={() => {
                    setFilterType('genre');
                    setFilterValue(genre);
                    setScreen('filtered');
                  }}
                >
                  <Text style={styles.genreTitle}>{genre}</Text>
                  <Text style={styles.genreCount}>{genreStories.length} stories</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        );
      }

      if (activeTab === 'categories') {
        const categories = [...new Set(stories.map((s: any) => s.category))].filter(Boolean);
        return (
          <ScrollView contentContainerStyle={styles.list}>
            {categories.map((cat: any) => {
              const catStories = stories.filter((s: any) => s.category === cat);
              return (
                <TouchableOpacity 
                  key={cat} 
                  style={styles.categoryCard}
                  onPress={() => {
                    setFilterType('category');
                    setFilterValue(cat);
                    setScreen('filtered');
                  }}
                >
                  <Text style={styles.categoryTitle}>{cat}</Text>
                  <Text style={styles.genreCount}>{catStories.length} stories</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        );
      }

      if (activeTab === 'profile') {
        // Calculate stats from local data
        const favoritesCount = user?.favorites?.length || 0;
        const totalListeningTime = Math.floor(Math.random() * 500) + 100; // TODO: Track from backend
        
        return (
          <ScrollView contentContainerStyle={styles.profileContent}>
            <View style={styles.profileHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() || 'U'}</Text>
              </View>
              <Text style={styles.profileName}>{user?.name || 'User'}</Text>
              <Text style={styles.profileEmail}>{user?.email}</Text>
            </View>

            {/* Stats Cards */}
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{favoritesCount}</Text>
                <Text style={styles.statLabel}>Favorites</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{totalListeningTime}</Text>
                <Text style={styles.statLabel}>Minutes Listened</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{stories.length}</Text>
                <Text style={styles.statLabel}>Total Stories</Text>
              </View>
            </View>

            {/* Account Actions */}
            <View style={styles.profileActions}>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>⭐ My Favorites</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>📊 Listening History</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>⚙️ Settings</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.logoutButton} 
              onPress={() => {
                setToken('');
                setUser(null);
                setScreen('login');
              }}
            >
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </ScrollView>
        );
      }
    };

    return (
      <View style={styles.homeContainer}>
        <View style={styles.header}>
          <Logo size={40} variant="icon" />
          <Text style={styles.headerTitle}>StoryByte</Text>
        </View>
        {renderContent()}
        <View style={styles.tabBar}>
          <TouchableOpacity style={styles.tab} onPress={() => setActiveTab('home')}>
            <Text style={[styles.tabText, activeTab === 'home' && styles.tabTextActive]}>🏠</Text>
            <Text style={[styles.tabLabel, activeTab === 'home' && styles.tabLabelActive]}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab} onPress={() => setActiveTab('genres')}>
            <Text style={[styles.tabText, activeTab === 'genres' && styles.tabTextActive]}>🎭</Text>
            <Text style={[styles.tabLabel, activeTab === 'genres' && styles.tabLabelActive]}>Genres</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab} onPress={() => setActiveTab('categories')}>
            <Text style={[styles.tabText, activeTab === 'categories' && styles.tabTextActive]}>📚</Text>
            <Text style={[styles.tabLabel, activeTab === 'categories' && styles.tabLabelActive]}>Categories</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab} onPress={() => setActiveTab('profile')}>
            <Text style={[styles.tabText, activeTab === 'profile' && styles.tabTextActive]}>👤</Text>
            <Text style={[styles.tabLabel, activeTab === 'profile' && styles.tabLabelActive]}>Profile</Text>
          </TouchableOpacity>
        </View>
        <StatusBar style="light" />
      </View>
    );
  }

  // Onboarding Screen
  if (screen === 'onboarding' && !hasSeenOnboarding) {
    return <OnboardingScreen onComplete={() => {
      setHasSeenOnboarding(true);
      setScreen('login');
    }} />;
  }

  // Auth Screens
  if (screen === 'signup') {
    return <SignupScreen 
      name={name} setName={setName}
      email={email} setEmail={setEmail}
      password={password} setPassword={setPassword}
      loading={loading}
      onSignup={handleSignup}
      onLogin={() => setScreen('login')}
      onGoogleSignIn={handleGoogleSignIn}
    />;
  }

  if (screen === 'forgot') {
    return <ForgotPasswordScreen
      email={email} setEmail={setEmail}
      resetCode={resetCode} setResetCode={setResetCode}
      newPassword={newPassword} setNewPassword={setNewPassword}
      forgotStep={forgotStep}
      loading={loading}
      onSendCode={handleForgotPassword}
      onVerifyCode={handleVerifyCode}
      onResetPassword={handleResetPassword}
      onBack={() => { setScreen('login'); setForgotStep(1); }}
    />;
  }

  if (screen === 'login') {
    return <LoginScreen
      email={email} setEmail={setEmail}
      password={password} setPassword={setPassword}
      loading={loading}
      onLogin={handleLogin}
      onForgot={() => setScreen('forgot')}
      onSignup={() => setScreen('signup')}
      onGoogleSignIn={handleGoogleSignIn}
    />;
  }

  // Filtered Stories Screen
  if (screen === 'filtered') {
    const filteredStories = stories.filter((story: any) => {
      if (filterType === 'genre') {
        return story.category?.toLowerCase().includes(filterValue.toLowerCase());
      } else if (filterType === 'category') {
        return story.category === filterValue;
      }
      return true;
    });

    return (
      <View style={styles.container}>
        <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => {
            // Update the story in the stories list if coming from detail
            if (selectedStory) {
              setStories(stories.map((s: any) => 
                s._id === selectedStory._id ? selectedStory : s
              ));
            }
            setScreen('home');
          }}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{filterValue}</Text>
          <Text style={styles.headerSubtitle}>{filteredStories.length} stories</Text>
        </LinearGradient>

        <FlatList
          data={filteredStories}
          keyExtractor={(item: any) => item._id}
          renderItem={({ item }: { item: any }) => (
            <TouchableOpacity
              style={styles.storyCard}
              onPress={() => {
                setSelectedStory(item);
                setScreen('detail');
              }}
            >
              <View style={styles.storyInfo}>
                <Text style={styles.storyTitle}>{item.title}</Text>
                <Text style={styles.storyAuthor}>by {item.author}</Text>
                <View style={styles.storyMeta}>
                  <Text style={styles.storyMetaText}>⭐ {item.averageRating?.toFixed(1) || '0.0'}</Text>
                  <Text style={styles.storyMetaText}>▶ {item.plays || 0}</Text>
                  <Text style={styles.storyMetaText}>⏱ {item.duration || 'N/A'}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.list}
        />
        <StatusBar style="light" />
      </View>
    );
  }

  // Story Detail Screen
  if (screen === 'detail' && selectedStory) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.detailHeader}>
          <TouchableOpacity style={styles.backBtn} onPress={() => {
            // Update the story in the stories list with latest data
            setStories(stories.map((s: any) => 
              s._id === selectedStory._id ? selectedStory : s
            ));
            setScreen('home');
          }}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.detailTitle}>{selectedStory.title}</Text>
          <Text style={styles.detailAuthor}>by {selectedStory.author}</Text>
        </LinearGradient>
        
        <ScrollView style={styles.detailContent}>
          <TouchableOpacity 
            style={styles.playButton}
            onPress={isPlaying ? pauseAudio : playAudio}
          >
            <Text style={styles.playButtonText}>
              {isPlaying ? '⏸ Pause' : '▶ Listen Now'}
            </Text>
          </TouchableOpacity>

          <View style={styles.detailMeta}>
            <Text style={styles.detailMetaText}>▶ {selectedStory.plays || 0} plays</Text>
            <Text style={styles.detailMetaText}>⏱ {Math.floor((selectedStory.duration || 0) / 60)} min</Text>
            <Text style={styles.detailMetaText}>⭐ {selectedStory.averageRating?.toFixed(1) || '0.0'} ({selectedStory.totalRatings || 0})</Text>
          </View>

          {duration > 0 && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${(position / duration) * 100}%` }]} />
              </View>
              <View style={styles.timeContainer}>
                <Text style={styles.timeText}>{formatTime(position)}</Text>
                <Text style={styles.timeText}>{formatTime(duration)}</Text>
              </View>
            </View>
          )}

          <View style={styles.detailSection}>
            <Text style={styles.detailSectionTitle}>Description</Text>
            <Text style={styles.detailDescription}>{selectedStory.description}</Text>
          </View>

          {selectedStory.textContent && (
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Story</Text>
              <Text style={styles.detailStory}>{selectedStory.textContent}</Text>
            </View>
          )}

          <View style={styles.ratingSection}>
            <Text style={styles.ratingSectionTitle}>Rate this story</Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity 
                  key={star}
                  onPress={async () => {
                    const token = await AsyncStorage.getItem('token');
                    if (!token) {
                      Alert.alert('Login Required', 'Please login to rate stories');
                      return;
                    }
                    try {
                      const response = await axios.post(`${API_URL}/stories/${selectedStory._id}/rating`, {
                        rating: star
                      });
                      if (response.data.success) {
                        setSelectedStory({
                          ...selectedStory, 
                          averageRating: response.data.story.averageRating, 
                          totalRatings: response.data.story.totalRatings,
                          userRating: response.data.userRating
                        });
                        Alert.alert('Success', response.data.message);
                      }
                    } catch (error: any) {
                      Alert.alert('Error', error.response?.data?.error || 'Failed to submit rating');
                    }
                  }}
                >
                  <Text style={styles.starIcon}>
                    {star <= (selectedStory.userRating || 0) ? '⭐' : '☆'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.ratingText}>
              {selectedStory.userRating ? `You rated: ${selectedStory.userRating} stars | ` : ''}
              {selectedStory.averageRating?.toFixed(1) || '0.0'} average from {selectedStory.totalRatings || 0} ratings
            </Text>
          </View>

          {/* Review Section */}
          <View style={styles.reviewSection}>
            <Text style={styles.reviewSectionTitle}>Write a Review</Text>
            <TextInput
              style={styles.reviewInput}
              placeholder="Share your thoughts about this story..."
              placeholderTextColor="#666"
              multiline
              numberOfLines={4}
              onChangeText={(text) => setSelectedStory({...selectedStory, userReview: text})}
              value={selectedStory.userReview || ''}
            />
            <TouchableOpacity 
              style={styles.submitReviewBtn}
              onPress={async () => {
                const token = await AsyncStorage.getItem('token');
                if (!token) {
                  Alert.alert('Login Required', 'Please login to write reviews');
                  return;
                }
                if (!selectedStory.userReview || selectedStory.userReview.trim().length === 0) {
                  Alert.alert('Error', 'Please write a review');
                  return;
                }
                try {
                  await axios.post(`${API_URL}/stories/${selectedStory._id}/review`, {
                    review: selectedStory.userReview
                  });
                  Alert.alert('Success', 'Review submitted!');
                  setSelectedStory({...selectedStory, userReview: ''});
                  // Refresh reviews
                  const reviewsRes = await axios.get(`${API_URL}/stories/${selectedStory._id}/reviews`);
                  setReviews(reviewsRes.data.reviews || []);
                } catch (error: any) {
                  Alert.alert('Error', error.response?.data?.error || 'Failed to submit review');
                }
              }}
            >
              <Text style={styles.submitReviewBtnText}>Submit Review</Text>
            </TouchableOpacity>
          </View>

          {/* Reviews List */}
          {reviews.length > 0 && (
            <View style={styles.reviewsListSection}>
              <Text style={styles.reviewsListTitle}>Reviews ({reviews.length})</Text>
              {reviews.map((review: any, index: number) => {
                console.log('Review data:', JSON.stringify(review, null, 2));
                return (
                <View key={review._id || index} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewUser}>
                      {review.user?.name || 'Anonymous'}
                    </Text>
                    <Text style={styles.reviewDate}>
                      {getRelativeTime(review.createdAt)}
                    </Text>
                  </View>
                  <Text style={styles.reviewText}>{review.review}</Text>
                </View>
              )})}
            </View>
          )}
        </ScrollView>
        <StatusBar style="light" />
      </View>
    );
  }

  function formatTime(millis: number) {
    const minutes = Math.floor(millis / 60000);
    const seconds = Math.floor((millis % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  // Home Screen (default)
  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  homeContainer: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#1a1a1a',
    gap: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  logoutText: {
    fontSize: 16,
    color: '#667eea',
  },
  list: {
    padding: 16,
  },
  storyCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  storyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  storyDescription: {
    fontSize: 14,
    color: '#a0a0a0',
    marginBottom: 12,
    lineHeight: 20,
  },
  storyMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaText: {
    fontSize: 12,
    color: '#666666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#a0a0a0',
    marginTop: 16,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingBottom: 20,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  tabText: {
    fontSize: 24,
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 12,
    color: '#666',
  },
  tabTextActive: {
    opacity: 1,
  },
  tabLabelActive: {
    color: '#667eea',
    fontWeight: '600',
  },
  genreCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loaderText: {
    fontSize: 16,
    color: '#8b9dc3',
    marginTop: 12,
  },
  genreTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  genreCount: {
    fontSize: 14,
    color: '#a0a0a0',
  },
  categoryCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 16,
    color: '#ffffff',
  },
  profileContent: {
    padding: 24,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: '#a0a0a0',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: '#667eea',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#8b9dc3',
    textAlign: 'center',
  },
  profileActions: {
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  logoutButton: {
    backgroundColor: '#f87171',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  logoutButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  detailHeader: {
    padding: 24,
    paddingTop: 60,
  },
  backBtn: {
    marginBottom: 16,
  },
  backBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667eea',
  },
  detailTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  detailAuthor: {
    fontSize: 16,
    color: '#8b9dc3',
  },
  detailContent: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  detailMeta: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  detailMetaText: {
    fontSize: 14,
    color: '#a0a0a0',
  },
  detailSection: {
    padding: 20,
  },
  detailSectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
  },
  detailDescription: {
    fontSize: 16,
    color: '#a0a0a0',
    lineHeight: 24,
    marginBottom: 10,
  },
  detailStory: {
    fontSize: 16,
    color: '#cccccc',
    lineHeight: 26,
    textAlign: 'justify',
  },
  audioControls: {
    padding: 20,
  },
  playButton: {
    backgroundColor: '#667eea',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
  },
  playButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  progressContainer: {
    marginTop: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#667eea',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeText: {
    fontSize: 12,
    color: '#8b9dc3',
  },
  languageToggle: {
    flexDirection: 'row',
    padding: 15,
    gap: 10,
    backgroundColor: '#16213e',
  },
  langBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
  },
  langBtnActive: {
    backgroundColor: '#667eea',
  },
  langBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8b9dc3',
  },
  langBtnTextActive: {
    color: '#ffffff',
  },
  ratingSection: {
    padding: 20,
    backgroundColor: '#1a1a2e',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
  },
  ratingSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  starIcon: {
    fontSize: 32,
  },
  ratingText: {
    fontSize: 14,
    color: '#8b9dc3',
    textAlign: 'center',
  },
  reviewSection: {
    padding: 20,
    backgroundColor: '#1a1a2e',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
  },
  reviewSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
  },
  reviewInput: {
    backgroundColor: '#0f0f1e',
    borderRadius: 8,
    padding: 12,
    color: '#ffffff',
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  submitReviewBtn: {
    backgroundColor: '#667eea',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  submitReviewBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  reviewsListSection: {
    padding: 20,
    backgroundColor: '#1a1a2e',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
  },
  reviewsListTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
  },
  reviewCard: {
    backgroundColor: '#0f0f1e',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  reviewUser: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667eea',
  },
  reviewDate: {
    fontSize: 12,
    color: '#666',
  },
  reviewText: {
    fontSize: 14,
    color: '#ffffff',
    lineHeight: 20,
  },
});
