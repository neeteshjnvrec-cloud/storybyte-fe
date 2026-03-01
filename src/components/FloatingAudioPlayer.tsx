import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions,
  ScrollView,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { useTheme, lightTheme, darkTheme } from '../hooks/useTheme';

const VolumeIcon = ({ color = '#fff' }: { color?: string }) => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <Path d="M11 5L6 9H2v6h4l5 4V5z" fill={color} />
    <Path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const ChevronDownIcon = ({ color = '#fff' }: { color?: string }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M6 9l6 6 6-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const SpeedIcon = ({ color = '#fff' }: { color?: string }) => (
  <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <Path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const COLLAPSED_HEIGHT = 70;
const EXPANDED_HEIGHT = SCREEN_HEIGHT * 0.6;

export const FloatingAudioPlayer: React.FC = () => {
  const { isDark } = useTheme();
  const theme = isDark ? darkTheme : lightTheme;
  
  
  const {
    currentStory,
    currentPage,
    isPlaying,
    position,
    duration,
    playbackSpeed,
    volume,
    isExpanded,
    togglePlayPause,
    nextPage,
    previousPage,
    seekTo,
    setSpeed,
    setVolume,
    goToPage,
    endSession,
    toggleExpanded,
  } = useAudioPlayer();

  const [pan] = useState(new Animated.ValueXY({ x: 0, y: SCREEN_HEIGHT - COLLAPSED_HEIGHT - 80 }));
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => !isExpanded,
    onMoveShouldSetPanResponder: () => !isExpanded,
    onPanResponderMove: (_, gesture) => {
      if (!isExpanded) {
        pan.setValue({ x: 0, y: gesture.moveY - COLLAPSED_HEIGHT / 2 });
      }
    },
    onPanResponderRelease: (_, gesture) => {
      // Allow dragging anywhere on screen
      const newY = Math.max(50, Math.min(SCREEN_HEIGHT - COLLAPSED_HEIGHT - 20, gesture.moveY));
      Animated.spring(pan, {
        toValue: { x: 0, y: newY },
        useNativeDriver: false,
      }).start();
    },
  });

  if (!currentStory) return null;

  const formatTime = (millis: number) => {
    const min = Math.floor(millis / 60000);
    const sec = Math.floor((millis % 60000) / 1000);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const progress = duration > 0 ? (position / duration) * 100 : 0;
  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];

  if (isExpanded) {
    return (
      <View style={styles.expandedContainer}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={toggleExpanded} />
        <View style={styles.expandedModal}>
          <LinearGradient
            colors={isDark ? ['rgba(40, 40, 45, 0.95)', 'rgba(30, 30, 35, 0.95)'] : ['rgba(255, 255, 255, 0.95)', 'rgba(240, 240, 245, 0.95)']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.expandedGradient}
          >
            {/* Fixed Header */}
            <View style={styles.expandedHeader}>
              <TouchableOpacity onPress={toggleExpanded} style={styles.collapseBtn}>
                <ChevronDownIcon color={isDark ? '#fff' : '#1a1a1a'} />
              </TouchableOpacity>
              <TouchableOpacity onPress={endSession} style={styles.endBtn}>
                <Text style={styles.endBtnText}>End Session</Text>
              </TouchableOpacity>
            </View>

            {/* Scrollable Content */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
              bounces={true}
              scrollEnabled={true}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={[styles.expandedTitle, { color: isDark ? '#fff' : '#1a1a1a' }]}>{currentStory.title}</Text>
              <Text style={[styles.expandedAuthor, { color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.6)' }]}>by {currentStory.author || 'StoryByte'}</Text>

              <View style={styles.pageIndicator}>
                <Text style={[styles.pageText, { color: isDark ? '#fff' : '#1a1a1a' }]}>Page {currentPage + 1}</Text>
                <Text style={[styles.pageSubtext, { color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.6)' }]}>
                  Page {currentPage + 1} of {currentStory.pages.length} • Click to read along
                </Text>
              </View>

              <View style={styles.controlsRow}>
                <View style={styles.speedControl}>
                  <TouchableOpacity onPress={() => setShowSpeedMenu(!showSpeedMenu)} style={styles.speedBtn}>
                    <Text style={[styles.speedText, { color: isDark ? '#fff' : '#1a1a1a' }]}>{playbackSpeed}x</Text>
                    <Svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <Path d="M6 9l6 6 6-6" stroke={isDark ? '#fff' : '#1a1a1a'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </Svg>
                  </TouchableOpacity>
                  {showSpeedMenu && (
                    <View style={[styles.speedMenu, { backgroundColor: theme.card }]}>
                      {speeds.map((speed) => (
                        <TouchableOpacity
                          key={speed}
                          onPress={() => { setSpeed(speed); setShowSpeedMenu(false); }}
                          style={[styles.speedOption, speed === playbackSpeed && styles.speedOptionActive]}
                        >
                          <Text style={[styles.speedOptionText, { color: speed === playbackSpeed ? (isDark ? '#fff' : '#1a1a1a') : theme.text }]}>
                            {speed}x
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                <View style={styles.volumeSection}>
                  <VolumeIcon color={isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.6)'} />
                  <View 
                    style={styles.customSliderContainer}
                    onStartShouldSetResponder={() => true}
                    onResponderGrant={(e) => {
                      const x = e.nativeEvent.locationX;
                      const width = 200;
                      const newVolume = Math.max(0, Math.min(1, x / width));
                      setVolume(newVolume);
                    }}
                    onResponderMove={(e) => {
                      const x = e.nativeEvent.locationX;
                      const width = 200;
                      const newVolume = Math.max(0, Math.min(1, x / width));
                      setVolume(newVolume);
                    }}
                  >
                    <View style={[styles.sliderTrack, { backgroundColor: isDark ? 'rgba(255,255,255,0.3)' : theme.border }]}>
                      <View style={[styles.sliderFill, { width: `${volume * 100}%`, backgroundColor: isDark ? '#fff' : '#1a1a1a' }]} />
                    </View>
                    <View style={[styles.sliderThumb, { left: `${volume * 100}%`, backgroundColor: '#fff' }]} />
                  </View>
                  <Text style={[styles.volumeText, { color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.6)' }]}>{Math.round(volume * 100)}%</Text>
                </View>
              </View>

              <View style={styles.progressSection}>
                <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
                  <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: isDark ? '#fff' : '#1a1a1a' }]} />
                  <View style={[styles.progressThumb, { left: `${progress}%`, backgroundColor: '#fff' }]} />
                </View>
                <View style={styles.timeRow}>
                  <Text style={[styles.timeText, { color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.6)' }]}>{formatTime(position)}</Text>
                  <Text style={[styles.timeText, { color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.6)' }]}>{formatTime(duration)}</Text>
                </View>
              </View>

              <View style={styles.mainControls}>
                <TouchableOpacity onPress={previousPage} style={styles.controlBtn}>
                  <Text style={[styles.controlIcon, { color: isDark ? '#fff' : '#1a1a1a' }]}>◀◀</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => seekTo(Math.max(0, position - 10000))} style={styles.controlBtn}>
                  <Text style={[styles.controlIcon, { color: isDark ? '#fff' : '#1a1a1a' }]}>⟲</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={togglePlayPause} style={[styles.playButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(102, 126, 234, 0.15)' }]}>
                  <Text style={[styles.playButtonIcon, { color: isDark ? '#fff' : '#1a1a1a' }]}>{isPlaying ? '❚❚' : '▶'}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => seekTo(Math.min(duration, position + 10000))} style={styles.controlBtn}>
                  <Text style={[styles.controlIcon, { color: isDark ? '#fff' : '#1a1a1a' }]}>⟳</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={nextPage} style={styles.controlBtn}>
                  <Text style={[styles.controlIcon, { color: isDark ? '#fff' : '#1a1a1a' }]}>▶▶</Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.pageListTitle, { color: isDark ? '#fff' : '#1a1a1a' }]}>Pages</Text>

              {currentStory.pages.map((page, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => goToPage(index)}
                  style={[
                    styles.pageItem,
                    { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' },
                    index === currentPage && { backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)' },
                  ]}
                >
                  <Text style={[
                    styles.pageItemText,
                    { color: isDark ? '#fff' : '#1a1a1a' },
                  ]}>
                    Page {index + 1}
                  </Text>
                  <Text style={[
                    styles.pageItemDuration,
                    { color: isDark ? '#fff' : '#1a1a1a' },
                  ]}>
                    {formatTime(page.duration)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </LinearGradient>
        </View>
      </View>
    );
  }

  return (
    <Animated.View
      style={[styles.collapsedContainer, { transform: [{ translateY: pan.y }] }]}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity activeOpacity={0.9} onPress={toggleExpanded} style={styles.collapsedTouchable}>
        <LinearGradient
          colors={isDark ? ['rgba(40, 40, 45, 0.95)', 'rgba(30, 30, 35, 0.95)'] : ['rgba(255, 255, 255, 0.95)', 'rgba(240, 240, 245, 0.95)']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.collapsedGradient}
        >
          <View style={[styles.dragHandle, { backgroundColor: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)' }]} />
          <View style={styles.collapsedContent}>
            <View style={styles.collapsedInfo}>
              <Text style={[styles.collapsedTitle, { color: isDark ? '#fff' : '#1a1a1a' }]} numberOfLines={1}>{currentStory.title}</Text>
              <Text style={[styles.collapsedSubtitle, { color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.6)' }]}>Page {currentPage + 1} of {currentStory.pages.length}</Text>
            </View>
            <View style={styles.collapsedControls}>
              <TouchableOpacity onPress={(e) => { e.stopPropagation(); }} style={styles.collapsedBtn}>
                <Text style={[styles.collapsedIcon, { color: isDark ? '#fff' : '#1a1a1a' }]}>•••</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={(e) => { e.stopPropagation(); previousPage(); }} style={styles.collapsedBtn}>
                <Text style={[styles.collapsedIcon, { color: isDark ? '#fff' : '#1a1a1a' }]}>◀◀</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={(e) => { e.stopPropagation(); seekTo(Math.max(0, position - 10000)); }} style={styles.collapsedBtn}>
                <Text style={[styles.collapsedIcon, { color: isDark ? '#fff' : '#1a1a1a' }]}>⟲</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={(e) => {
                  e.stopPropagation();
                  togglePlayPause();
                }} 
                style={[styles.collapsedPlayBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(102, 126, 234, 0.15)' }]}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={[styles.collapsedPlayIcon, { color: isDark ? '#fff' : '#1a1a1a' }]}>{isPlaying ? '❚❚' : '▶'}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={(e) => { e.stopPropagation(); seekTo(Math.min(duration, position + 10000)); }} style={styles.collapsedBtn}>
                <Text style={[styles.collapsedIcon, { color: isDark ? '#fff' : '#1a1a1a' }]}>⟳</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={(e) => { e.stopPropagation(); nextPage(); }} style={styles.collapsedBtn}>
                <Text style={[styles.collapsedIcon, { color: isDark ? '#fff' : '#1a1a1a' }]}>▶▶</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={[styles.collapsedProgress, { backgroundColor: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.1)' }]}>
            <View style={[styles.collapsedProgressFill, { width: `${progress}%`, backgroundColor: isDark ? '#fff' : '#1a1a1a' }]} />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  // Collapsed
  collapsedContainer: { position: 'absolute', left: '7%', right: '7%', height: COLLAPSED_HEIGHT, zIndex: 1000 },
  collapsedTouchable: { flex: 1, borderRadius: 35, overflow: 'hidden', elevation: 10 },
  collapsedGradient: { flex: 1, paddingHorizontal: 16, paddingVertical: 8 },
  dragHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 8 },
  collapsedContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  collapsedInfo: { flex: 1 },
  collapsedTitle: { fontSize: 14, fontWeight: '700' },
  collapsedSubtitle: { fontSize: 11, marginTop: 2 },
  collapsedControls: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  collapsedBtn: { padding: 6 },
  collapsedIcon: { fontSize: 14 },
  collapsedPlayBtn: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  collapsedPlayIcon: { fontSize: 12, fontWeight: '900' },
  collapsedProgress: { height: 3, borderRadius: 2, marginTop: 8, overflow: 'hidden' },
  collapsedProgressFill: { height: '100%' },

  // Expanded
  expandedContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 2000 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  expandedModal: { position: 'absolute', bottom: 80, left: '7%', right: '7%', height: EXPANDED_HEIGHT, borderRadius: 30, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10 },
  expandedGradient: { flex: 1 },
  expandedHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  collapseBtn: { padding: 8 },
  collapseBtnText: { fontSize: 20, color: '#1a1a1a' },
  endBtn: { backgroundColor: '#ef4444', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  endBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },

  // Scroll Content
  scrollContent: { padding: 24, paddingBottom: 60 },
  expandedTitle: { fontSize: 28, fontWeight: '800', marginBottom: 8 },
  expandedAuthor: { fontSize: 16, marginBottom: 24 },
  pageIndicator: { backgroundColor: 'rgba(102, 126, 234, 0.1)', padding: 16, borderRadius: 12, marginBottom: 16 },
  pageText: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  pageSubtext: { fontSize: 14 },
  controlsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 16 },
  speedControl: { position: 'relative' },
  speedBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, gap: 6, width: 70, justifyContent: 'center' },
  speedText: { fontWeight: '700', fontSize: 12 },
  speedMenu: { position: 'absolute', top: 50, left: 0, borderRadius: 10, padding: 8, elevation: 5, zIndex: 100, minWidth: 80 },
  speedOption: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, minWidth: 60 },
  speedOptionActive: { backgroundColor: 'rgba(255, 255, 255, 0.2)' },
  speedOptionText: { fontSize: 10, fontWeight: '600' },
  volumeSection: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  volumeLabel: { fontSize: 12, width: 50 },
  customSliderContainer: { flex: 0, width: 120, height: 20, justifyContent: 'center' },
  sliderTrack: { height: 3, borderRadius: 1.5, overflow: 'hidden' },
  sliderFill: { height: 3, backgroundColor: '#fff', borderRadius: 1.5 },
  sliderThumb: { position: 'absolute', width: 12, height: 12, borderRadius: 6, marginLeft: -6, top: 4, borderWidth: 3, borderColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.3, shadowRadius: 2, elevation: 3 },
  sliderWrapper: { flex: 1 },
  volumeSlider: { 
    flex: 1, 
    height: 6,
  },
  volumeText: { fontSize: 12, width: 45, textAlign: 'right' },
  progressSection: { marginBottom: 24 },
  progressBar: { height: 6, borderRadius: 3, position: 'relative' },
  progressFill: { height: '100%' },
  progressThumb: { position: 'absolute', width: 12, height: 12, borderRadius: 6, marginLeft: -6, top: -3, borderWidth: 3, borderColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.3, shadowRadius: 2, elevation: 3 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  timeText: { fontSize: 12 },
  mainControls: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 16, marginBottom: 32 },
  controlBtn: { width: 48, height: 48, justifyContent: 'center', alignItems: 'center' },
  controlIcon: { fontSize: 18 },
  playButton: { width: 32, height: 32, borderRadius: 16, overflow: 'hidden', elevation: 8, justifyContent: 'center', alignItems: 'center' },
  playButtonIcon: { fontSize: 18, fontWeight: '900' },
  pageListTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  pageItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 12, marginBottom: 8 },
  pageItemActive: { backgroundColor: 'rgba(255,255,255,0.2)' },
  pageItemText: { fontSize: 16, fontWeight: '600' },
  pageItemTextActive: { color: '#fff' },
  pageItemDuration: { fontSize: 14 },
});