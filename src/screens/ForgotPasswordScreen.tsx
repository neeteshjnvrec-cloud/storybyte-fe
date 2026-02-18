import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ApiService from '../services/api';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../constants/theme';

export const ForgotPasswordScreen = ({ navigation }: any) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [tempToken, setTempToken] = useState('');

  const handleSendCode = async () => {
    try {
      await ApiService.forgotPassword(email);
      Alert.alert('Success', 'Reset code sent to your email');
      setStep(2);
    } catch (error) {
      Alert.alert('Error', 'Failed to send reset code');
    }
  };

  const handleVerifyCode = async () => {
    try {
      const response = await ApiService.verifyResetCode(email, code);
      setTempToken(response.tempToken);
      setStep(3);
    } catch (error) {
      Alert.alert('Error', 'Invalid code');
    }
  };

  const handleResetPassword = async () => {
    try {
      await ApiService.resetPassword(tempToken, newPassword);
      Alert.alert('Success', 'Password reset successfully', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to reset password');
    }
  };

  return (
    <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Reset Password</Text>
        
        {step === 1 && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={COLORS.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.button} onPress={handleSendCode}>
              <Text style={styles.buttonText}>Send Code</Text>
            </TouchableOpacity>
          </>
        )}

        {step === 2 && (
          <>
            <TextInput
              style={styles.input}
              placeholder="6-digit code"
              placeholderTextColor={COLORS.textSecondary}
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              maxLength={6}
            />
            <TouchableOpacity style={styles.button} onPress={handleVerifyCode}>
              <Text style={styles.buttonText}>Verify Code</Text>
            </TouchableOpacity>
          </>
        )}

        {step === 3 && (
          <>
            <TextInput
              style={styles.input}
              placeholder="New Password"
              placeholderTextColor={COLORS.textSecondary}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={true}
            />
            <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
              <Text style={styles.buttonText}>Reset Password</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: SPACING.lg },
  content: { width: '100%' },
  title: { ...TYPOGRAPHY.h1, color: COLORS.text, marginBottom: SPACING.xl, textAlign: 'center' },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  button: {
    backgroundColor: COLORS.text,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  buttonText: { ...TYPOGRAPHY.h3, color: COLORS.primary },
  backText: { ...TYPOGRAPHY.body, color: COLORS.text, textAlign: 'center', marginTop: SPACING.lg },
});
