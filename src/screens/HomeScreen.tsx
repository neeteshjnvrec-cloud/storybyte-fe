import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import ApiService from '../services/api';
import { Story } from '../types';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../constants/theme';
import { Logo } from '../components';

export const HomeScreen = ({ navigation }: any) => {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      const response = await ApiService.getStories({ page: 1, limit: 20 });
      setStories(response.stories);
    } catch (error) {
      console.error('Failed to load stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStory = ({ item }: { item: Story }) => (
    <TouchableOpacity
      style={styles.storyCard}
      onPress={() => navigation.navigate('StoryDetail', { story: item })}
    >
      <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.thumbnail}>
        <Text style={styles.thumbnailText}>{item.title[0]}</Text>
      </LinearGradient>
      <View style={styles.storyInfo}>
        <Text style={styles.storyTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.storyDescription} numberOfLines={2}>{item.description}</Text>
        <View style={styles.storyMeta}>
          <Text style={styles.metaText}>⭐ {item.averageRating.toFixed(1)}</Text>
          <Text style={styles.metaText}>▶ {item.plays}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Logo size={50} variant="icon" />
        <Text style={styles.headerTitle}>StoryByte</Text>
      </View>
      <FlatList
        data={stories}
        renderItem={renderStory}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: SPACING.lg, gap: SPACING.md },
  headerTitle: { ...TYPOGRAPHY.h2, color: COLORS.text },
  list: { padding: SPACING.md },
  storyCard: { flexDirection: 'row', backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.md, padding: SPACING.md, marginBottom: SPACING.md },
  thumbnail: { width: 80, height: 80, borderRadius: BORDER_RADIUS.sm, justifyContent: 'center', alignItems: 'center' },
  thumbnailText: { ...TYPOGRAPHY.h1, color: COLORS.text },
  storyInfo: { flex: 1, marginLeft: SPACING.md },
  storyTitle: { ...TYPOGRAPHY.h3, color: COLORS.text },
  storyDescription: { ...TYPOGRAPHY.bodySmall, color: COLORS.textSecondary, marginTop: SPACING.xs },
  storyMeta: { flexDirection: 'row', marginTop: SPACING.sm },
  metaText: { ...TYPOGRAPHY.caption, color: COLORS.textTertiary, marginRight: SPACING.md },
});
