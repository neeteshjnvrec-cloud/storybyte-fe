import { analytics } from '../../firebaseConfig';
import { logEvent } from 'firebase/analytics';

const trackEvent = (eventName: string, params: any) => {
  if (analytics) {
    logEvent(analytics, eventName, params);
  }
};

export const trackScreenView = (screenName: string) => {
  trackEvent('screen_view', { screen_name: screenName });
};

export const trackStoryPlayed = (storyId: string, storyTitle: string, category: string) => {
  trackEvent('story_played', { story_id: storyId, story_title: storyTitle, category });
};

export const trackStoryPaused = (storyId: string, position: number) => {
  trackEvent('story_paused', { story_id: storyId, position });
};

export const trackStoryCompleted = (storyId: string, duration: number) => {
  trackEvent('story_completed', { story_id: storyId, duration });
};

export const trackStorySkipped = (storyId: string, position: number) => {
  trackEvent('story_skipped', { story_id: storyId, position });
};

export const trackPageChanged = (storyId: string, pageNumber: number) => {
  trackEvent('page_changed', { story_id: storyId, page_number: pageNumber });
};

export const trackPlaybackSpeedChanged = (speed: number) => {
  trackEvent('playback_speed_changed', { speed });
};

export const trackVolumeChanged = (volume: number) => {
  trackEvent('volume_changed', { volume });
};

export const trackLogin = (method: 'email' | 'google') => {
  trackEvent('login', { method });
};

export const trackSignup = (method: 'email' | 'google') => {
  trackEvent('sign_up', { method });
};

export const trackLogout = () => {
  trackEvent('logout', {});
};

export const trackSearch = (query: string) => {
  trackEvent('search', { search_term: query });
};

export const trackFavorite = (storyId: string, action: 'add' | 'remove') => {
  trackEvent('favorite', { story_id: storyId, action });
};

export const trackStoryViewed = (storyId: string, storyTitle: string) => {
  trackEvent('story_viewed', { story_id: storyId, story_title: storyTitle });
};

export const trackLanguageChanged = (language: string) => {
  trackEvent('language_changed', { language });
};

export const trackCategoryViewed = (category: string) => {
  trackEvent('category_viewed', { category });
};

export const trackShareStory = (storyId: string, method: string) => {
  trackEvent('share', { story_id: storyId, method });
};

export const trackRateStory = (storyId: string, rating: number) => {
  trackEvent('rate_story', { story_id: storyId, rating });
};

export const trackDownloadStory = (storyId: string) => {
  trackEvent('download_story', { story_id: storyId });
};

export const trackProfileViewed = () => {
  trackEvent('profile_viewed', {});
};

export const trackProfileUpdated = (field: string) => {
  trackEvent('profile_updated', { field });
};

export const trackPasswordChanged = () => {
  trackEvent('password_changed', {});
};

export const trackPasswordReset = () => {
  trackEvent('password_reset', {});
};

export const trackError = (errorType: string, errorMessage: string) => {
  trackEvent('error', { error_type: errorType, error_message: errorMessage });
};

export const trackAppOpened = () => {
  trackEvent('app_open', {});
};

export const trackOnboardingCompleted = () => {
  trackEvent('onboarding_completed', {});
};

export const trackOnboardingSkipped = () => {
  trackEvent('onboarding_skipped', {});
};
