import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, SafeAreaView, FlatList, Share, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/auth';
import { useSOSStore } from '@/store/sos';
import { useCheckInStore } from '@/store/checkin';
import { useIncidentStore } from '@/store/incident';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { Shield, AlertCircle, ShieldAlert, ShieldCheck, MapPin, Send, HelpCircle, Eye, Settings } from 'lucide-react-native';

export default function HomeDashboardScreen() {
  const router = useRouter();
  const theme = useTheme();

  const { user } = useAuthStore();
  const { activeSOS } = useSOSStore();
  const { activeCheckIn } = useCheckInStore();
  const { incidents } = useIncidentStore();

  const activeAlerts = incidents.filter((inc) => inc.status === 'Verified' || inc.status === 'Under Review');

  const handleSOSPress = () => {
    // Navigate to the transparent SOS trigger overlays
    router.push('/sos/trigger');
  };

  const handleShareLocation = async () => {
    try {
      await Share.share({
        message: `I am broadcasting my live location safety status. Track my status on CrowdShield. Current center: 37.7793, -122.4192`,
      });
    } catch (err: any) {
      Alert.alert('Sharing Failed', err.message);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scrollView: {
      paddingHorizontal: Spacing.four,
      paddingTop: Spacing.two,
      paddingBottom: Spacing.six,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.four,
    },
    greetingText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.textSecondary,
    },
    nameText: {
      fontSize: 22,
      fontWeight: '800',
      color: theme.text,
      marginTop: 2,
    },
    // Status banner cards
    statusCard: {
      borderRadius: 16,
      padding: Spacing.three,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Spacing.four,
      borderWidth: 1,
    },
    statusTextContainer: {
      flex: 1,
      marginLeft: Spacing.three,
    },
    statusTitle: {
      fontSize: 16,
      fontWeight: '800',
    },
    statusSubtitle: {
      fontSize: 13,
      marginTop: 2,
    },
    // SOS Core trigger
    sosContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: Spacing.four,
    },
    sosButton: {
      width: 170,
      height: 170,
      borderRadius: 85,
      alignItems: 'center',
      justifyContent: 'center',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.4,
      shadowRadius: 15,
      elevation: 10,
    },
    sosText: {
      color: '#FFFFFF',
      fontSize: 24,
      fontWeight: '900',
      letterSpacing: 1.5,
    },
    sosHelperText: {
      color: theme.textSecondary,
      fontSize: 13,
      fontWeight: '600',
      marginTop: Spacing.three,
      textAlign: 'center',
    },
    // Quick actions
    sectionLabel: {
      fontSize: 16,
      fontWeight: '800',
      color: theme.text,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: Spacing.three,
      marginTop: Spacing.three,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.three,
      marginBottom: Spacing.four,
    },
    actionItem: {
      width: '47%',
      backgroundColor: theme.backgroundElement,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 14,
      padding: Spacing.three,
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionText: {
      color: theme.text,
      fontSize: 13,
      fontWeight: '700',
      marginTop: Spacing.two,
      textAlign: 'center',
    },
    // Incident feeds
    alertCard: {
      backgroundColor: theme.backgroundElement,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      padding: Spacing.three,
      marginBottom: Spacing.two,
    },
    alertHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.two,
    },
    alertTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.text,
      flex: 1,
      marginRight: Spacing.two,
    },
    badge: {
      paddingHorizontal: Spacing.two,
      paddingVertical: 4,
      borderRadius: 6,
    },
    badgeText: {
      fontSize: 10,
      fontWeight: '800',
      textTransform: 'uppercase',
    },
    alertDesc: {
      fontSize: 13,
      color: theme.textSecondary,
      lineHeight: 18,
    },
  });

  // Decide colors for status card
  let cardBg: string = theme.successLight;
  let cardBorder: string = theme.success;
  let cardTitle = 'You are secure';
  let cardSub = 'No nearby critical alerts reported.';
  let cardIcon = <ShieldCheck size={32} color={theme.success} />;

  if (activeSOS) {
    cardBg = theme.dangerLight;
    cardBorder = theme.danger;
    cardTitle = 'SOS BROADCAST ACTIVE';
    cardSub = 'Trusted contacts and emergency responders notified.';
    cardIcon = <ShieldAlert size={32} color={theme.danger} />;
  } else if (activeCheckIn) {
    cardBg = theme.warningLight;
    cardBorder = theme.warning;
    cardTitle = 'Active Trip Sharing';
    cardSub = `ETA Check-in active: ${activeCheckIn.destination_name}`;
    cardIcon = <AlertCircle size={32} color={theme.warning} />;
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'Critical': return { bg: theme.dangerLight, border: theme.danger, text: theme.danger };
      case 'High': return { bg: theme.warningLight, border: theme.warning, text: theme.warning };
      case 'Medium': return { bg: theme.primaryLight, border: theme.primary, text: theme.primary };
      default: return { bg: theme.successLight, border: theme.success, text: theme.success };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greetingText}>COMMUNITY SAFETY</Text>
            <Text style={styles.nameText}>Hello, {user?.name || 'User'}</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(tabs)/profile')} style={{ padding: 4 }}>
            <Settings size={22} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Safety Status card */}
        <TouchableOpacity
          style={[styles.statusCard, { backgroundColor: cardBg, borderColor: cardBorder }]}
          onPress={() => activeSOS ? router.push('/sos/active') : activeCheckIn ? router.push('/(tabs)/checkin') : null}
        >
          {cardIcon}
          <View style={styles.statusTextContainer}>
            <Text style={[styles.statusTitle, { color: theme.text }]}>{cardTitle}</Text>
            <Text style={[styles.statusSubtitle, { color: theme.textSecondary }]}>{cardSub}</Text>
          </View>
        </TouchableOpacity>

        {/* SOS button */}
        <View style={styles.sosContainer}>
          <TouchableOpacity
            style={[
              styles.sosButton,
              {
                backgroundColor: theme.danger,
                shadowColor: theme.danger,
              },
            ]}
            onPress={handleSOSPress}
          >
            <Shield size={56} color="#FFFFFF" />
            <Text style={styles.sosText}>SOS</Text>
          </TouchableOpacity>
          <Text style={styles.sosHelperText}>Tap for single-press emergency triggers</Text>
        </View>

        <Text style={styles.sectionLabel}>Quick Safety Actions</Text>
        <View style={styles.grid}>
          <TouchableOpacity style={styles.actionItem} onPress={() => router.push('/report/new')}>
            <AlertCircle size={24} color={theme.warning} />
            <Text style={styles.actionText}>Report Incident</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={() => router.push('/chat')}>
            <HelpCircle size={24} color={theme.accent} />
            <Text style={styles.actionText}>AI Safety Chat</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={handleShareLocation}>
            <Send size={24} color={theme.primary} />
            <Text style={styles.actionText}>Broadcast Coordinates</Text>
          </TouchableOpacity>

          {(user?.role === 'moderator' || user?.role === 'admin') && (
            <TouchableOpacity style={styles.actionItem} onPress={() => router.push('/moderator/dashboard')}>
              <Eye size={24} color={theme.success} />
              <Text style={styles.actionText}>Moderation Queue</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.sectionLabel}>Active Community Alerts</Text>
        {activeAlerts.length === 0 ? (
          <View style={[styles.alertCard, { alignItems: 'center', padding: Spacing.four }]}>
            <ShieldCheck size={28} color={theme.success} />
            <Text style={[styles.alertTitle, { textAlign: 'center', marginTop: Spacing.two, marginRight: 0 }]}>
              All Clear
            </Text>
            <Text style={[styles.alertDesc, { textAlign: 'center', marginTop: Spacing.one }]}>
              There are no active safety incidents reported in your immediate region.
            </Text>
          </View>
        ) : (
          activeAlerts.map((item) => {
            const uColors = getUrgencyColor(item.urgency);
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.alertCard}
                onPress={() => router.push(`/report/${item.id}`)}
              >
                <View style={styles.alertHeader}>
                  <Text style={styles.alertTitle} numberOfLines={1}>
                    {item.location_name || 'Safety Report'}
                  </Text>
                  <View style={[styles.badge, { backgroundColor: uColors.bg }]}>
                    <Text style={[styles.badgeText, { color: uColors.text }]}>{item.urgency}</Text>
                  </View>
                </View>
                <Text style={styles.alertDesc} numberOfLines={2}>
                  {item.description}
                </Text>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
