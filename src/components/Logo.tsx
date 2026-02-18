import React from 'react';
import { Image, View, Text, StyleSheet } from 'react-native';

interface LogoProps {
  size?: number;
  variant?: 'full' | 'icon' | 'horizontal';
  showText?: boolean;
  showLogo?: boolean; // Use logo.png instead of icon.png
}

export const Logo: React.FC<LogoProps> = ({ size = 200, variant = 'full', showText = true, showLogo = false }) => {
  const logoSource = showLogo ? require('../../assets/logo.png') : require('../../assets/icon.png');
  
  if (variant === 'icon') {
    // Just the icon, no text
    return (
      <Image 
        source={logoSource} 
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
    );
  }
  
  if (variant === 'horizontal') {
    // Icon + text side by side
    return (
      <View style={styles.horizontalContainer}>
        <Image 
          source={logoSource} 
          style={{ width: size, height: size }}
          resizeMode="contain"
        />
        {showText && (
          <View style={styles.textContainer}>
            <Text style={[styles.title, { fontSize: size * 0.5 }]}>StoryByte</Text>
            <Text style={[styles.tagline, { fontSize: size * 0.15 }]}>LISTEN. ESCAPE. REPEAT.</Text>
          </View>
        )}
      </View>
    );
  }
  
  // Full - icon with text below
  return (
    <View style={styles.fullContainer}>
      <Image 
        source={logoSource} 
        style={{ width: size, height: size, marginBottom: -size * 0.15 }}
        resizeMode="contain"
      />
      {showText && (
        <>
          <Text style={[styles.title, { fontSize: size * 0.25, marginTop: 0 }]}>StoryByte</Text>
          <Text style={[styles.tagline, { fontSize: size * 0.08, marginTop: size * 0.05 }]}>LISTEN. ESCAPE. REPEAT.</Text>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  fullContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  horizontalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  textContainer: {
    justifyContent: 'center',
  },
  title: {
    color: '#D4AF37',
    fontWeight: '600',
    letterSpacing: 1,
  },
  tagline: {
    color: '#D4AF37',
    fontWeight: '300',
    letterSpacing: 2,
    opacity: 0.8,
    marginTop: 4,
  },
});

export default Logo;
