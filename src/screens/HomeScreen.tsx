import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, lightTheme, darkTheme } from '../hooks/useTheme';

export const HomeScreen = ({ stories, setSelectedStory, setScreen, selectedLanguage, setSelectedLanguage, onLoadMore, hasMore, loadingMore }: any) => {
  const { isDark } = useTheme();
  const theme = isDark ? darkTheme : lightTheme;
  const [searchQuery, setSearchQuery] = useState('');

  const styles = StyleSheet.create({
    container: { flex: 1 },
    searchSection: { paddingHorizontal: 16, marginVertical: 10 },
    searchWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      borderRadius: 15,
      paddingHorizontal: 12,
      height: 50,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    searchIcon: { fontSize: 18, color: '#8b9dc3' },
    searchInput: { flex: 1, color: theme.text, marginLeft: 10, fontSize: 16 },
    tabContainer: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 10 },
    pillBtn: {
      paddingVertical: 8,
      paddingHorizontal: 20,
      borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.05)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)',
    },
    pillBtnActive: { backgroundColor: '#667eea', borderColor: '#667eea' },
    pillText: { color: '#8b9dc3', fontWeight: '600' },
    pillTextActive: { color: '#fff' },
    premiumCard: { marginBottom: 16, borderRadius: 20, overflow: 'hidden', backgroundColor: theme.card },
    cardGradient: { padding: 16, flexDirection: 'row' },
    accentBar: { width: 4, borderRadius: 2, marginRight: 12 },
    cardContent: { flex: 1 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    premiumTitle: { fontSize: 18, fontWeight: '700', color: theme.text, flex: 1 },
    langBadge: { borderWidth: 1, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
    langBadgeText: { fontSize: 10, fontWeight: 'bold' },
    premiumDesc: { color: theme.textSecondary, marginVertical: 8, lineHeight: 18, fontSize: 14 },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 },
    statGroup: { flexDirection: 'row', alignItems: 'center' },
    statText: { color: theme.textSecondary, fontSize: 12 },
    readMore: { fontWeight: '700', fontSize: 14 },
  });

  // Advanced Filtering Logic
  const filteredStories = stories.filter((s: any) => {
    const matchesLang = selectedLanguage === 'all' || s.language === selectedLanguage;
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         s.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLang && matchesSearch;
  });

  const renderStoryCard = ({ item, index }: any) => {
    // Vibrant colors matching your PremiumAuth theme
    const colors = ['#667eea', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b'];
    const cardColor = colors[index % colors.length];

    return (
      <TouchableOpacity 
        style={styles.premiumCard}
        onPress={() => {
          setSelectedStory(item);
          setScreen('detail');
        }}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={[cardColor + '30', 'rgba(255,255,255,0.05)']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          <View style={[styles.accentBar, { backgroundColor: cardColor }]} />
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <Text style={styles.premiumTitle} numberOfLines={1}>{item.title}</Text>
              <View style={[styles.langBadge, { borderColor: cardColor }]}>
                <Text style={[styles.langBadgeText, { color: cardColor }]}>
                  {item.language?.toUpperCase()}
                </Text>
              </View>
            </View>
            
            <Text style={styles.premiumDesc} numberOfLines={2}>{item.description}</Text>
            
            <View style={styles.cardFooter}>
              <View style={styles.statGroup}>
                <Text style={styles.statText}>⭐ {item.averageRating?.toFixed(1) || '0.0'}</Text>
                <Text style={[styles.statText, { marginLeft: 12 }]}>▶ {item.plays || 0}</Text>
              </View>
              <Text style={[styles.readMore, { color: cardColor }]}>Listen Now →</Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchWrapper}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search stories..."
            placeholderTextColor="#8b9dc3"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Language Tabs */}
      <View style={styles.tabContainer}>
        {['all', 'en', 'hi'].map((lang) => (
          <TouchableOpacity 
            key={lang}
            style={[styles.pillBtn, selectedLanguage === lang && styles.pillBtnActive]}
            onPress={() => setSelectedLanguage(lang as any)}
          >
            <Text style={[styles.pillText, selectedLanguage === lang && styles.pillTextActive]}>
              {lang === 'all' ? 'All' : lang === 'en' ? 'English' : 'हिंदी'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredStories}
        keyExtractor={(item) => item._id || item.id}
        renderItem={renderStoryCard}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        onEndReached={() => {
          console.log('onEndReached triggered', { selectedLanguage, searchQuery });
          // Only load more if not filtering
          if (selectedLanguage === 'all' && !searchQuery) {
            onLoadMore();
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <ActivityIndicator size="small" color="#667eea" />
            </View>
          ) : !hasMore && filteredStories.length > 0 && selectedLanguage === 'all' && !searchQuery ? (
            <Text style={{ textAlign: 'center', color: theme.textSecondary, padding: 20 }}>
              No more stories
            </Text>
          ) : null
        }
      />
    </View>
  );
};