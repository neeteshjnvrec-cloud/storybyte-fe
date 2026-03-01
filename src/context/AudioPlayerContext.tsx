import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import { Sound } from 'expo-av/build/Audio';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from '../services/api';
import { transformStoryForPlayer } from '../utils/audioUtils';
import { trackStoryPlayed, trackStoryPaused, trackStoryCompleted, trackPageChanged, trackPlaybackSpeedChanged, trackVolumeChanged } from '../utils/analytics';

interface Page {
  pageNumber: number;
  audioUrl: string;
  duration: number;
  text?: string;
}

interface Story {
  _id?: string;
  id?: string;
  title: string;
  author?: string;
  coverImage?: string;
  pages: Page[];
}

interface AudioPlayerContextType {
  currentStory: Story | null;
  currentPage: number;
  isPlaying: boolean;
  position: number;
  duration: number;
  playbackSpeed: number;
  volume: number;
  isExpanded: boolean;
  playerPosition: { x: number; y: number };
  toastVisible: boolean;
  toastMessage: string;
  
  loadStory: (story: Story, startPage?: number) => Promise<void>;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  togglePlayPause: () => Promise<void>;
  nextPage: () => Promise<void>;
  previousPage: () => Promise<void>;
  seekTo: (position: number) => Promise<void>;
  setSpeed: (speed: number) => void;
  setVolume: (volume: number) => Promise<void>;
  goToPage: (pageNumber: number) => Promise<void>;
  endSession: () => Promise<void>;
  toggleExpanded: () => void;
  setPlayerPosition: (position: { x: number; y: number }) => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export const AudioPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentStory, setCurrentStory] = useState<Story | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [volume, setVolumeState] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);
  const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  const soundRef = useRef<Sound | null>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const saveProgressInterval = useRef<NodeJS.Timeout | null>(null);
  const lastSaveTime = useRef<number>(0);

  useEffect(() => {
    setupAudio();
    loadSavedVolume();
    return () => {
      cleanup();
    };
  }, []);

  // Auto-save progress every 30 seconds when playing (silently, no toast)
  useEffect(() => {
    if (isPlaying && currentStory) {
      const now = Date.now();
      if (now - lastSaveTime.current >= 30000) {
        console.log('⏰ 30 seconds elapsed, auto-saving...');
        lastSaveTime.current = now;
        saveProgress(false); // false = no toast
      }
    }
  }, [position]); // Trigger on position updates

  const loadSavedVolume = async () => {
    try {
      const savedVolume = await AsyncStorage.getItem('audioVolume');
      if (savedVolume !== null) {
        const vol = parseFloat(savedVolume);
        setVolumeState(vol);
        if (soundRef.current) {
          await soundRef.current.setVolumeAsync(vol);
        }
      }
    } catch (error) {
      console.error('Failed to load saved volume:', error);
    }
  };

  const setupAudio = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.error('Failed to setup audio:', error);
    }
  };

  const cleanup = async () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
    }
  };

  const loadStory = async (story: Story, startPage: number = 0) => {
    try {
      console.log('🎵 AudioPlayer: loadStory called with:', story.title);
      await cleanup();
      const transformedStory = transformStoryForPlayer(story);
      console.log('🎵 AudioPlayer: Story transformed, pages:', transformedStory.pages?.length);
      setCurrentStory(transformedStory);
      setCurrentPage(startPage);
      await loadPage(transformedStory, startPage);
      
      // Track play count
      const storyId = story._id || story.id;
      if (storyId) {
        ApiService.trackPlay(storyId, 0, 0, false).catch(err => 
          console.error('Failed to track play:', err)
        );
      }
      
      console.log('🎵 AudioPlayer: Story loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load story:', error);
    }
  };

  const loadPage = async (story: Story, pageNumber: number) => {
    try {
      console.log('🎵 AudioPlayer: loadPage called, page:', pageNumber);
      setIsLoading(true);
      
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      const page = story.pages[pageNumber];
      if (!page || !page.audioUrl) {
        console.error('❌ Page or audio URL not found');
        setIsLoading(false);
        return;
      }

      console.log('🎵 AudioPlayer: Loading audio from:', page.audioUrl);
      
      const { sound } = await Audio.Sound.createAsync(
        { uri: page.audioUrl },
        { 
          shouldPlay: true, 
          rate: playbackSpeed,
          volume: volume
        },
        onPlaybackStatusUpdate
      );

      soundRef.current = sound;
      
      // Get actual audio duration from the loaded sound
      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        const actualDuration = status.durationMillis || 0;
        const totalPages = story.pages.length;
        
        // Calculate duration per page based on actual audio length
        const durationPerPage = Math.floor(actualDuration / totalPages);
        const startPosition = pageNumber * durationPerPage;
        
        // Check if we're trying to play beyond the audio length
        if (startPosition >= actualDuration) {
          console.log('⚠️ Page position exceeds audio duration, playing from start');
          await sound.setPositionAsync(0);
          setPosition(0);
          setDuration(durationPerPage);
        } else {
          await sound.setPositionAsync(startPosition);
          setPosition(startPosition);
          // Set duration as the segment for this page
          const remainingDuration = actualDuration - startPosition;
          setDuration(Math.min(durationPerPage, remainingDuration));
        }
      }
      
      setIsLoading(false);
      console.log('🎵 AudioPlayer: Audio loaded');
    } catch (error) {
      console.error('❌ Failed to load page:', error);
      setIsLoading(false);
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setDuration(status.durationMillis || 0);
      setIsPlaying(status.isPlaying);

      if (status.didJustFinish && !status.isLooping) {
        handlePageFinished();
      }
    }
  };

  const handlePageFinished = async () => {
    if (currentStory && currentPage < currentStory.pages.length - 1) {
      await nextPage();
    } else {
      // Story ended - stop playing and reset to first page
      setIsPlaying(false);
      setCurrentPage(0);
      await saveProgress();
    }
  };

  const play = async () => {
    try {
      if (soundRef.current) {
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded) {
          // If at end, restart from beginning
          if (status.durationMillis && status.positionMillis >= status.durationMillis - 100) {
            await soundRef.current.setPositionAsync(0);
            setPosition(0);
          }
          await soundRef.current.playAsync();
          setIsPlaying(true);
          
          // Track story played
          if (currentStory) {
            trackStoryPlayed(
              currentStory._id || currentStory.id || '',
              currentStory.title,
              'audio'
            );
          }
          
          // Show toast when user clicks play
          setToastVisible(false); // Reset first
          setTimeout(() => {
            setToastMessage('📖 Reading progress synced');
            setToastVisible(true);
          }, 100);
        }
      }
    } catch (error) {
      console.error('Failed to play:', error);
    }
  };

  const pause = async () => {
    try {
      if (soundRef.current) {
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded) {
          await soundRef.current.pauseAsync();
          setIsPlaying(false);
          await saveProgress();
          
          // Track story paused
          if (currentStory) {
            trackStoryPaused(
              currentStory._id || currentStory.id || '',
              status.positionMillis || 0
            );
          }
        }
      }
    } catch (error) {
      console.error('Failed to pause:', error);
    }
  };

  const togglePlayPause = async () => {
    if (isLoading) return; // Don't allow toggle while loading
    if (isPlaying) {
      await pause();
    } else {
      await play();
    }
  };

  const nextPage = async () => {
    if (currentStory && currentPage < currentStory.pages.length - 1) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      await loadPage(currentStory, newPage);
      if (isPlaying) {
        await play();
      }
      await saveProgress();
    }
  };

  const previousPage = async () => {
    if (currentPage > 0) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      await loadPage(currentStory!, newPage);
      if (isPlaying) {
        await play();
      }
      await saveProgress();
    }
  };

  const seekTo = async (positionMillis: number) => {
    try {
      if (soundRef.current) {
        await soundRef.current.setPositionAsync(positionMillis);
        setPosition(positionMillis);
      }
    } catch (error) {
      console.error('Failed to seek:', error);
    }
  };

  const setSpeed = async (speed: number) => {
    try {
      setPlaybackSpeed(speed);
      trackPlaybackSpeedChanged(speed);
      if (soundRef.current) {
        await soundRef.current.setRateAsync(speed, true);
      }
    } catch (error) {
      console.error('Failed to set speed:', error);
    }
  };

  const setVolume = async (vol: number) => {
    try {
      setVolumeState(vol);
      trackVolumeChanged(vol);
      await AsyncStorage.setItem('audioVolume', vol.toString());
      if (soundRef.current) {
        await soundRef.current.setVolumeAsync(vol);
      }
    } catch (error) {
      console.error('Failed to set volume:', error);
    }
  };

  const goToPage = async (pageNumber: number) => {
    if (isLoading) return; // Don't allow page change while loading
    if (currentStory && pageNumber >= 0 && pageNumber < currentStory.pages.length) {
      setCurrentPage(pageNumber);
      trackPageChanged(currentStory._id || currentStory.id || '', pageNumber);
      await loadPage(currentStory, pageNumber);
      await saveProgress();
    }
  };

  const saveProgress = async (showToast: boolean = false) => {
    if (currentStory) {
      try {
        const storyId = currentStory._id || currentStory.id;
        console.log('💾 Saving progress:', { storyId, page: currentPage, position });
        await ApiService.updateProgress(storyId!, currentPage, position);
        console.log('✅ Progress saved successfully');
        
        if (showToast) {
          console.log('🔔 Showing toast notification, Platform:', Platform.OS);
          setToastVisible(false); // Reset first
          setTimeout(() => {
            setToastMessage('📖 Reading progress synced');
            setToastVisible(true);
          }, 100);
          console.log('📱 Toast displayed');
        }
      } catch (error) {
        console.error('❌ Failed to save progress:', error);
      }
    }
  };

  const endSession = async () => {
    await pause();
    await saveProgress();
    await cleanup();
    setCurrentStory(null);
    setCurrentPage(0);
    setPosition(0);
    setDuration(0);
    setIsExpanded(false);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <AudioPlayerContext.Provider
      value={{
        currentStory,
        currentPage,
        isPlaying,
        position,
        duration,
        playbackSpeed,
        volume,
        isExpanded,
        playerPosition,
        toastVisible,
        toastMessage,
        loadStory,
        play,
        pause,
        togglePlayPause,
        nextPage,
        previousPage,
        seekTo,
        setSpeed,
        setVolume,
        goToPage,
        endSession,
        toggleExpanded,
        setPlayerPosition,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
};

export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error('useAudioPlayer must be used within AudioPlayerProvider');
  }
  return context;
};
