import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { APP_COLORS, APP_SPACING, APP_TYPOGRAPHY, APP_BORDER_RADIUS } from '../constants/appTheme';

export const PlayerScreen = ({ route }: any) => {
  const { story } = route.params;
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[APP_COLORS.gradientStart, APP_COLORS.gradientEnd]} style={styles.gradient}>
        <View style={styles.content}>
          <View style={styles.artwork}>
            <Text style={styles.artworkText}>{story.title[0]}</Text>
          </View>
          <Text style={styles.title}>{story.title}</Text>
          <Text style={styles.category}>{story.category}</Text>
          <View style={styles.controls}>
            <TouchableOpacity style={styles.controlButton}>
              <Text style={styles.controlText}>⏮</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.playButton}
              onPress={() => setIsPlaying(!isPlaying)}
            >
              <Text style={styles.playText}>{isPlaying ? '⏸' : '▶'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton}>
              <Text style={styles.controlText}>⏭</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: APP_SPACING.lg },
  artwork: { width: 200, height: 200, borderRadius: APP_BORDER_RADIUS.xl, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: APP_SPACING.xl },
  artworkText: { fontSize: 80, color: APP_COLORS.text, fontWeight: 'bold' },
  title: { ...APP_TYPOGRAPHY.h1, color: APP_COLORS.text, textAlign: 'center' },
  category: { ...APP_TYPOGRAPHY.body, color: APP_COLORS.textSecondary, marginTop: APP_SPACING.sm },
  controls: { flexDirection: 'row', alignItems: 'center', marginTop: APP_SPACING.xxl },
  controlButton: { padding: APP_SPACING.md },
  controlText: { fontSize: 32, color: APP_COLORS.text },
  playButton: { width: 80, height: 80, borderRadius: 40, backgroundColor: APP_COLORS.text, justifyContent: 'center', alignItems: 'center', marginHorizontal: APP_SPACING.lg },
  playText: { fontSize: 32, color: APP_COLORS.primary },
});
