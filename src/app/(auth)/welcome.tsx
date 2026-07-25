import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Dimensions, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { Shield, AlertTriangle, MapPin, EyeOff } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface Slide {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export default function WelcomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [activeSlide, setActiveSlide] = useState(0);

  const slides: Slide[] = [
    {
      title: 'Real-Time SOS Alerts',
      description: 'Long-press to notify your trusted contacts and local authorities instantly in case of an emergency.',
      icon: <Shield size={80} color={theme.danger} />,
    },
    {
      title: 'Community Reporting',
      description: 'Report hazards, traffic accidents, or threats. Use AI assistant to categorize and summary incidents.',
      icon: <AlertTriangle size={80} color={theme.warning} />,
    },
    {
      title: 'Safe Check-In & Tracking',
      description: 'Share your route and estimated arrival time with contacts. Get automatically safety checked.',
      icon: <MapPin size={80} color={theme.accent} />,
    },
    {
      title: 'Privacy and Protection',
      description: 'We prioritize your privacy. Report anonymously and customize location security coordinates.',
      icon: <EyeOff size={80} color={theme.success} />,
    },
  ];

  const handleNext = () => {
    if (activeSlide < slides.length - 1) {
      setActiveSlide(activeSlide + 1);
    } else {
      router.push('/(auth)/login');
    }
  };

  const handleSkip = () => {
    router.push('/(auth)/login');
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: Spacing.four,
      paddingVertical: Spacing.two,
    },
    skipText: {
      color: theme.textSecondary,
      fontSize: 16,
      fontWeight: '600',
    },
    brandText: {
      color: theme.primary,
      fontSize: 20,
      fontWeight: '800',
    },
    slideContent: {
      width: width,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: Spacing.five,
      flex: 1,
    },
    iconContainer: {
      width: 160,
      height: 160,
      borderRadius: 80,
      backgroundColor: theme.backgroundElement,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: Spacing.five,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 4,
    },
    title: {
      color: theme.text,
      fontSize: 28,
      fontWeight: '800',
      textAlign: 'center',
      marginBottom: Spacing.three,
    },
    description: {
      color: theme.textSecondary,
      fontSize: 16,
      lineHeight: 24,
      textAlign: 'center',
    },
    footer: {
      paddingHorizontal: Spacing.four,
      paddingBottom: Spacing.five,
      gap: Spacing.four,
    },
    indicatorContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: Spacing.one,
      marginBottom: Spacing.three,
    },
    indicator: {
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.backgroundSelected,
    },
    nextButton: {
      backgroundColor: theme.primary,
      borderRadius: 12,
      paddingVertical: Spacing.three,
      alignItems: 'center',
      justifyContent: 'center',
    },
    nextButtonText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '700',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.brandText}>CrowdShield</Text>
        {activeSlide < slides.length - 1 && (
          <TouchableOpacity onPress={handleSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={{ flex: 1 }}>
        <View style={styles.slideContent}>
          <View style={styles.iconContainer}>{slides[activeSlide].icon}</View>
          <Text style={styles.title}>{slides[activeSlide].title}</Text>
          <Text style={styles.description}>{slides[activeSlide].description}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.indicatorContainer}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                {
                  width: index === activeSlide ? 24 : 8,
                  backgroundColor: index === activeSlide ? theme.primary : theme.backgroundSelected,
                },
              ]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {activeSlide === slides.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
