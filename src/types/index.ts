export interface User {
  id: string;
  email?: string;
  phone?: string;
  name?: string;
  picture?: string;
  bio?: string;
  preferences: {
    language: 'en' | 'hi';
    autoplay: boolean;
    notifications: boolean;
    theme: 'light' | 'dark';
  };
}

export interface Story {
  id: string;
  title: string;
  description: string;
  audioUrl: string;
  thumbnailUrl?: string;
  textContent?: string;
  language: 'en' | 'hi';
  category: string;
  duration: number;
  plays: number;
  averageRating: number;
  ratings: Rating[];
  status: 'published' | 'draft';
  featured: boolean;
  tags: string[];
  createdAt: string;
}

export interface Rating {
  userId: string;
  rating: number;
  review?: string;
  createdAt: string;
}

export interface UserActivity {
  userId: string;
  storyId: string;
  progress: number;
  duration: number;
  completed: boolean;
  completedAt?: string;
  playCount: number;
  totalListeningTime: number;
  lastPlayedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface StoriesResponse {
  stories: Story[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

export interface UserStats {
  totalPlays: number;
  totalListeningTime: number;
  completedStories: number;
  favoriteCount: number;
}
