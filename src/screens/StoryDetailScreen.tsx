import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, TextInput, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ApiService from '../services/api';
import { Loader } from '../components';
import { useTheme, lightTheme, darkTheme } from '../hooks/useTheme';

export const StoryDetailScreen = ({ 
  story, onBack, onPlayPause, isPlaying, position, duration 
}: any) => {
  const { isDark } = useTheme();
  const theme = isDark ? darkTheme : lightTheme;

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
    header: { padding: 24, paddingTop: 60, paddingBottom: 30, justifyContent: 'flex-end' },
    backBtn: { marginBottom: 20 },
    backBtnText: { color: '#667eea', fontWeight: '700', fontSize: 16 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    favoriteBtn: { 
      width: 48, 
      height: 48, 
      justifyContent: 'center', 
      alignItems: 'center',
      marginLeft: 12,
    },
    title: { fontSize: 32, fontWeight: '800', color: theme.text, marginBottom: 8, flex: 1 },
    author: { color: theme.textSecondary, marginTop: 5, fontSize: 16 },
    content: { padding: 24, backgroundColor: theme.background, borderTopLeftRadius: 30, borderTopRightRadius: 30, marginTop: -30, paddingBottom: 40 },
    playerCard: { borderRadius: 20, marginBottom: 20, overflow: 'hidden' },
    playerGradient: { padding: 12 },
    progressBarBg: { height: 3, backgroundColor: theme.border, borderRadius: 2, overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: '#667eea' },
    timeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
    timeLabel: { color: theme.textSecondary, fontSize: 11 },
    playBtn: { 
      marginTop: 8, 
      borderRadius: 12, 
      overflow: 'hidden',
      shadowColor: '#667eea',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8
    },
    playGradient: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      borderRadius: 12,
      gap: 8
    },
    playIconContainer: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center'
    },
    playIcon: { 
      color: '#fff', 
      fontSize: 14,
      fontWeight: '900'
    },
    playText: { 
      color: '#fff', 
      fontWeight: '700', 
      fontSize: 14,
      letterSpacing: 0.8
    },
    statsRow: { borderRadius: 15, marginBottom: 20, overflow: 'hidden' },
    statsGradient: { flexDirection: 'row', justifyContent: 'space-around', padding: 12 },
    statItem: { alignItems: 'center' },
    statValue: { color: theme.text, fontSize: 16, fontWeight: '700', marginBottom: 2 },
    statLabel: { color: theme.textSecondary, fontSize: 11 },
    sectionTitle: { color: theme.text, fontSize: 20, fontWeight: '700', marginBottom: 12, marginTop: 8 },
    description: { color: theme.textSecondary, lineHeight: 24, fontSize: 15, marginBottom: 20 },
    pageContainer: { borderRadius: 15, marginBottom: 20, minHeight: 450, overflow: 'hidden' },
    pageGradient: { padding: 20 },
    textContent: { color: theme.text, lineHeight: 28, fontSize: 16, textAlign: 'justify', height: 360 },
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
    ratingLabel: { color: theme.text, fontSize: 16, fontWeight: '600', marginBottom: 12 },
    starsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
    star: { fontSize: 32 },
    reviewInput: { 
      backgroundColor: theme.card, 
      borderRadius: 10, 
      padding: 12, 
      color: theme.text, 
      fontSize: 14,
      minHeight: 100,
      textAlignVertical: 'top',
      marginBottom: 16
    },
    submitBtn: { 
      backgroundColor: '#667eea', 
      borderRadius: 10, 
      padding: 14, 
      alignItems: 'center' 
    },
    submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
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
  const progress = duration > 0 ? (position / duration) * 100 : 0;

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

  const formatTime = (millis: number) => {
    const min = Math.floor(millis / 60000);
    const sec = Math.floor((millis % 60000) / 1000);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
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
      await ApiService.rateStory(story._id || story.id, finalRating, review || undefined);
      
      Alert.alert('Success', 'Thank you for your rating!');
      // Refresh reviews and user rating
      await fetchStoryDetails();
      await fetchUserRating();
      setRating(0);
      setReview('');
    } catch (error: any) {
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
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Library</Text>
          </TouchableOpacity>
          <View style={styles.headerRow}>
            <Text style={styles.title}>{story.title}</Text>
            <TouchableOpacity onPress={handleToggleFavorite} style={styles.favoriteBtn}>
              <Text style={{ fontSize: 28, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 }}>
                {isFavorited ? '❤️' : '🤍'}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.author}>by {story.author || 'StoryByte'}</Text>
        </LinearGradient>

        <View style={styles.content}>
          <View style={styles.playerCard}>
            <LinearGradient
              colors={['#667eea30', '#764ba230']}
              start={{ x: 0, y: 0 }} 
              end={{ x: 1, y: 1 }}
              style={styles.playerGradient}
            >
              <View style={styles.progressBarBg}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
              <View style={styles.timeRow}>
                <Text style={styles.timeLabel}>{formatTime(position)}</Text>
                <Text style={styles.timeLabel}>{formatTime(duration)}</Text>
              </View>

              <TouchableOpacity style={styles.playBtn} onPress={onPlayPause} activeOpacity={0.8}>
                <LinearGradient 
                  colors={isPlaying ? ['#ec4899', '#8b5cf6'] : ['#667eea', '#764ba2']} 
                  start={{ x: 0, y: 0 }} 
                  end={{ x: 1, y: 1 }}
                  style={styles.playGradient}
                >
                  <View style={styles.playIconContainer}>
                    <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶'}</Text>
                  </View>
                  <Text style={styles.playText}>{isPlaying ? 'PAUSE' : 'LISTEN NOW'}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </View>

          <View style={styles.statsRow}>
            <LinearGradient
              colors={isDark ? ['#10b98130', 'rgba(255,255,255,0.05)'] : ['#10b98130', 'rgba(0,0,0,0.03)']}
              start={{ x: 0, y: 0 }} 
              end={{ x: 1, y: 1 }}
              style={styles.statsGradient}
            >
            <View style={styles.statItem}>
              <Text style={styles.statValue}>⭐ {storyData.averageRating?.toFixed(1) || '0.0'}</Text>
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
          <Text style={styles.description}>{storyData.description || 'No description available'}</Text>
          
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
                  <Text style={styles.textContent}>{pages[currentPage]}</Text>
                  
                  <View style={styles.pagination}>
                    <TouchableOpacity 
                      style={[styles.pageBtn, currentPage === 0 && styles.pageBtnDisabled]}
                      onPress={() => setCurrentPage(Math.max(0, currentPage - 1))}
                      disabled={currentPage === 0}
                    >
                      <Text style={styles.pageBtnText}>← Previous</Text>
                    </TouchableOpacity>
                    
                    <Text style={styles.pageInfo}>Page {currentPage + 1} of {pages.length}</Text>
                    
                    <TouchableOpacity 
                      style={[styles.pageBtn, currentPage === pages.length - 1 && styles.pageBtnDisabled]}
                      onPress={() => setCurrentPage(Math.min(pages.length - 1, currentPage + 1))}
                      disabled={currentPage === pages.length - 1}
                    >
                      <Text style={styles.pageBtnText}>Next →</Text>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </View>
            </>
          )}

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

          <Text style={styles.sectionTitle}>Rate & Review</Text>
          <View style={styles.ratingContainer}>
            <LinearGradient
              colors={['#8b5cf620', '#667eea20']}
              start={{ x: 0, y: 0 }} 
              end={{ x: 1, y: 1 }}
              style={styles.ratingGradient}
            >
            {/* {hasRated && (
              <View style={styles.yourRatingBox}>
                <Text style={styles.yourRatingLabel}>Your Rating: {userRating}/5</Text>
                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Text key={star} style={styles.star}>
                      {star <= userRating ? '⭐' : '☆'}
                    </Text>
                  ))}
                </View>
              </View>
            )} */}
            <Text style={styles.ratingLabel}>Your Rating</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                  <Text style={styles.star}>
                    {star <= (rating || userRating || 0) ? '⭐' : '☆'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <TextInput
              style={styles.reviewInput}
              placeholder="Write your review (optional)"
              placeholderTextColor="#666"
              value={review}
              onChangeText={setReview}
              multiline
              numberOfLines={4}
            />
            
            <TouchableOpacity 
              style={styles.submitBtn} 
              onPress={handleSubmitRating}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitBtnText}>Submit Rating</Text>
              )}
            </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};