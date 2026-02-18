import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, STORAGE_KEYS } from '../constants/config';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.api.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          await AsyncStorage.multiRemove([
            STORAGE_KEYS.AUTH_TOKEN,
            STORAGE_KEYS.USER_DATA,
          ]);
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth APIs
  async signup(email: string, password: string, name?: string) {
    const { data } = await this.api.post('/auth/signup', { email, password, name });
    return data;
  }

  async login(email: string, password: string) {
    const { data } = await this.api.post('/auth/login', { email, password });
    return data;
  }

  async googleAuth(tokenOrCode: string) {
    const payload = tokenOrCode.startsWith('4/') 
      ? { code: tokenOrCode }
      : { idToken: tokenOrCode };
    const { data } = await this.api.post('/auth/google', payload);
    return data;
  }

  async forgotPassword(email: string) {
    const { data } = await this.api.post('/auth/forgot-password', { email });
    return data;
  }

  async verifyResetCode(email: string, code: string) {
    const { data } = await this.api.post('/auth/verify-reset-code', { email, code });
    return data;
  }

  async resetPassword(tempToken: string, newPassword: string) {
    const { data } = await this.api.post('/auth/reset-password', { tempToken, newPassword });
    return data;
  }

  // Story APIs
  async getStories(params?: {
    page?: number;
    limit?: number;
    language?: string;
    category?: string;
    sort?: string;
  }) {
    const { data } = await this.api.get('/stories', { params });
    return data;
  }

  async getStory(id: string) {
    const { data } = await this.api.get(`/stories/${id}`);
    return data;
  }

  async searchStories(query: string) {
    const { data } = await this.api.get('/stories/search', { params: { q: query } });
    return data;
  }

  async trackPlay(storyId: string, progress: number, duration: number, completed: boolean) {
    const { data } = await this.api.post(`/stories/${storyId}/play`, {
      progress,
      duration,
      completed,
    });
    return data;
  }

  async toggleFavorite(storyId: string) {
    const { data } = await this.api.post(`/stories/${storyId}/favorite`);
    return data;
  }

  async rateStory(storyId: string, rating: number, review?: string) {
    const { data } = await this.api.post(`/stories/${storyId}/rating`, { rating, review });
    return data;
  }

  async getUserRating(storyId: string) {
    const { data } = await this.api.get(`/stories/${storyId}/rating`);
    return data;
  }

  async getReviews(storyId: string, limit: number = 10, skip: number = 0) {
    const { data } = await this.api.get(`/stories/${storyId}/reviews`, { 
      params: { limit, skip } 
    });
    return data;
  }


  // User APIs
  async getProfile() {
    const { data } = await this.api.get('/user/profile');
    return data;
  }

  async updateProfile(updates: any) {
    const { data } = await this.api.put('/user/profile', updates);
    return data;
  }

  async getFavorites() {
    const { data } = await this.api.get('/user/favorites');
    return data;
  }

  async getHistory() {
    const { data } = await this.api.get('/user/history');
    return data;
  }

  async getStats() {
    const { data } = await this.api.get('/user/stats');
    return data;
  }
}

export default new ApiService();
