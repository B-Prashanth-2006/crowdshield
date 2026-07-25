import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/auth';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { ShieldAlert, Mail, ArrowRight, Lock } from 'lucide-react-native';

export default function LoginScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { login, isLoading, error } = useAuthStore();
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  const handleSendOTP = async () => {
    if (!email || !email.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    const success = await login(email);
    if (success) {
      setOtpSent(true);
    } else {
      Alert.alert('Authentication Failed', error || 'Could not send OTP code.');
    }
  };

  const handleVerifyOTP = async () => {
    if (otpCode.length < 4) {
      Alert.alert('Invalid Code', 'Please enter the 4-digit code sent to your email.');
      return;
    }
    // Simulate verification
    router.replace('/(auth)/permissions');
  };

  const handleDemoAccess = async (role: 'member' | 'moderator' | 'admin') => {
    const demoEmail = `${role}@crowdshield.demo`;
    const success = await login(demoEmail);
    if (success) {
      router.replace('/(auth)/permissions');
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: Spacing.five,
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: Spacing.five,
    },
    logoBackground: {
      width: 80,
      height: 80,
      borderRadius: 24,
      backgroundColor: theme.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.two,
    },
    title: {
      fontSize: 28,
      fontWeight: '800',
      color: theme.text,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 15,
      color: theme.textSecondary,
      textAlign: 'center',
      marginTop: Spacing.one,
      marginBottom: Spacing.five,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.backgroundElement,
      borderRadius: 12,
      paddingHorizontal: Spacing.three,
      marginBottom: Spacing.three,
      height: 52,
      borderWidth: 1,
      borderColor: theme.border,
    },
    inputIcon: {
      marginRight: Spacing.two,
    },
    input: {
      flex: 1,
      color: theme.text,
      fontSize: 16,
    },
    primaryButton: {
      backgroundColor: theme.primary,
      borderRadius: 12,
      height: 52,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      marginTop: Spacing.two,
      marginBottom: Spacing.four,
    },
    primaryButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '700',
      marginRight: Spacing.one,
    },
    registerText: {
      textAlign: 'center',
      color: theme.textSecondary,
      fontSize: 14,
    },
    linkText: {
      color: theme.primary,
      fontWeight: '700',
    },
    dividerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: Spacing.four,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: theme.border,
    },
    dividerText: {
      marginHorizontal: Spacing.three,
      color: theme.textSecondary,
      fontSize: 12,
      fontWeight: '600',
      textTransform: 'uppercase',
    },
    demoTitle: {
      textAlign: 'center',
      color: theme.text,
      fontWeight: '700',
      marginBottom: Spacing.two,
    },
    demoButtonsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: Spacing.two,
    },
    demoButton: {
      flex: 1,
      paddingVertical: Spacing.two,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
    },
    demoButtonText: {
      fontSize: 13,
      fontWeight: '700',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.logoBackground}>
            <ShieldAlert size={44} color={theme.primary} />
          </View>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Enter your email to verify and sign in</Text>
        </View>

        {!otpSent ? (
          <View>
            <View style={styles.inputContainer}>
              <Mail size={20} color={theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="your.email@example.com"
                placeholderTextColor={theme.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <TouchableOpacity style={styles.primaryButton} onPress={handleSendOTP} disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>Send OTP Code</Text>
                  <ArrowRight size={20} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <View style={styles.inputContainer}>
              <Lock size={20} color={theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter 4-digit code"
                placeholderTextColor={theme.textSecondary}
                value={otpCode}
                onChangeText={setOtpCode}
                keyboardType="number-pad"
                maxLength={4}
              />
            </View>

            <TouchableOpacity style={styles.primaryButton} onPress={handleVerifyOTP}>
              <Text style={styles.primaryButtonText}>Verify & Sign In</Text>
              <ArrowRight size={20} color="#FFFFFF" />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => setOtpSent(false)} style={{ padding: Spacing.two }}>
              <Text style={[styles.registerText, { color: theme.primary, fontWeight: '600' }]}>
                Change Email Address
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
          <Text style={styles.registerText}>
            Don't have an account? <Text style={styles.linkText}>Register here</Text>
          </Text>
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>Reviewer Sandbox</Text>
          <View style={styles.dividerLine} />
        </View>

        <Text style={styles.demoTitle}>Simulate Sign In with Roles</Text>
        <View style={styles.demoButtonsContainer}>
          <TouchableOpacity
            style={[styles.demoButton, { backgroundColor: theme.primaryLight, borderColor: theme.primary }]}
            onPress={() => handleDemoAccess('member')}
          >
            <Text style={[styles.demoButtonText, { color: theme.primary }]}>Member</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.demoButton, { backgroundColor: theme.warningLight, borderColor: theme.warning }]}
            onPress={() => handleDemoAccess('moderator')}
          >
            <Text style={[styles.demoButtonText, { color: theme.warning }]}>Moderator</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.demoButton, { backgroundColor: theme.dangerLight, borderColor: theme.danger }]}
            onPress={() => handleDemoAccess('admin')}
          >
            <Text style={[styles.demoButtonText, { color: theme.danger }]}>Admin</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
