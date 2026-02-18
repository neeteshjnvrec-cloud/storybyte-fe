import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { APP_COLORS, APP_SPACING, APP_TYPOGRAPHY, APP_BORDER_RADIUS } from '../constants/appTheme';

export const ProfileScreen = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', onPress: logout, style: 'destructive' },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.profileCard}>
          <Text style={styles.name}>{user?.name || 'User'}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: APP_COLORS.background },
  header: { padding: APP_SPACING.lg },
  headerTitle: { ...APP_TYPOGRAPHY.h1, color: APP_COLORS.text },
  content: { padding: APP_SPACING.md },
  profileCard: { backgroundColor: APP_COLORS.surface, borderRadius: APP_BORDER_RADIUS.md, padding: APP_SPACING.lg, marginBottom: APP_SPACING.lg },
  name: { ...APP_TYPOGRAPHY.h2, color: APP_COLORS.text },
  email: { ...APP_TYPOGRAPHY.body, color: APP_COLORS.textSecondary, marginTop: APP_SPACING.xs },
  logoutButton: { backgroundColor: APP_COLORS.error, borderRadius: APP_BORDER_RADIUS.md, padding: APP_SPACING.md, alignItems: 'center' },
  logoutButtonText: { ...APP_TYPOGRAPHY.h3, color: APP_COLORS.text },
});
