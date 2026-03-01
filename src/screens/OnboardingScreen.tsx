import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
  Animated,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { HeadphonesIcon, BookOpenIcon, StarIcon, PhoneIcon, BookmarkIcon, LightningIcon, HeartIcon, TargetIcon, ChartIcon } from '../components/Icons';
import { Logo } from '../components';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../constants/theme';
import { trackOnboardingCompleted, trackOnboardingSkipped } from '../utils/analytics';

const { width } = Dimensions.get('window');

interface OnboardingScreenProps {
  onComplete: () => void;
}

const slides = [
  {
    id: '1',
    title: 'Discover Stories\nThat Move You',
    description: 'Explore thousands of audiobooks across every genre. From thrilling mysteries to heartwarming romances.',
    features: [
      { icon: 'headphones', text: 'Premium audio quality' },
      { icon: 'book', text: 'Unlimited listening' },
      { icon: 'star', text: 'Curated collections' },
    ],
  },
  {
    id: '2',
    title: 'Listen Anywhere,\nAnytime',
    description: 'Your stories follow you everywhere. Seamless playback with offline downloads and smart bookmarks.',
    features: [
      { icon: 'phone', text: 'Offline downloads' },
      { icon: 'bookmark', text: 'Auto-bookmark progress' },
      { icon: 'lightning', text: 'Fast streaming' },
    ],
  },
  {
    id: '3',
    title: 'Your Personal\nAudio Library',
    description: 'Build your collection, track your favorites, and get personalized recommendations.',
    features: [
      { icon: 'heart', text: 'Save favorites' },
      { icon: 'target', text: 'Smart recommendations' },
      { icon: 'chart', text: 'Track your journey' },
    ],
  },
];

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<FlatList>(null);

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    setCurrentIndex(viewableItems[0]?.index || 0);
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollTo = () => {
    if (currentIndex < slides.length - 1) {
      slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      trackOnboardingCompleted();
      onComplete();
    }
  };

  const renderSlide = ({ item }: { item: typeof slides[0] }) => (
    <View style={[styles.slide, { width }]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.slideContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoContainer}>
          <Logo size={160} variant="icon" showLogo={true} />
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>

        <View style={styles.featuresContainer}>
          {item.features.map((feature, index) => {
            // Assign specific colors based on icon type
            const iconColor = 
              feature.icon === 'headphones' ? '#10b981' : // green for audio
              feature.icon === 'phone' ? '#f59e0b' : // orange for offline
              feature.icon === 'heart' ? '#ec4899' : // pink for heart
              feature.icon === 'bookmark' ? '#06b6d4' : // cyan for bookmark
              feature.icon === 'book' ? '#667eea' : // purple for book
              feature.icon === 'star' ? '#f59e0b' : // orange for star
              feature.icon === 'lightning' ? '#fbbf24' : // bright yellow for lightning
              feature.icon === 'target' ? '#667eea' : // purple for target
              '#10b981'; // green for chart
            
            const IconComponent = 
              feature.icon === 'headphones' ? HeadphonesIcon :
              feature.icon === 'book' ? BookOpenIcon :
              feature.icon === 'star' ? StarIcon :
              feature.icon === 'phone' ? PhoneIcon :
              feature.icon === 'bookmark' ? BookmarkIcon :
              feature.icon === 'lightning' ? LightningIcon :
              feature.icon === 'heart' ? HeartIcon :
              feature.icon === 'target' ? TargetIcon :
              ChartIcon;
            
            return (
              <View key={index} style={styles.featureItem}>
                <View style={styles.iconContainer}>
                  <IconComponent color={iconColor} size={20} />
                </View>
                <Text style={styles.featureText}>{feature.text}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
    </View>
  );

  const Paginator = () => (
    <View style={styles.paginatorContainer}>
      {slides.map((_, index) => {
        const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
        
        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [8, 24, 8],
          extrapolate: 'clamp',
        });

        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.3, 1, 0.3],
          extrapolate: 'clamp',
        });

        return (
          <Animated.View
            key={index}
            style={[styles.dot, { width: dotWidth, opacity }]}
          />
        );
      })}
    </View>
  );

  return (
    <LinearGradient
      colors={[COLORS.gradientStart, COLORS.gradientEnd]}
      style={styles.container}
    >
      <FlatList
        data={slides}
        renderItem={renderSlide}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        ref={slidesRef}
      />

      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => {
            trackOnboardingSkipped();
            onComplete();
          }} 
          style={styles.skipButton}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.footer, currentIndex === slides.length - 1 && styles.footerLastSlide]}>
        <Paginator />
        
        <TouchableOpacity style={styles.continueButton} onPress={scrollTo}>
          <Text style={styles.continueButtonText}>
            {currentIndex === slides.length - 1 ? 'Get Started' : 'Continue'}
          </Text>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>

        {currentIndex === slides.length - 1 && (
          <TouchableOpacity style={styles.exploreButton} onPress={onComplete}>
            <Text style={styles.exploreButtonText}>Explore Stories</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.footerText}>
          {currentIndex === slides.length - 1
            ? 'Join thousands discovering their next favorite story'
            : 'Swipe to continue or tap the buttons above'}
        </Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: SPACING.lg,
    paddingTop: 60,
    paddingBottom: SPACING.md,
    zIndex: 999,
    elevation: 10,
  },
  skipButton: {
    padding: SPACING.sm,
  },
  skipText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    opacity: 0.7,
  },
  slide: {
    width,
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  slideContent: {
    paddingHorizontal: SPACING.xl,
    paddingTop: 120,
    paddingBottom: 200,
  },
  logoContainer: {
    marginBottom: SPACING.xs,
    alignSelf: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
  },
  title: {
    ...TYPOGRAPHY.h1,
    fontSize: 28,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.md,
    lineHeight: 30,
  },
  description: {
    ...TYPOGRAPHY.body,
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.md,
    lineHeight: 20,
    paddingHorizontal: SPACING.sm,
  },
  featuresContainer: {
    width: '100%',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.sm,
    height: 50,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  iconContainer: {
    width: 30,
    height: 30,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    textAlign: 'center',
    fontSize: 14,
  },
  footer: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.xl,
    gap: SPACING.sm,
  },
  footerLastSlide: {
    bottom: 20,
  },
  paginatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: SPACING.lg,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.text,
  },
  continueButton: {
    backgroundColor: COLORS.text,
    borderRadius: BORDER_RADIUS.md,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  continueButtonText: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primary,
  },
  arrow: {
    fontSize: 20,
    color: COLORS.primary,
  },
  exploreButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BORDER_RADIUS.md,
    height: 50,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exploreButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
  },
  footerText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
});
