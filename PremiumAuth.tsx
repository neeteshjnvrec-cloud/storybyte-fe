import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { premiumStyles as styles } from './premium-styles';
import { Logo } from './src/components';

export function LoginScreen({ email, setEmail, password, setPassword, loading, onLogin, onForgot, onSignup, onGoogleSignIn }: any) {
  const [showPassword, setShowPassword] = React.useState(false);
  
  return (
    <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={{ flex: 1 }}>
      <View style={{ paddingTop: 60, paddingHorizontal: 24, paddingBottom: 16 }}>
        <View style={styles.logoContainer}>
          <Logo size={100} variant="full" showText={false} />
          <Text style={styles.appTitle}>StoryByte</Text>
          <Text style={styles.appTagline}>Listen. Escape. Repeat.</Text>
        </View>
      </View>
      
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 0, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          <View style={styles.glassCard}>
            <Text style={styles.authTitle}>Welcome Back</Text>
            <Text style={styles.authSubtitle}>Sign in to continue</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>✉️</Text>
                <TextInput
                  style={styles.glassInput}
                  placeholder="your@email.com"
                  placeholderTextColor="#8b9dc3"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  style={styles.glassInput}
                  placeholder="Enter password"
                  placeholderTextColor="#8b9dc3"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 8 }}>
                  <Text style={{ fontSize: 18 }}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.forgotLink} onPress={onForgot}>
              <Text style={styles.forgotLinkText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.primaryButton} onPress={onLogin} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : (
                <>
                  <Text style={styles.primaryButtonText}>Sign In</Text>
                  <Text style={styles.buttonArrow}>→</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity 
              style={styles.googleButton} 
              onPress={onGoogleSignIn}
              disabled={loading}
            >
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={onSignup}>
              <Text style={styles.secondaryButtonText}>Create New Account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <StatusBar style="light" />
    </LinearGradient>
  );
}

export function SignupScreen({ name, setName, email, setEmail, password, setPassword, loading, onSignup, onLogin, onGoogleSignIn }: any) {
  const [showPassword, setShowPassword] = React.useState(false);
  
  return (
    <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={{ flex: 1 }}>
      <View style={{ paddingTop: 60, paddingHorizontal: 24, paddingBottom: 16 }}>
        <View style={styles.logoContainer}>
          <Logo size={100} variant="full" showText={false} />
          <Text style={styles.appTitle}>StoryByte</Text>
          <Text style={styles.appTagline}>Listen. Escape. Repeat.</Text>
        </View>
      </View>
      
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 0, paddingBottom: 40 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.glassCard}>
            <Text style={styles.authTitle}>Create Account</Text>
            <Text style={styles.authSubtitle}>Start your story journey</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Name</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>👤</Text>
                <TextInput
                  style={styles.glassInput}
                  placeholder="Your name"
                  placeholderTextColor="#8b9dc3"
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>✉️</Text>
                <TextInput
                  style={styles.glassInput}
                  placeholder="your@email.com"
                  placeholderTextColor="#8b9dc3"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  style={styles.glassInput}
                  placeholder="Min 8 characters"
                  placeholderTextColor="#8b9dc3"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 8 }}>
                  <Text style={{ fontSize: 18 }}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.primaryButton} onPress={onSignup} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : (
                <>
                  <Text style={styles.primaryButtonText}>Create Account</Text>
                  <Text style={styles.buttonArrow}>→</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity 
              style={styles.googleButton} 
              onPress={onGoogleSignIn}
              disabled={loading}
            >
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={onLogin}>
              <Text style={styles.secondaryButtonText}>Already have an account? Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <StatusBar style="light" />
    </LinearGradient>
  );
}

export function ForgotPasswordScreen({ email, setEmail, resetCode, setResetCode, newPassword, setNewPassword, forgotStep, loading, onSendCode, onVerifyCode, onResetPassword, onBack }: any) {
  return (
    <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={{ flex: 1 }}>
      <View style={{ paddingTop: 60, paddingHorizontal: 24, paddingBottom: 16 }}>
        <TouchableOpacity style={styles.backButtonTop} onPress={onBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.logoContainer}>
          <Logo size={100} variant="full" showText={false} />
          <Text style={styles.appTitle}>StoryByte</Text>
          <Text style={styles.appTagline}>Listen. Escape. Repeat.</Text>
        </View>
      </View>
      
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 0, paddingBottom: 40 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.glassCard}>
            <Text style={styles.authTitle}>
              {forgotStep === 1 && 'Reset Password'}
              {forgotStep === 2 && 'Verify Code'}
              {forgotStep === 3 && 'New Password'}
            </Text>
            <Text style={styles.authSubtitle}>
              {forgotStep === 1 && 'We\'ll send you a reset code'}
              {forgotStep === 2 && 'Check your email for the code'}
              {forgotStep === 3 && 'Create a strong password'}
            </Text>

            {forgotStep === 1 && (
              <>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Email Address</Text>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputIcon}>✉️</Text>
                    <TextInput
                      style={styles.glassInput}
                      placeholder="your@email.com"
                      placeholderTextColor="#8b9dc3"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                </View>
                <TouchableOpacity style={styles.primaryButton} onPress={onSendCode} disabled={loading}>
                  {loading ? <ActivityIndicator color="#fff" /> : (
                    <>
                      <Text style={styles.primaryButtonText}>Send Code</Text>
                      <Text style={styles.buttonArrow}>→</Text>
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}

            {forgotStep === 2 && (
              <>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Verification Code</Text>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputIcon}>🔢</Text>
                    <TextInput
                      style={styles.glassInput}
                      placeholder="Enter 6-digit code"
                      placeholderTextColor="#8b9dc3"
                      value={resetCode}
                      onChangeText={setResetCode}
                      keyboardType="number-pad"
                      maxLength={6}
                    />
                  </View>
                </View>
                <TouchableOpacity style={styles.primaryButton} onPress={onVerifyCode} disabled={loading}>
                  {loading ? <ActivityIndicator color="#fff" /> : (
                    <>
                      <Text style={styles.primaryButtonText}>Verify Code</Text>
                      <Text style={styles.buttonArrow}>→</Text>
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}

            {forgotStep === 3 && (
              <>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>New Password</Text>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputIcon}>🔒</Text>
                    <TextInput
                      style={styles.glassInput}
                      placeholder="Min 8 characters"
                      placeholderTextColor="#8b9dc3"
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry={true}
                    />
                  </View>
                </View>
                <TouchableOpacity style={styles.primaryButton} onPress={onResetPassword} disabled={loading}>
                  {loading ? <ActivityIndicator color="#fff" /> : (
                    <>
                      <Text style={styles.primaryButtonText}>Reset Password</Text>
                      <Text style={styles.buttonArrow}>→</Text>
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <StatusBar style="light" />
    </LinearGradient>
  );
}


export { OnboardingScreen } from './src/screens/OnboardingScreen';
