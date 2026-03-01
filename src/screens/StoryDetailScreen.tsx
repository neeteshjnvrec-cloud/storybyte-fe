import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, TextInput, Alert, ActivityIndicator, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ApiService from '../services/api';
import { Loader } from '../components';
import { HeartIcon, StarIcon } from '../components/Icons';
import { useTheme, lightTheme, darkTheme } from '../hooks/useTheme';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { trackScreenView, trackStoryViewed } from '../utils/analytics';

export const StoryDetailScreen = ({ 
  story, onBack, onFavoriteToggle
}: any) => {
  const { isDark } = useTheme();
  const theme = isDark ? darkTheme : lightTheme;
  const { loadStory, currentStory } = useAudioPlayer();

  useEffect(() => {
    trackScreenView('StoryDetail');
    if (story) {
      trackStoryViewed(story._id || story.id, story.title);
    }
  }, []);

  // Load story into player when screen opens
  useEffect(() => {
    if (story && (!currentStory || (currentStory._id || currentStory.id) !== (story._id || story.id))) {
      loadStory(story);
    }
  }, [story]);

  // Safety check
  if (!story) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
        <Text style={{ color: theme.text }}>Story not found</Text>
        <TouchableOpacity onPress={onBack} style={{ marginTop: 20, padding: 10, backgroundColor: '#667eea', borderRadius: 8 }}>
          <Text style={{ color: '#fff' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    header: { padding: 24, paddingTop: 60, paddingBottom: 20, justifyContent: 'flex-end' },
    backBtn: { marginBottom: 0 },
    backBtnText: { color: '#667eea', fontWeight: '700', fontSize: 16 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    favoriteBtn: { 
      width: 48, 
      height: 48, 
      justifyContent: 'center', 
      alignItems: 'center',
      marginLeft: 12,
    },
    title: { fontSize: 26, fontWeight: '800', color: theme.text, marginBottom: 0, flex: 1 },
    author: { color: theme.textSecondary, marginTop: 0, fontSize: 14 },
    content: { padding: 24, backgroundColor: theme.background, borderTopLeftRadius: 30, borderTopRightRadius: 30, marginTop: -20, paddingBottom: 40 },
    playButton: { 
      marginBottom: 20, 
      borderRadius: 16, 
      overflow: 'hidden',
      shadowColor: '#667eea',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 10
    },
    playButtonGradient: {
      paddingVertical: 18,
      paddingHorizontal: 24,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 12
    },
    playButtonIcon: { 
      color: '#fff', 
      fontSize: 20,
      fontWeight: '900'
    },
    playButtonText: { 
      color: '#fff', 
      fontWeight: '700', 
      fontSize: 16,
      letterSpacing: 1
    },
    statsRow: { borderRadius: 15, marginBottom: 15, marginTop: -10, overflow: 'hidden' },
    statsGradient: { flexDirection: 'row', justifyContent: 'space-around', padding: 8, paddingVertical: 8 },
    statItem: { alignItems: 'center' },
    statValue: { color: theme.text, fontSize: 15, fontWeight: '700', marginBottom: 2 },
    statLabel: { color: theme.textSecondary, fontSize: 10 },
    sectionTitle: { color: theme.text, fontSize: 18, fontWeight: '700', marginBottom: 10, marginTop: 0 },
    description: { color: theme.textSecondary, lineHeight: 22, fontSize: 14, marginBottom: 10 },
    pageContainer: { borderRadius: 15, marginBottom: 20, height: 400, overflow: 'hidden' },
    pageGradient: { flex: 1, padding: 20 },
    textContentScroll: { flex: 1 },
    textContent: { color: theme.text, lineHeight: 28, fontSize: 16, textAlign: 'justify' },
    pagination: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
    pageBtn: { backgroundColor: '#667eea', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
    pageBtnDisabled: { backgroundColor: theme.border, opacity: 0.5 },
    pageBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
    pageInfo: { color: theme.textSecondary, fontSize: 14, fontWeight: '600' },
    categoryBadge: { backgroundColor: '#667eea', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, alignSelf: 'flex-start' },
    categoryText: { color: '#fff', fontWeight: '600', fontSize: 14 },
    ratingContainer: { borderRadius: 15, marginTop: 10, overflow: 'hidden' },
    ratingGradient: { padding: 20 },
    yourRatingBox: { 
      backgroundColor: theme.card, 
      padding: 12, 
      borderRadius: 10, 
      marginBottom: 16,
      borderLeftWidth: 3,
      borderLeftColor: '#667eea',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    yourRatingLabel: { color: theme.text, fontSize: 15, fontWeight: '600' },
    ratingLabel: { color: theme.text, fontSize: 14, fontWeight: '600', marginBottom: 10 },
    starsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
    star: { fontSize: 24 },
    reviewInput: { 
      backgroundColor: theme.card, 
      borderRadius: 10, 
      padding: 12, 
      color: theme.text, 
      fontSize: 14,
      minHeight: 60,
      maxHeight: 80,
      textAlignVertical: 'top',
      marginBottom: 16
    },
    submitBtn: { 
      backgroundColor: '#667eea', 
      borderRadius: 10, 
      padding: 12, 
      alignItems: 'center' 
    },
    submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
    rateButton: { borderRadius: 15, overflow: 'hidden', marginTop: -5 },
    rateButtonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, gap: 8 },
    rateButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalContent: { width: '100%', borderRadius: 20, padding: 20, maxHeight: '70%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    modalTitle: { fontSize: 18, fontWeight: '700' },
    modalClose: { fontSize: 28, color: '#666' },
    alreadyRatedText: { color: theme.text, fontSize: 16, marginBottom: 12, textAlign: 'center', fontWeight: '600' },
    userRatingDisplay: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12, marginBottom: 16 },
    userRatingText: { color: '#667eea', fontWeight: '700', fontSize: 18 },
    userReviewBox: { backgroundColor: theme.card, padding: 12, borderRadius: 10, borderLeftWidth: 3, borderLeftColor: '#667eea' },
    userReviewLabel: { color: theme.textSecondary, fontSize: 12, marginBottom: 6, fontWeight: '600' },
    userReviewText: { color: theme.text, fontSize: 14, lineHeight: 20 },
    reviewCard: { 
      marginBottom: 12,
      borderRadius: 12,
      overflow: 'hidden'
    },
    reviewGradient: {
      padding: 16,
      flexDirection: 'row'
    },
    reviewAccent: {
      width: 3,
      borderRadius: 2,
      marginRight: 12
    },
    reviewContent: {
      flex: 1
    },
    reviewHeader: { 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      marginBottom: 8 
    },
    reviewUser: { color: theme.text, fontWeight: '600', fontSize: 15 },
    reviewTime: { color: theme.textSecondary, fontSize: 12 },
    reviewStars: { flexDirection: 'row', gap: 2 },
    reviewStar: { fontSize: 14 },
    reviewRating: { color: '#667eea', fontWeight: '700', fontSize: 14 },
    reviewText: { 
      color: theme.textSecondary, 
      fontSize: 14, 
      lineHeight: 20
    },
    reviewDate: { color: theme.textSecondary, fontSize: 12 },
    noReviews: { color: theme.textSecondary, fontSize: 14, marginBottom: 20, fontStyle: 'italic' }
  });

  const [currentPage, setCurrentPage] = useState(0);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [userRating, setUserRating] = useState<any>(null);
  const [hasRated, setHasRated] = useState(false);
  const [storyData, setStoryData] = useState(story);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);

  useEffect(() => {
    console.log('StoryDetailScreen mounted with story:', story);
    fetchStoryDetails();
    fetchUserRating();
    checkIfFavorited();
  }, [story._id || story.id]);

  const checkIfFavorited = async () => {
    try {
      const storyId = story._id || story.id;
      const response = await ApiService.getFavorites();
      const isFav = response.favorites.some((fav: any) => 
        (fav._id === storyId || fav.id === storyId)
      );
      console.log('Is favorited:', isFav);
      setIsFavorited(isFav);
    } catch (error) {
      console.error('Failed to check favorite status:', error);
    }
  };

  const handleToggleFavorite = async () => {
    try {
      console.log('Toggling favorite for story:', story._id || story.id);
      const response = await ApiService.toggleFavorite(story._id || story.id);
      console.log('Toggle favorite response:', response);
      setIsFavorited(response.favorited);
      
      // Notify parent component
      if (onFavoriteToggle) {
        onFavoriteToggle(story._id || story.id, response.favorited);
      }
      
      Alert.alert('Success', response.favorited ? 'Added to favorites!' : 'Removed from favorites');
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      Alert.alert('Error', 'Failed to update favorite');
    }
  };

  const fetchUserRating = async () => {
    try {
      const response = await ApiService.getUserRating(story._id || story.id);
      console.log('User rating response:', response);
      if (response && response.userRating) {
        setUserRating(response.userRating );
        setHasRated(true);
      }
    } catch (error) {
      console.log('No user rating found');
    }
  };

  const fetchStoryDetails = async () => {
    try {
      console.log('Fetching reviews for story:', story._id || story.id);
      const reviewsData = await ApiService.getReviews(story._id || story.id);
      console.log('Reviews data:', reviewsData);
      setReviews(reviewsData.reviews || []);
      
      // Also fetch updated story data for averageRating
      const updatedStory = await ApiService.getStory(story._id || story.id);
      setStoryData(updatedStory);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
      // Set empty reviews on error to prevent crash
      setReviews([]);
      setStoryData(story);
    } finally {
      setLoadingReviews(false);
    }
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    const diffMonths = Math.floor(diffDays / 30);
    
    if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 30) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    return `${diffMonths} month${diffMonths !== 1 ? 's' : ''} ago`;
  };

  // Split text into pages (roughly 500 characters per page, break at word boundaries)
  const splitIntoPages = (text: string) => {
    if (!text) return [];
    const charsPerPage = 500;
    const pages = [];
    let currentPos = 0;
    
    while (currentPos < text.length) {
      let endPos = Math.min(currentPos + charsPerPage, text.length);
      
      // If not at the end, find the last space to break at word boundary
      if (endPos < text.length) {
        const lastSpace = text.lastIndexOf(' ', endPos);
        if (lastSpace > currentPos) {
          endPos = lastSpace;
        }
      }
      
      pages.push(text.slice(currentPos, endPos).trim());
      currentPos = endPos + 1;
    }
    return pages;
  };

  const pages = story.textContent ? splitIntoPages(story.textContent) : [];

  const handleSubmitRating = async () => {
    const finalRating = rating || userRating;
    
    if (!finalRating) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }
    
    setSubmitting(true);
    try {
      console.log('📝 Submitting rating:', { storyId: story._id || story.id, rating: finalRating, review });
      const response = await ApiService.rateStory(story._id || story.id, finalRating, review || undefined);
      console.log('✅ Rating submitted:', response);
      
      Alert.alert('Success', 'Thank you for your rating!');
      // Refresh reviews and user rating
      await fetchStoryDetails();
      await fetchUserRating();
      setRating(0);
      setReview('');
    } catch (error: any) {
      console.error('❌ Rating submission error:', error);
      console.error('Error response:', error.response?.data);
      Alert.alert('Error', error.response?.data?.error || 'Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={theme.background} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        <LinearGradient 
          colors={isDark ? ['#1a1a2e', '#16213e'] : ['#f0f0f0', '#e0e0e0']} 
          style={styles.header}
        >
          <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.6} delayPressIn={0}>
            <Text style={styles.backBtnText}>← Library</Text>
          </TouchableOpacity>
          <View style={styles.headerRow}>
            <Text style={styles.title}>{story.title}</Text>
            <TouchableOpacity onPress={handleToggleFavorite} style={styles.favoriteBtn}>
              <HeartIcon color={isFavorited ? '#ec4899' : '#fff'} size={28} filled={isFavorited} />
            </TouchableOpacity>
          </View>
          <Text style={styles.author}>by {story.author || 'StoryByte'}</Text>
        </LinearGradient>

        <View style={styles.content}>
          <View style={styles.statsRow}>
            <LinearGradient
              colors={isDark ? ['#10b98130', 'rgba(255,255,255,0.05)'] : ['#10b98130', 'rgba(0,0,0,0.03)']}
              start={{ x: 0, y: 0 }} 
              end={{ x: 1, y: 1 }}
              style={styles.statsGradient}
            >
            <View style={styles.statItem}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <StarIcon color="#f59e0b" size={16} filled />
                <Text style={styles.statValue}>{storyData.averageRating?.toFixed(1) || '0.0'}</Text>
              </View>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>▶ {storyData.plays || 0}</Text>
              <Text style={styles.statLabel}>Plays</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{storyData.language?.toUpperCase() || 'EN'}</Text>
              <Text style={styles.statLabel}>Language</Text>
            </View>
            </LinearGradient>
          </View>

          <Text style={styles.sectionTitle}>About this story</Text>
          <Text style={styles.description} numberOfLines={1}>{storyData.description || 'No description available'}</Text>
          
          {pages.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Story Content</Text>
              <View style={styles.pageContainer}>
                <LinearGradient
                  colors={['#f59e0b20', '#ec489920']}
                  start={{ x: 0, y: 0 }} 
                  end={{ x: 1, y: 1 }}
                  style={styles.pageGradient}
                >
                  <ScrollView 
                    style={styles.textContentScroll}
                    showsVerticalScrollIndicator={true}
                    nestedScrollEnabled={true}
                  >
                    <Text style={styles.textContent}>{pages.join('\n\n')}</Text>
                  </ScrollView>
                </LinearGradient>
              </View>
            </>
          )}

          <TouchableOpacity 
            style={[styles.rateButton, { backgroundColor: isDark ? '#1f2937' : '#f3f4f6', borderColor: theme.border, borderWidth: 1 }]}
            onPress={() => setShowRatingModal(true)}
          >
            <View style={styles.rateButtonGradient}>
              <StarIcon color={isDark ? '#667eea' : '#8b5cf6'} size={20} filled />
              <Text style={[styles.rateButtonText, { color: theme.text }]}>Rate this Story</Text>
            </View>
          </TouchableOpacity>

          {loadingReviews ? (
            <Loader message="Loading reviews..." />
          ) : reviews && reviews.length > 0 ? (
            <>
              <Text style={styles.sectionTitle}>Reviews ({reviews.length})</Text>
              {reviews.slice(0, 10).map((item: any, index: number) => {
                const colors = ['#667eea', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b'];
                const cardColor = colors[index % colors.length];
                return (
                  <View key={item._id || index} style={styles.reviewCard}>
                    <LinearGradient
                      colors={[cardColor + '20', 'rgba(255,255,255,0.03)']}
                      start={{ x: 0, y: 0 }} 
                      end={{ x: 1, y: 1 }}
                      style={styles.reviewGradient}
                    >
                      <View style={[styles.reviewAccent, { backgroundColor: cardColor }]} />
                      <View style={styles.reviewContent}>
                        <View style={styles.reviewHeader}>
                          <Text style={styles.reviewUser}>{item.user?.name || 'Anonymous'}</Text>
                          <Text style={styles.reviewTime}>{getTimeAgo(item.createdAt)}</Text>
                        </View>
                        <Text style={styles.reviewText}>{item.review}</Text>
                      </View>
                    </LinearGradient>
                  </View>
                );
              })}
            </>
          ) : (
            <>
              <Text style={styles.sectionTitle}>Reviews</Text>
              <Text style={styles.noReviews}>No reviews yet. Be the first to review!</Text>
            </>
          )}

          <Modal
            visible={showRatingModal}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowRatingModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: theme.text }]}>Rate & Review</Text>
                  <TouchableOpacity onPress={() => setShowRatingModal(false)}>
                    <Text style={styles.modalClose}>✕</Text>
                  </TouchableOpacity>
                </View>

                <Text style={[styles.ratingLabel, { color: theme.text }]}>Your Rating</Text>
                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity key={star} onPress={() => setRating(star)}>
                      <Text style={[styles.star, { color: star <= (rating || userRating || 0) ? '#f59e0b' : (isDark ? '#666' : '#ddd') }]}>
                        {star <= (rating || userRating || 0) ? '★' : '★'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                
                <TextInput
                  style={[styles.reviewInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                  placeholder="Write your review"
                  placeholderTextColor={theme.textSecondary}
                  value={review}
                  onChangeText={setReview}
                  multiline
                  numberOfLines={2}
                />
                
                <TouchableOpacity 
                  style={[styles.submitBtn, { backgroundColor: isDark ? '#1f2937' : '#f3f4f6', borderColor: theme.border, borderWidth: 1 }]} 
                  onPress={() => {
                    handleSubmitRating();
                    setShowRatingModal(false);
                  }}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator color={theme.text} />
                  ) : (
                    <Text style={[styles.submitBtnText, { color: theme.text }]}>Submit Your Review</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      </ScrollView>
    </View>
  );
};