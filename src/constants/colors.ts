// Beautiful Light Color Theme for StoryByte

export const COLORS = {
  // Background Colors
  background: '#F8F9FE',
  cardBackground: '#FFFFFF',
  headerBackground: '#FFFFFF',
  
  // Primary Colors - Soft Purple/Blue
  primary: '#7C3AED',
  primaryLight: '#A78BFA',
  primaryLighter: '#E9D5FF',
  
  // Accent Colors - Multiple lovely colors for story cards
  accent1: '#FF6B9D', // Soft Pink
  accent2: '#4ECDC4', // Turquoise
  accent3: '#FFD93D', // Sunny Yellow
  accent4: '#95E1D3', // Mint Green
  accent5: '#FF8B94', // Coral
  accent6: '#A8E6CF', // Light Green
  accent7: '#FFB6C1', // Light Pink
  accent8: '#87CEEB', // Sky Blue
  
  // Text Colors
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  textWhite: '#FFFFFF',
  
  // Status Colors
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  
  // Gradient Colors
  gradients: {
    purple: ['#A78BFA', '#7C3AED'],
    pink: ['#FCA5A5', '#F87171'],
    blue: ['#93C5FD', '#60A5FA'],
    green: ['#86EFAC', '#4ADE80'],
    orange: ['#FDBA74', '#FB923C'],
    teal: ['#5EEAD4', '#2DD4BF'],
  },
  
  // Shadow
  shadow: 'rgba(0, 0, 0, 0.08)',
  shadowDark: 'rgba(0, 0, 0, 0.15)',
};

// Story card colors - cycle through these
export const STORY_CARD_COLORS = [
  { bg: '#FFF0F5', border: '#FF6B9D', text: '#C7365F' }, // Pink
  { bg: '#E0F7F6', border: '#4ECDC4', text: '#2A9D8F' }, // Turquoise
  { bg: '#FFF9E6', border: '#FFD93D', text: '#D4A017' }, // Yellow
  { bg: '#E8F8F5', border: '#95E1D3', text: '#48C9B0' }, // Mint
  { bg: '#FFE8E8', border: '#FF8B94', text: '#E74C3C' }, // Coral
  { bg: '#E8F8F0', border: '#A8E6CF', text: '#52BE80' }, // Green
  { bg: '#FFF0F6', border: '#FFB6C1', text: '#E91E63' }, // Light Pink
  { bg: '#E6F3FF', border: '#87CEEB', text: '#3498DB' }, // Sky Blue
];

export const getStoryCardColor = (index: number) => {
  return STORY_CARD_COLORS[index % STORY_CARD_COLORS.length];
};
