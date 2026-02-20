import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import ApiService from '../services/api';
import { Story } from '../types';
import { APP_COLORS, APP_SPACING, APP_TYPOGRAPHY, APP_BORDER_RADIUS } from '../constants/appTheme';
import { useTheme, lightTheme, darkTheme } from '../hooks/useTheme';
import { Loader } from '../components';

export const FavoritesScreen = ({ navigation }: any) => {
  const { isDark } = useTheme();
  const theme = isDark ? darkTheme : lightTheme;
  const [favorites, setFavorites] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const styles = StyleSheet.create({
    container: { 
      flex: 1, 
      backgroundColor: theme.background 
    },
    loadingContainer: { 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center', 
      backgroundColor: theme.background 
    },
    header: { 
      padding: APP_SPACING.lg,
      backgroundColor: theme.surface,
      shadowColor: APP_COLORS.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 8,
      elevation: 4,
    },
    headerTitle: { 
      ...APP_TYPOGRAPHY.h2, 
      color: theme.text, 
      fontWeight: '700' as const,
      marginBottom: 4,
    },
    headerSubtitle: {
      ...APP_TYPOGRAPHY.bodySmall,
      color: theme.textSecondary,
    },
    list: { 
      padding: APP_SPACING.md 
    },
    storyCard: {
      marginBottom: APP_SPACING.md,
      marginHorizontal: APP_SPACING.sm,
      borderRadius: APP_BORDER_RADIUS.lg,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: 8,
    },
    gradientBackground: {
      borderRadius: APP_BORDER_RADIUS.lg,
      padding: APP_SPACING.lg,
      position: 'relative',
    },
    accentBar: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: 8,
      borderTopLeftRadius: APP_BORDER_RADIUS.lg,
      borderBottomLeftRadius: APP_BORDER_RADIUS.lg,
    },
    cardContent: {
      marginLeft: 16,
    },
    storyContent: {
      flex: 1,
    },
    titleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
      paddingRight: 50,
    },
    languageBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: APP_BORDER_RADIUS.sm,
      borderWidth: 2,
    },
    languageText: {
      ...APP_TYPOGRAPHY.caption,
      fontWeight: '700' as const,
    },
    storyTitle: {
      ...APP_TYPOGRAPHY.h3,
      color: theme.text,
      fontWeight: '700' as const,
      marginBottom: 8,
      flex: 1,
      marginRight: 8,
    },
    storyDescription: {
      ...APP_TYPOGRAPHY.body,
      color: theme.textSecondary,
      marginBottom: 12,
      lineHeight: 20,
    },
    storyMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flexWrap: 'wrap',
    },
    ratingBadge: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: APP_BORDER_RADIUS.md,
      borderWidth: 2,
    },
    playsBadge: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: APP_BORDER_RADIUS.md,
      borderWidth: 2,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    metaInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    metaText: {
      ...APP_TYPOGRAPHY.bodySmall,
      color: theme.textSecondary,
      fontWeight: '600' as const,
    },
    categoryTag: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: APP_BORDER_RADIUS.md,
      borderWidth: 2,
    },
    categoryText: {
      ...APP_TYPOGRAPHY.bodySmall,
      fontWeight: '700' as const,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: APP_SPACING.xl,
    },
    emptyEmoji: {
      fontSize: 64,
      marginBottom: 16,
    },
    emptyText: {
      ...APP_TYPOGRAPHY.h3,
      color: theme.text,
      marginBottom: 8,
    },
    emptySubtext: {
      ...APP_TYPOGRAPHY.body,
      color: theme.textSecondary,
      textAlign: 'center',
    },
    favoriteButton: {
      position: 'absolute',
      top: 12,
      right: 12,
      width: 44,
      height: 44,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10,
    },
  });

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async (forceRefresh = false) => {
    // Skip if already have favorites and not forcing refresh
    if (!forceRefresh && favorites.length > 0 && !loading) {
      console.log('Using cached favorites, skipping API call');
      return;
    }
    
    try {
      console.log('Loading favorites...');
      const response = await ApiService.getFavorites();
      console.log('Favorites response:', response);
      console.log('Number of favorites:', response.favorites?.length || 0);
      setFavorites(response.favorites || []);
    } catch (error) {
      console.error('Failed to load favorites:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadFavorites(true);
  };

  const handleToggleFavorite = async (storyId: string) => {
    try {
      await ApiService.toggleFavorite(storyId);
      // Remove from list
      setFavorites(favorites.filter(story => story._id !== storyId && story.id !== storyId));
    } catch (error) {
      console.error('Failed to remove favorite:', error);
      Alert.alert('Error', 'Failed to remove from favorites');
    }
  };

  const renderStory = ({ item, index }: { item: Story; index: number }) => {
    const accentColors = [
      APP_COLORS.accent1, APP_COLORS.accent2, APP_COLORS.accent3, APP_COLORS.accent4,
      APP_COLORS.accent5, APP_COLORS.accent6, APP_COLORS.accent7, APP_COLORS.accent8
    ];
    const accentColor = accentColors[index % accentColors.length];
    
    // Create vibrant gradient colors based on accent color - much more visible
    const gradientColors: [string, string, string] = [
      accentColor + '60', // Strong visible tint
      accentColor + '30', // Medium tint
      accentColor + '10'  // Light tint (instead of white)
    ];

    return (
      <TouchableOpacity
        style={styles.storyCard}
        onPress={() => navigation.navigate('StoryDetail', { story: item })}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBackground}
        >
          <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
          <TouchableOpacity 
            style={styles.favoriteButton}
            onPress={() => handleToggleFavorite(item._id || item.id)}
          >
            <Text style={{ fontSize: 24 }}>❤️</Text>
          </TouchableOpacity>
          <View style={styles.storyContent}>
            <View style={styles.titleRow}>
              <Text style={styles.storyTitle} numberOfLines={2}>{item.title}</Text>
              <View style={[styles.languageBadge, { backgroundColor: accentColor, borderColor: accentColor }]}>
                <Text style={[styles.languageText, { color: '#FFFFFF' }]}>
                  {item.language.toUpperCase()}
                </Text>
              </View>
            </View>
            <Text style={styles.storyDescription} numberOfLines={2}>
              {item.description}
            </Text>
            <View style={styles.storyMeta}>
              <View style={[styles.ratingBadge, { backgroundColor: accentColor + '80', borderColor: accentColor }]}>
                <Text style={[styles.metaText, { color: '#FFFFFF', fontWeight: '700' }]}>
                  ⭐ {item.averageRating?.toFixed(1) || '0.0'}
                </Text>
              </View>
              <View style={[styles.playsBadge, { backgroundColor: accentColor + '80', borderColor: accentColor }]}>
                <Text style={[styles.metaText, { color: '#FFFFFF', fontWeight: '700' }]}>
                  ▶ {item.plays || 0}
                </Text>
              </View>
              <View style={[styles.categoryTag, { backgroundColor: accentColor + '50', borderColor: accentColor }]}>
                <Text style={[styles.categoryText, { color: '#FFFFFF', fontWeight: '700' }]}>{item.category || 'Story'}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return <Loader message="Loading favorites..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>❤️ Favorites</Text>
        <Text style={styles.headerSubtitle}>{favorites.length} saved stories</Text>
      </View>
      {favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>📚</Text>
          <Text style={styles.emptyText}>No favorites yet</Text>
          <Text style={styles.emptySubtext}>Start exploring stories to add them here!</Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderStory}
          keyExtractor={(item) => item._id || item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={APP_COLORS.primary}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

