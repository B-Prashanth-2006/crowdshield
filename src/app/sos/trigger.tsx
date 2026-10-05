import React, { useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, BackHandler } from 'react-native';
import { useRouter } from 'expo-router';
import { useSOSStore } from '@/store/sos';
import { useAuthStore } from '@/store/auth';
import { useContactStore } from '@/store/contacts';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { X, ShieldAlert, Heart, Flame, Shield, Car, AlertOctagon, HelpCircle, PhoneCall } from 'lucide-react-native';
import { makePhoneCall } from '@/utils/communication';

export default function SOSTriggerScreen() {
  const router = useRouter();
  const theme = useTheme();

  const { user } = useAuthStore();
  const { contacts } = useContactStore();
  const {
    isTriggering,
    countdown,
    selectedType,
    startSOSCountdown,
    cancelSOSCountdown,
    triggerSOSDirectly,
    activeSOS,
  } = useSOSStore();

  const primaryContact = contacts[0];

  // Handle Android back button during countdown
  useEffect(() => {
    const onBackPress = () => {
      if (isTriggering) {
        cancelSOSCountdown();
        router.back();
        return true;
      }
      return false;
    };
    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [isTriggering]);

  // Start countdown on mount if not already triggering
  useEffect(() => {
    if (!isTriggering && !activeSOS) {
      startSOSCountdown('Other');
    }
  }, []);

  // Redirect to active SOS when triggered
  useEffect(() => {
    if (activeSOS) {
      router.replace('/sos/active');
    }
  }, [activeSOS]);

  const handleSelectType = (type: any) => {
    startSOSCountdown(type);
  };

  const handleTriggerDirectly = async () => {
    cancelSOSCountdown();
    if (user) {
      await triggerSOSDirectly(user.id, selectedType);
    }
  };

  const handleCancel = () => {
    cancelSOSCountdown();
    router.back();
  };

  const handleEmergencyCall = async () => {
    cancelSOSCountdown();
    if (primaryContact) {
      await makePhoneCall(primaryContact.phone, primaryContact.name);
    } else {
      await makePhoneCall('911', 'Emergency Services');
    }
  };

  const emergencyTypes = [
    { name: 'Threat/Crime', icon: <Shield size={24} color="#FFFFFF" />, bg: '#1E3A8A' },
    { name: 'Medical', icon: <Heart size={24} color="#FFFFFF" />, bg: '#DC2626' },
    { name: 'Fire', icon: <Flame size={24} color="#FFFFFF" />, bg: '#EA580C' },
    { name: 'Accident', icon: <Car size={24} color="#FFFFFF" />, bg: '#D97706' },
    { name: 'Disaster', icon: <AlertOctagon size={24} color="#FFFFFF" />, bg: '#7F1D1D' },
    { name: 'Other', icon: <HelpCircle size={24} color="#FFFFFF" />, bg: '#4B5563' },
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'rgba(10, 17, 40, 0.96)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    content: {
      alignItems: 'center',
      paddingHorizontal: Spacing.five,
      width: '100%',
    },
    sosHeader: {
      alignItems: 'center',
      marginBottom: Spacing.three,
    },
    sosTitle: {
      color: '#FFFFFF',
      fontSize: 26,
      fontWeight: '900',
      textTransform: 'uppercase',
      letterSpacing: 1.5,
      marginTop: Spacing.two,
    },
    sosSubtitle: {
      color: '#94A3B8',
      fontSize: 14,
      textAlign: 'center',
      marginTop: Spacing.one,
      lineHeight: 20,
    },
    // Circle timer
    countdownCircle: {
      width: 150,
      height: 150,
      borderRadius: 75,
      borderWidth: 6,
      borderColor: theme.danger,
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: Spacing.four,
    },
    countdownNumber: {
      color: '#FFFFFF',
      fontSize: 68,
      fontWeight: '900',
    },
    // Emergency selector Grid
    label: {
      color: '#E2E8F0',
      fontSize: 13,
      fontWeight: '800',
      textTransform: 'uppercase',
      marginBottom: Spacing.three,
      letterSpacing: 1,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: Spacing.three,
      marginBottom: Spacing.four,
      width: '100%',
    },
    gridItem: {
      width: '45%',
      height: 60,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing.three,
      gap: Spacing.two,
    },
    gridText: {
      color: '#FFFFFF',
      fontSize: 13,
      fontWeight: '700',
    },
    // Footer button row
    footerRow: {
      flexDirection: 'row',
      gap: Spacing.three,
      width: '100%',
      justifyContent: 'center',
    },
    cancelBtn: {
      backgroundColor: '#334155',
      borderRadius: 14,
      paddingVertical: Spacing.three,
      paddingHorizontal: Spacing.four,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.two,
      flex: 1,
    },
    cancelBtnText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '700',
    },
    quickDialBtn: {
      backgroundColor: theme.danger,
      borderRadius: 14,
      paddingVertical: Spacing.three,
      paddingHorizontal: Spacing.four,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.two,
      flex: 1,
    },
    quickDialBtnText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '800',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.sosHeader}>
          <ShieldAlert size={44} color={theme.danger} />
          <Text style={styles.sosTitle}>SOS Emergency</Text>
          <Text style={styles.sosSubtitle}>
            Activating {selectedType} Alert. We will notify family, local authorities, and begin location tracking.
          </Text>
        </View>

        {/* Big countdown circle */}
        <TouchableOpacity style={styles.countdownCircle} onPress={handleTriggerDirectly}>
          <Text style={styles.countdownNumber}>{countdown}</Text>
          <Text style={{ color: '#E2E8F0', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' }}>
            Tap to Skip
          </Text>
        </TouchableOpacity>

        <Text style={styles.label}>Select Emergency Type</Text>
        <View style={styles.grid}>
          {emergencyTypes.map((t) => {
            const isSelected = selectedType === t.name;
            return (
              <TouchableOpacity
                key={t.name}
                style={[
                  styles.gridItem,
                  {
                    backgroundColor: t.bg,
                    borderWidth: isSelected ? 3 : 0,
                    borderColor: '#FFFFFF',
                    opacity: isSelected ? 1 : 0.7,
                  },
                ]}
                onPress={() => handleSelectType(t.name)}
              >
                {t.icon}
                <Text style={styles.gridText} numberOfLines={1}>
                  {t.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.footerRow}>
          <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
            <X size={18} color="#FFFFFF" />
            <Text style={styles.cancelBtnText}>Cancel Alert</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickDialBtn} onPress={handleEmergencyCall}>
            <PhoneCall size={18} color="#FFFFFF" />
            <Text style={styles.quickDialBtnText}>
              {primaryContact ? `Call ${primaryContact.name.split(' ')[0]}` : 'Call 911'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
