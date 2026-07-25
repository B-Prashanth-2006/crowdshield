import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import { useCheckInStore } from '@/store/checkin';
import { useAuthStore } from '@/store/auth';
import { useContactStore } from '@/store/contacts';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { MapPin, Clock, ShieldCheck, AlertOctagon, Power, Play } from 'lucide-react-native';

export default function CheckInScreen() {
  const theme = useTheme();
  const { user } = useAuthStore();
  const { activeCheckIn, startTrip, checkInSafe, cancelTrip } = useCheckInStore();
  const { contacts } = useContactStore();

  const [destination, setDestination] = useState('');
  const [etaVal, setEtaVal] = useState('15'); // 15 mins default
  const [remainingSecs, setRemainingSecs] = useState(0);

  // Parse remaining seconds if trip is active
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (activeCheckIn && activeCheckIn.status === 'active') {
      const calculateTimeLeft = () => {
        const diffMs = new Date(activeCheckIn.eta).getTime() - Date.now();
        if (diffMs <= 0) {
          setRemainingSecs(0);
          if (interval) clearInterval(interval);
        } else {
          setRemainingSecs(Math.floor(diffMs / 1000));
        }
      };

      calculateTimeLeft();
      interval = setInterval(calculateTimeLeft, 1000);
    } else {
      setRemainingSecs(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeCheckIn]);

  const handleStartTrip = async () => {
    if (!destination) {
      Alert.alert('Missing Field', 'Please enter a destination.');
      return;
    }
    if (contacts.length === 0) {
      Alert.alert('No Contacts', 'You must add at least one emergency contact before starting a trip.');
      return;
    }
    const mins = parseInt(etaVal, 10);
    const success = await startTrip(user?.id || 'user-123', destination, mins, 37.7793, -122.4192);
    if (!success) {
      Alert.alert('Error', 'Failed to start trip.');
    }
  };

  const handleCheckInSafe = async () => {
    const success = await checkInSafe();
    if (success) {
      Alert.alert('Safe Check-In', 'You have checked in safely. Your contacts have been notified that you arrived.');
      setDestination('');
    }
  };

  const handleCancelTrip = async () => {
    Alert.alert('Cancel Trip', 'Are you sure you want to cancel the trip tracking?', [
      { text: 'No', style: 'cancel' },
      { text: 'Yes, Cancel', style: 'destructive', onPress: async () => await cancelTrip() },
    ]);
  };

  const formatTime = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = secs % 60;
    
    return [
      hours > 0 ? String(hours).padStart(2, '0') : null,
      String(minutes).padStart(2, '0'),
      String(seconds).padStart(2, '0'),
    ]
      .filter(Boolean)
      .join(':');
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    content: {
      padding: Spacing.four,
    },
    title: {
      fontSize: 24,
      fontWeight: '800',
      color: theme.text,
      marginBottom: Spacing.one,
    },
    subtitle: {
      fontSize: 14,
      color: theme.textSecondary,
      marginBottom: Spacing.four,
    },
    // Form view
    card: {
      backgroundColor: theme.backgroundElement,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 16,
      padding: Spacing.four,
      marginBottom: Spacing.four,
    },
    label: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.text,
      textTransform: 'uppercase',
      marginBottom: Spacing.two,
      marginTop: Spacing.two,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 10,
      paddingHorizontal: Spacing.three,
      height: 48,
      marginBottom: Spacing.three,
    },
    input: {
      flex: 1,
      color: theme.text,
      marginLeft: Spacing.two,
      fontSize: 15,
    },
    durationContainer: {
      flexDirection: 'row',
      gap: Spacing.two,
      marginBottom: Spacing.three,
    },
    durationPill: {
      flex: 1,
      paddingVertical: Spacing.two,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
    },
    durationPillText: {
      fontSize: 12,
      fontWeight: '700',
    },
    contactRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: Spacing.two,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    contactName: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
    },
    contactPhone: {
      fontSize: 12,
      color: theme.textSecondary,
      marginTop: 2,
    },
    startBtn: {
      backgroundColor: theme.primary,
      borderRadius: 12,
      height: 52,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      marginTop: Spacing.two,
    },
    startBtnText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '700',
      marginLeft: Spacing.two,
    },
    // Active trip view
    activeContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: Spacing.five,
    },
    timerCircle: {
      width: 200,
      height: 200,
      borderRadius: 100,
      borderWidth: 8,
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: Spacing.four,
    },
    timerText: {
      fontSize: 36,
      fontWeight: '900',
    },
    timerLabel: {
      fontSize: 12,
      fontWeight: '700',
      textTransform: 'uppercase',
      marginTop: Spacing.one,
    },
    checkInBtn: {
      borderRadius: 12,
      height: 52,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      width: '100%',
      marginBottom: Spacing.three,
    },
    cancelBtn: {
      borderWidth: 1,
      borderRadius: 12,
      height: 52,
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Safe Check-In</Text>
        <Text style={styles.subtitle}>
          Set a destination and timeframe. If you miss your arrival deadline, we automatically notify your trusted contacts.
        </Text>

        {!activeCheckIn ? (
          <View style={styles.card}>
            <Text style={styles.label}>Destination</Text>
            <View style={styles.inputContainer}>
              <MapPin size={18} color={theme.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder="e.g. Walking home from library, Work"
                placeholderTextColor={theme.textSecondary}
                value={destination}
                onChangeText={setDestination}
              />
            </View>

            <Text style={styles.label}>Expected Duration (Minutes)</Text>
            <View style={styles.durationContainer}>
              {['5', '15', '30', '45', '60'].map((mins) => (
                <TouchableOpacity
                  key={mins}
                  style={[
                    styles.durationPill,
                    {
                      backgroundColor: etaVal === mins ? theme.primary : theme.background,
                      borderColor: etaVal === mins ? theme.primary : theme.border,
                    },
                  ]}
                  onPress={() => setEtaVal(mins)}
                >
                  <Text style={[styles.durationPillText, { color: etaVal === mins ? '#FFFFFF' : theme.text }]}>
                    {mins}m
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Notified Emergency Contacts ({contacts.length})</Text>
            {contacts.length === 0 ? (
              <Text style={{ fontSize: 13, color: theme.danger, marginVertical: Spacing.two, fontWeight: '600' }}>
                No emergency contacts added yet. Add contacts in the Contacts tab first.
              </Text>
            ) : (
              contacts.map((c) => (
                <View key={c.id} style={styles.contactRow}>
                  <View>
                    <Text style={styles.contactName}>{c.name}</Text>
                    <Text style={styles.contactPhone}>{c.phone}</Text>
                  </View>
                  <ShieldCheck size={18} color={theme.success} style={{ marginLeft: 'auto' }} />
                </View>
              ))
            )}

            <TouchableOpacity
              style={[styles.startBtn, { opacity: contacts.length === 0 ? 0.6 : 1 }]}
              onPress={handleStartTrip}
              disabled={contacts.length === 0}
            >
              <Play size={20} color="#FFFFFF" />
              <Text style={styles.startBtnText}>Start Safe Check-in</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.card, { alignItems: 'center' }]}>
            <Text style={[styles.label, { color: theme.primary, marginTop: 0 }]}>Active Trip Sharing</Text>
            <Text style={{ fontSize: 18, fontWeight: '800', color: theme.text, textAlign: 'center' }}>
              Heading to: {activeCheckIn.destination_name}
            </Text>

            {/* Timer circle representation */}
            <View
              style={[
                styles.timerCircle,
                {
                  borderColor:
                    activeCheckIn.status === 'missed_check_in'
                      ? theme.danger
                      : remainingSecs < 120
                        ? theme.warning
                        : theme.success,
                },
              ]}
            >
              {activeCheckIn.status === 'missed_check_in' ? (
                <AlertOctagon size={48} color={theme.danger} />
              ) : (
                <Clock size={40} color={remainingSecs < 120 ? theme.warning : theme.success} />
              )}
              <Text
                style={[
                  styles.timerText,
                  {
                    color:
                      activeCheckIn.status === 'missed_check_in'
                        ? theme.danger
                        : remainingSecs < 120
                          ? theme.warning
                          : theme.text,
                  },
                ]}
              >
                {activeCheckIn.status === 'missed_check_in' ? 'EXP' : formatTime(remainingSecs)}
              </Text>
              <Text style={[styles.timerLabel, { color: theme.textSecondary }]}>
                {activeCheckIn.status === 'missed_check_in' ? 'Expired' : 'Time Left'}
              </Text>
            </View>

            {activeCheckIn.status === 'missed_check_in' && (
              <View
                style={{
                  backgroundColor: theme.dangerLight,
                  borderColor: theme.danger,
                  borderWidth: 1,
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: Spacing.four,
                }}
              >
                <Text style={{ color: theme.danger, fontSize: 13, fontWeight: '700', textAlign: 'center' }}>
                  WARNING: Arrival deadline passed. Your contacts have been alerted. Check in safe now to cancel.
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.checkInBtn, { backgroundColor: theme.success }]}
              onPress={handleCheckInSafe}
            >
              <ShieldCheck size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>I Am Safe</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.cancelBtn, { borderColor: theme.border }]}
              onPress={handleCancelTrip}
            >
              <Text style={{ color: theme.text, fontSize: 15, fontWeight: '700' }}>Cancel Trip Sharing</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
