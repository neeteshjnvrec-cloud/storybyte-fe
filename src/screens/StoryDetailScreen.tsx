import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../constants/theme';

export const StoryDetailScreen = ({ route, navigation }: any) => {
  const { story } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.header}>
          <Text style={styles.title}>{story.title}</Text>
          <Text style={styles.category}>{story.category}</Text>
        </LinearGradient>
        <View style={styles.content}>
          <Text style={styles.description}>{story.description}</Text>
          <View style={styles.stats}>
            <Text style={styles.statText}>⭐ {story.averageRating.toFixed(1)}</Text>
            <Text style={styles.statText}>▶ {story.plays} plays</Text>
          </View>
          <TouchableOpacity
            style={styles.playButton}
            onPress={() => navigation.navigate('Player', { story })}
          >
            <Text style={styles.playButtonText}>▶ Play Story</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: SPACING.xl, minHeight: 200, justifyContent: 'flex-end' },
  title: { ...TYPOGRAPHY.h1, color: COLORS.text },
  category: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, marginTop: SPACING.xs },
  content: { padding: SPACING.lg },
  description: { ...TYPOGRAPHY.body, color: COLORS.text, lineHeight: 24 },
  stats: { flexDirection: 'row', marginTop: SPACING.lg },
  statText: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, marginRight: SPACING.lg },
  playButton: { backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.md, padding: SPACING.md, alignItems: 'center', marginTop: SPACING.xl },
  playButtonText: { ...TYPOGRAPHY.h3, color: COLORS.text },
});
