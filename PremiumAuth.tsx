import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path } from 'react-native-svg';
import * as WebBrowser from 'expo-web-browser';
import { premiumStyles as styles } from './premium-styles';
import { Logo } from './src/components';
import { LockIcon, UserIcon, EmailIcon } from './src/components/Icons';
import { useTheme, lightTheme, darkTheme } from './src/hooks/useTheme';
import { API_CONFIG } from './src/constants/config';

const EyeIcon = ({ color = '#9ca3af' }: { color?: string }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M21 12c0 1.2-4.03 6-9 6s-9-4.8-9-6c0-1.2 4.03-6 9-6s9 4.8 9 6Z" stroke={color} strokeWidth="2"/>
    <Path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" stroke={color} strokeWidth="2"/>
  </Svg>
);

const EyeOffIcon = ({ color = '#9ca3af' }: { color?: string }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M21 12c0 1.2-4.03 6-9 6s-9-4.8-9-6c0-1.2 4.03-6 9-6s9 4.8 9 6Z" stroke={color} strokeWidth="2"/>
    <Path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" stroke={color} strokeWidth="2"/>
    <Path d="M3 3l18 18" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </Svg>
);

const GoogleIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 48 48">
    <Path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <Path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <Path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <Path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    <Path fill="none" d="M0 0h48v48H0z"/>
  </Svg>
);

export function LoginScreen({ email, setEmail, password, setPassword, loading, onLogin, onForgot, onSignup, onGoogleSignIn }: any) {
  const [showPassword, setShowPassword] = React.useState(false);
  const { isDark } = useTheme();
  const gradientColors = isDark ? ['#1a1a2e', '#16213e', '#0f3460'] : ['#ffffff', '#f8f9ff', '#f0f4ff'];
  const textColor = isDark ? '#ffffff' : '#1a1a2e';
  const secondaryTextColor = isDark ? '#8b9dc3' : '#667eea';
  const cardBg = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(102, 126, 234, 0.08)';
  const cardBorder = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(102, 126, 234, 0.2)';
  const inputBg = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(102, 126, 234, 0.05)';
  const inputBorder = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(102, 126, 234, 0.15)';
  const iconColor = isDark ? '#8b9dc3' : '#667eea';
  
  return (
    <LinearGradient colors={gradientColors} style={{ flex: 1 }}>
      <View style={{ paddingTop: 40, paddingHorizontal: 24, paddingBottom: 16 }}>
        <View style={styles.logoContainer}>
          <Logo size={100} variant="full" showText={false} />
          <Text style={[styles.appTitle, { color: textColor }]}>StoryByte</Text>
          <Text style={[styles.appTagline, { color: secondaryTextColor }]}>Listen. Escape. Repeat.</Text>
        </View>
      </View>
      
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 0, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          <View style={[styles.glassCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <Text style={[styles.authTitle, { color: textColor }]}>Welcome Back</Text>
            <Text style={[styles.authSubtitle, { color: secondaryTextColor }]}>Sign in to continue</Text>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: textColor }]}>Email</Text>
              <View style={[styles.inputWrapper, { backgroundColor: inputBg, borderColor: inputBorder }]}>
                <View style={{ marginRight: 3 }}><EmailIcon color={iconColor} size={20} /></View>
                <TextInput
                  style={[styles.glassInput, { color: textColor }]}
                  placeholder="your@email.com"
                  placeholderTextColor={secondaryTextColor}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: textColor }]}>Password</Text>
              <View style={[styles.inputWrapper, { backgroundColor: inputBg, borderColor: inputBorder }]}>
                <View style={{ marginRight: 3 }}><LockIcon color={iconColor} size={20} /></View>
                <TextInput
                  style={[styles.glassInput, { color: textColor }]}
                  placeholder="Enter password"
                  placeholderTextColor={secondaryTextColor}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 8 }}>
                  <Text style={{ fontSize: 18 }}>{showPassword ? <EyeIcon color={iconColor} /> : <EyeOffIcon color={iconColor} />}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.forgotLink} onPress={onForgot}>
              <Text style={styles.forgotLinkText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.primaryButton, { backgroundColor: isDark ? "#667eea" : "#5568d3", shadowOpacity: isDark ? 0.4 : 0.3 }]} onPress={onLogin} disabled={loading}>
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
              style={[styles.googleButton, { backgroundColor: isDark ? "#667eea" : "#5568d3", borderColor: "transparent" }]} 
              onPress={onGoogleSignIn}
              disabled={loading}
            >
              <View style={{ marginRight: 8 }}><GoogleIcon /></View>
              <Text style={[styles.googleButtonText, { color: "#ffffff" }]}>Continue with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.secondaryButton, { backgroundColor: isDark ? "#667eea" : "#5568d3", borderColor: "transparent" }]} onPress={onSignup}>
              <Text style={[styles.secondaryButtonText, { color: "#ffffff" }]}>Create New Account</Text>
            </TouchableOpacity>

            <View style={{ marginTop: 20, alignItems: 'center' }}>
              <Text style={{ color: secondaryTextColor, fontSize: 12 }}>
                By continuing, you agree to our{' '}
                <Text style={{ textDecorationLine: 'underline' }} onPress={() => WebBrowser.openBrowserAsync(`${API_CONFIG.BACKEND_URL}/legal/terms`)}>
                  Terms
                </Text>
                {' '}and{' '}
                <Text style={{ textDecorationLine: 'underline' }} onPress={() => WebBrowser.openBrowserAsync(`${API_CONFIG.BACKEND_URL}/legal/privacy`)}>
                  Privacy Policy
                </Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <StatusBar style={isDark ? "light" : "dark"} />
    </LinearGradient>
  );
}

export function SignupScreen({ name, setName, email, setEmail, password, setPassword, loading, onSignup, onLogin, onGoogleSignIn }: any) {
  const [showPassword, setShowPassword] = React.useState(false);
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const { isDark } = useTheme();
  const gradientColors = isDark ? ['#1a1a2e', '#16213e', '#0f3460'] : ['#ffffff', '#f8f9ff', '#f0f4ff'];
  const textColor = isDark ? '#ffffff' : '#1a1a2e';
  const secondaryTextColor = isDark ? '#8b9dc3' : '#667eea';
  const cardBg = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(102, 126, 234, 0.08)';
  const cardBorder = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(102, 126, 234, 0.2)';
  const inputBg = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(102, 126, 234, 0.05)';
  const inputBorder = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(102, 126, 234, 0.15)';
  const iconColor = isDark ? '#8b9dc3' : '#667eea';
  
  const handleSignup = () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    onSignup();
  };
  
  return (
    <LinearGradient colors={gradientColors} style={{ flex: 1 }}>
      <View style={{ paddingTop: 40, paddingHorizontal: 24, paddingBottom: 16 }}>
        <View style={styles.logoContainer}>
          <Logo size={100} variant="full" showText={false} />
          <Text style={[styles.appTitle, { color: textColor }]}>StoryByte</Text>
          <Text style={[styles.appTagline, { color: secondaryTextColor }]}>Listen. Escape. Repeat.</Text>
        </View>
      </View>
      
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 0, paddingBottom: 40 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={[styles.glassCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <Text style={[styles.authTitle, { color: textColor }]}>Create Account</Text>
            <Text style={[styles.authSubtitle, { color: secondaryTextColor }]}>Start your story journey</Text>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: textColor }]}>Name</Text>
              <View style={[styles.inputWrapper, { backgroundColor: inputBg, borderColor: inputBorder }]}>
                <View style={{ marginRight: 2 }}><UserIcon color={iconColor} size={20} /></View>
                <TextInput
                  style={[styles.glassInput, { color: textColor }]}
                  placeholder="Your name"
                  placeholderTextColor={secondaryTextColor}
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: textColor }]}>Email</Text>
              <View style={[styles.inputWrapper, { backgroundColor: inputBg, borderColor: inputBorder }]}>
                <View style={{ marginRight: 3 }}><EmailIcon color={iconColor} size={20} /></View>
                <TextInput
                  style={[styles.glassInput, { color: textColor }]}
                  placeholder="your@email.com"
                  placeholderTextColor={secondaryTextColor}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: textColor }]}>Password</Text>
              <View style={[styles.inputWrapper, { backgroundColor: inputBg, borderColor: inputBorder }]}>
                <View style={{ marginRight: 3 }}><LockIcon color={iconColor} size={20} /></View>
                <TextInput
                  style={[styles.glassInput, { color: textColor }]}
                  placeholder="Min 8 characters"
                  placeholderTextColor={secondaryTextColor}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 8 }}>
                  <Text style={{ fontSize: 18 }}>{showPassword ? <EyeIcon color={iconColor} /> : <EyeOffIcon color={iconColor} />}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: textColor }]}>Confirm Password</Text>
              <View style={[styles.inputWrapper, { backgroundColor: inputBg, borderColor: inputBorder }]}>
                <View style={{ marginRight: 3 }}><LockIcon color={iconColor} size={20} /></View>
                <TextInput
                  style={[styles.glassInput, { color: textColor }]}
                  placeholder="Re-enter password"
                  placeholderTextColor={secondaryTextColor}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={{ padding: 8 }}>
                  <Text style={{ fontSize: 18 }}>{showConfirmPassword ? <EyeIcon color={iconColor} /> : <EyeOffIcon color={iconColor} />}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={[styles.primaryButton, { backgroundColor: isDark ? "#667eea" : "#5568d3", shadowOpacity: isDark ? 0.4 : 0.3 }]} onPress={handleSignup} disabled={loading}>
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
              style={[styles.googleButton, { backgroundColor: isDark ? "#667eea" : "#5568d3", borderColor: "transparent" }]} 
              onPress={onGoogleSignIn}
              disabled={loading}
            >
              <View style={{ marginRight: 8 }}><GoogleIcon /></View>
              <Text style={[styles.googleButtonText, { color: "#ffffff" }]}>Continue with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.secondaryButton, { backgroundColor: isDark ? "#667eea" : "#5568d3", borderColor: "transparent" }]} onPress={onLogin}>
              <Text style={[styles.secondaryButtonText, { color: "#ffffff" }]}>Already have an account? Sign In</Text>
            </TouchableOpacity>

            <View style={{ marginTop: 20, alignItems: 'center' }}>
              <Text style={{ color: secondaryTextColor, fontSize: 12, textAlign: 'center' }}>
                By signing up, you agree to our{' '}
                <Text style={{ textDecorationLine: 'underline' }} onPress={() => WebBrowser.openBrowserAsync(`${API_CONFIG.BACKEND_URL}/legal/terms`)}>
                  Terms
                </Text>
                {' '}and{' '}
                <Text style={{ textDecorationLine: 'underline' }} onPress={() => WebBrowser.openBrowserAsync(`${API_CONFIG.BACKEND_URL}/legal/privacy`)}>
                  Privacy Policy
                </Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <StatusBar style={isDark ? "light" : "dark"} />
    </LinearGradient>
  );
}

export function ForgotPasswordScreen({ email, setEmail, resetCode, setResetCode, newPassword, setNewPassword, forgotStep, loading, onSendCode, onVerifyCode, onResetPassword, onBack }: any) {
  const { isDark } = useTheme();
  const gradientColors = isDark ? ['#1a1a2e', '#16213e', '#0f3460'] : ['#ffffff', '#f8f9ff', '#f0f4ff'];
  const textColor = isDark ? '#ffffff' : '#1a1a2e';
  const secondaryTextColor = isDark ? '#8b9dc3' : '#667eea';
  const cardBg = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(102, 126, 234, 0.08)';
  const cardBorder = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(102, 126, 234, 0.2)';
  const inputBg = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(102, 126, 234, 0.05)';
  const inputBorder = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(102, 126, 234, 0.15)';
  const iconColor = isDark ? '#8b9dc3' : '#667eea';
  
  return (
    <LinearGradient colors={gradientColors} style={{ flex: 1 }}>
      <View style={{ paddingTop: 100, paddingHorizontal: 24, paddingBottom: 16 }}>
        <TouchableOpacity style={styles.backButtonTop} onPress={onBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.logoContainer}>
          <Logo size={100} variant="full" showText={false} />
          <Text style={[styles.appTitle, { color: textColor }]}>StoryByte</Text>
          <Text style={[styles.appTagline, { color: secondaryTextColor }]}>Listen. Escape. Repeat.</Text>
        </View>
      </View>
      
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 0, paddingBottom: 40 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={[styles.glassCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <Text style={[styles.authTitle, { color: textColor }]}>
              {forgotStep === 1 && 'Reset Password'}
              {forgotStep === 2 && 'Verify Code'}
              {forgotStep === 3 && 'New Password'}
            </Text>
            <Text style={[styles.authSubtitle, { color: secondaryTextColor }]}>
              {forgotStep === 1 && 'We\'ll send you a reset code'}
              {forgotStep === 2 && 'Check your email for the code'}
              {forgotStep === 3 && 'Create a strong password'}
            </Text>

            {forgotStep === 1 && (
              <>
                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: textColor }]}>Email Address</Text>
                  <View style={[styles.inputWrapper, { backgroundColor: inputBg, borderColor: inputBorder }]}>
                    <View style={{ marginRight: 3 }}><EmailIcon color={iconColor} size={20} /></View>
                    <TextInput
                      style={[styles.glassInput, { color: textColor }]}
                      placeholder="your@email.com"
                      placeholderTextColor={secondaryTextColor}
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                </View>
                <TouchableOpacity style={[styles.primaryButton, { backgroundColor: isDark ? "#667eea" : "#5568d3", shadowOpacity: isDark ? 0.4 : 0.3 }]} onPress={onSendCode} disabled={loading}>
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
                  <Text style={[styles.inputLabel, { color: textColor }]}>Verification Code</Text>
                  <View style={[styles.inputWrapper, { backgroundColor: inputBg, borderColor: inputBorder }]}>
                    <Text style={styles.inputIcon}>🔢</Text>
                    <TextInput
                      style={[styles.glassInput, { color: textColor }]}
                      placeholder="Enter 6-digit code"
                      placeholderTextColor={secondaryTextColor}
                      value={resetCode}
                      onChangeText={setResetCode}
                      keyboardType="number-pad"
                      maxLength={6}
                    />
                  </View>
                </View>
                <TouchableOpacity style={[styles.primaryButton, { backgroundColor: isDark ? "#667eea" : "#5568d3", shadowOpacity: isDark ? 0.4 : 0.3 }]} onPress={onVerifyCode} disabled={loading}>
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
                  <Text style={[styles.inputLabel, { color: textColor }]}>New Password</Text>
                  <View style={[styles.inputWrapper, { backgroundColor: inputBg, borderColor: inputBorder }]}>
                    <View style={{ marginRight: 3 }}><LockIcon color={iconColor} size={20} /></View>
                    <TextInput
                      style={[styles.glassInput, { color: textColor }]}
                      placeholder="Min 8 characters"
                      placeholderTextColor={secondaryTextColor}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry={true}
                    />
                  </View>
                </View>
                <TouchableOpacity style={[styles.primaryButton, { backgroundColor: isDark ? "#667eea" : "#5568d3", shadowOpacity: isDark ? 0.4 : 0.3 }]} onPress={onResetPassword} disabled={loading}>
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
      <StatusBar style={isDark ? "light" : "dark"} />
    </LinearGradient>
  );
}


export { OnboardingScreen } from './src/screens/OnboardingScreen';
