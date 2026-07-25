import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/auth';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { User, Phone, Mail, FileText, ChevronRight } from 'lucide-react-native';

export default function SignupScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { signup, isLoading, error } = useAuthStore();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [notes, setNotes] = useState('');

  const handleRegister = async () => {
    if (!name || !phone || !email) {
      Alert.alert('Required Fields', 'Please fill in Name, Phone, and Email.');
      return;
    }
    const success = await signup(name, phone, email);
    if (success) {
      // Set the profile blood group and notes details in store
      const { updateProfile } = useAuthStore.getState();
      await updateProfile({ blood_group: bloodGroup, emergency_notes: notes });
      router.replace('/(auth)/permissions');
    } else {
      Alert.alert('Registration Failed', error || 'Could not register user account.');
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scrollView: {
      paddingHorizontal: Spacing.five,
      paddingVertical: Spacing.four,
    },
    title: {
      fontSize: 28,
      fontWeight: '800',
      color: theme.text,
      marginBottom: Spacing.one,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 15,
      color: theme.textSecondary,
      marginBottom: Spacing.four,
      textAlign: 'center',
    },
    sectionLabel: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.textSecondary,
      textTransform: 'uppercase',
      marginBottom: Spacing.two,
      marginTop: Spacing.three,
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
    rowContainer: {
      flexDirection: 'row',
      gap: Spacing.two,
    },
    largeInputContainer: {
      backgroundColor: theme.backgroundElement,
      borderRadius: 12,
      paddingHorizontal: Spacing.three,
      paddingVertical: Spacing.two,
      marginBottom: Spacing.four,
      borderWidth: 1,
      borderColor: theme.border,
    },
    largeInput: {
      color: theme.text,
      fontSize: 16,
      minHeight: 80,
      textAlignVertical: 'top',
    },
    button: {
      backgroundColor: theme.primary,
      borderRadius: 12,
      height: 52,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      marginTop: Spacing.two,
      marginBottom: Spacing.four,
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '700',
      marginRight: Spacing.one,
    },
    loginLink: {
      textAlign: 'center',
      color: theme.textSecondary,
      fontSize: 14,
      marginBottom: Spacing.five,
    },
    linkText: {
      color: theme.primary,
      fontWeight: '700',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Set up your personal community safety profile</Text>

        <Text style={styles.sectionLabel}>Basic Information</Text>

        <View style={styles.inputContainer}>
          <User size={20} color={theme.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor={theme.textSecondary}
            value={name}
            onChangeText={setName}
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputContainer}>
          <Phone size={20} color={theme.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            placeholderTextColor={theme.textSecondary}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputContainer}>
          <Mail size={20} color={theme.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            placeholderTextColor={theme.textSecondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <Text style={styles.sectionLabel}>Emergency Medical Details</Text>

        <View style={styles.inputContainer}>
          <FileText size={20} color={theme.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Blood Group (e.g. O+, A-)"
            placeholderTextColor={theme.textSecondary}
            value={bloodGroup}
            onChangeText={setBloodGroup}
            autoCapitalize="characters"
            maxLength={3}
          />
        </View>

        <View style={styles.largeInputContainer}>
          <TextInput
            style={styles.largeInput}
            placeholder="Emergency notes, allergies, medical conditions..."
            placeholderTextColor={theme.textSecondary}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.buttonText}>Register Account</Text>
              <ChevronRight size={20} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
          <Text style={styles.loginLink}>
            Already have an account? <Text style={styles.linkText}>Log in</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
