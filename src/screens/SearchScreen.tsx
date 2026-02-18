import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import ApiService from '../services/api';
import { Story } from '../types';
import { APP_COLORS, APP_SPACING, APP_TYPOGRAPHY, APP_BORDER_RADIUS } from '../constants/appTheme';

export const SearchScreen = ({ navigation }: any) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Story[]>([]);

  const handleSearch = async (text: string) => {
    setQuery(text);
    if (text.length > 2) {
      try {
        const response = await ApiService.searchStories(text);
        setResults(response.stories);
      } catch (error) {
        console.error('Search failed:', error);
      }
    } else {
      setResults([]);
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
        style={styles.resultItem}
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
              <Text style={styles.resultTitle} numberOfLines={2}>{item.title}</Text>
              <View style={[styles.languageBadge, { backgroundColor: accentColor, borderColor: accentColor }]}>
                <Text style={[styles.languageText, { color: '#FFFFFF' }]}>
                  {item.language.toUpperCase()}
                </Text>
              </View>
            </View>
            <Text style={styles.resultDescription} numberOfLines={2}>
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
              {item.category && (
                <View style={[styles.categoryTag, { backgroundColor: accentColor + '50', borderColor: accentColor }]}>
                  <Text style={[styles.categoryText, { color: '#FFFFFF', fontWeight: '700' }]}>{item.category}</Text>
                </View>
              )}
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🔍 Search</Text>
      </View>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search stories..."
          placeholderTextColor={APP_COLORS.textSecondary}
          value={query}
          onChangeText={handleSearch}
        />
      </View>
      {results.length === 0 && query.length > 2 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🔎</Text>
          <Text style={styles.emptyText}>No results found</Text>
          <Text style={styles.emptySubtext}>Try searching with different keywords</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          renderItem={renderStory}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: APP_COLORS.background 
  },
  header: {
    padding: APP_SPACING.lg,
    backgroundColor: APP_COLORS.surface,
    shadowColor: APP_COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTitle: {
    ...APP_TYPOGRAPHY.h2,
    color: APP_COLORS.primary,
    fontWeight: '700' as const,
  },
  searchContainer: { 
    padding: APP_SPACING.md,
    backgroundColor: APP_COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: APP_COLORS.divider,
  },
  searchInput: {
    backgroundColor: APP_COLORS.background,
    borderRadius: APP_BORDER_RADIUS.md,
    padding: APP_SPACING.md,
    color: APP_COLORS.text,
    ...APP_TYPOGRAPHY.body,
    borderWidth: 2,
    borderColor: APP_COLORS.primary + '20',
  },
  list: { 
    padding: APP_SPACING.md 
  },
  resultItem: {
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
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  storyContent: {
    marginLeft: APP_SPACING.sm,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: APP_SPACING.sm,
    gap: APP_SPACING.sm,
  },
  resultTitle: { 
    ...APP_TYPOGRAPHY.h3, 
    color: APP_COLORS.text,
    fontWeight: '700' as const,
    flex: 1,
  },
  languageBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    minWidth: 45,
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  languageText: {
    ...APP_TYPOGRAPHY.caption,
    fontWeight: '700' as const,
    fontSize: 11,
  },
  resultDescription: { 
    ...APP_TYPOGRAPHY.bodySmall, 
    color: APP_COLORS.textSecondary, 
    marginBottom: APP_SPACING.md,
    lineHeight: 20,
  },
  storyMeta: {
    flexDirection: 'row',
    gap: APP_SPACING.sm,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  ratingBadge: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  playsBadge: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  metaText: {
    ...APP_TYPOGRAPHY.caption,
    fontWeight: '700' as const,
    fontSize: 13,
  },
  categoryTag: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    marginLeft: 'auto',
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  categoryText: {
    ...APP_TYPOGRAPHY.caption,
    fontWeight: '700' as const,
    fontSize: 11,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: APP_SPACING.xl,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: APP_SPACING.md,
  },
  emptyText: {
    ...APP_TYPOGRAPHY.h3,
    color: APP_COLORS.text,
    marginBottom: APP_SPACING.xs,
  },
  emptySubtext: {
    ...APP_TYPOGRAPHY.bodySmall,
    color: APP_COLORS.textSecondary,
    textAlign: 'center',
  },
});
