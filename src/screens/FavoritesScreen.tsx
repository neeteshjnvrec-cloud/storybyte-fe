import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import ApiService from '../services/api';
import { Story } from '../types';
import { APP_COLORS, APP_SPACING, APP_TYPOGRAPHY, APP_BORDER_RADIUS } from '../constants/appTheme';
import { useTheme, lightTheme, darkTheme } from '../hooks/useTheme';

export const FavoritesScreen = ({ navigation }: any) => {
  const { isDark } = useTheme();
  const theme = isDark ? darkTheme : lightTheme;
  const [favorites, setFavorites] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

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
    storyTitle: {
      ...APP_TYPOGRAPHY.h3,
      color: theme.text,
      fontWeight: '700' as const,
      marginBottom: 8,
    },
    storyDescription: {
      ...APP_TYPOGRAPHY.body,
      color: theme.textSecondary,
      marginBottom: 12,
      lineHeight: 20,
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
  });

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const response = await ApiService.getFavorites();
      setFavorites(response.favorites);
    } catch (error) {
      console.error('Failed to load favorites:', error);
    } finally {
      setLoading(false);
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
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={APP_COLORS.primary} />
      </View>
    );
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
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

