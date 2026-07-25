import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, Alert, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSOSStore } from '@/store/sos';
import { useContactStore } from '@/store/contacts';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { ShieldCheck, MessageSquare, Radio, Phone, HelpCircle } from 'lucide-react-native';

let MapView: any;
let Marker: any;
let Circle: any;
try {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
  Circle = Maps.Circle;
} catch (e) {
  MapView = null;
  Marker = null;
  Circle = null;
}

export default function ActiveSOSScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { activeSOS, resolveSOS } = useSOSStore();
  const { contacts } = useContactStore();

  const [elapsedSecs, setElapsedSecs] = useState(0);

  // Redirect back if SOS gets resolved
  useEffect(() => {
    if (!activeSOS) {
      router.replace('/(tabs)');
    }
  }, [activeSOS]);

  // Alert duration timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSecs((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const handleResolve = async () => {
    Alert.alert('Resolve SOS', 'Are you sure you want to resolve this SOS alert and stop live tracking?', [
      { text: 'No, Keep Active', style: 'cancel' },
      {
        text: 'Yes, I Am Safe',
        style: 'default',
        onPress: async () => {
          const success = await resolveSOS();
          if (success) {
            Alert.alert('SOS Resolved', 'Emergency alert has been resolved. Contacts notified.');
          }
        },
      },
    ]);
  };

  const sendQuickSMS = (msg: string) => {
    Alert.alert('SMS Broadcast', `SMS status update dispatched to ${contacts.length} contacts:\n\n"${msg}"`);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#0A1128', // Keep dark navy theme for SOS
    },
    mapArea: {
      flex: 1,
      backgroundColor: '#1E293B',
      justifyContent: 'center',
      alignItems: 'center',
    },
    statusBar: {
      position: 'absolute',
      top: 50,
      left: Spacing.four,
      right: Spacing.four,
      backgroundColor: 'rgba(10, 17, 40, 0.9)',
      borderWidth: 1,
      borderColor: theme.danger,
      borderRadius: 14,
      padding: Spacing.three,
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.three,
      zIndex: 10,
    },
    statusTextWrap: {
      flex: 1,
    },
    statusTitle: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '800',
    },
    statusMeta: {
      color: theme.danger,
      fontSize: 12,
      fontWeight: '700',
      marginTop: 2,
    },
    bottomPanel: {
      backgroundColor: '#0A1128',
      borderTopWidth: 1,
      borderTopColor: '#1E293B',
      padding: Spacing.four,
      gap: Spacing.three,
    },
    timerContainer: {
      alignItems: 'center',
      marginBottom: Spacing.one,
    },
    timerLabel: {
      color: '#94A3B8',
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'uppercase',
    },
    timerText: {
      color: '#FFFFFF',
      fontSize: 32,
      fontWeight: '900',
      marginTop: 2,
    },
    quickMsgScroll: {
      paddingBottom: 2,
    },
    quickMsgBtn: {
      backgroundColor: '#1E293B',
      borderWidth: 1,
      borderColor: '#334155',
      borderRadius: 8,
      paddingHorizontal: Spacing.three,
      paddingVertical: 8,
      marginRight: Spacing.two,
    },
    quickMsgText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '600',
    },
    resolveBtn: {
      backgroundColor: theme.success,
      borderRadius: 14,
      height: 54,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: Spacing.two,
    },
    resolveBtnText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '800',
    },
  });

  const currentLat = activeSOS?.latitude ?? 37.7793;
  const currentLng = activeSOS?.longitude ?? -122.4192;

  return (
    <SafeAreaView style={styles.container}>
      {/* SOS Status Bar Overlay */}
      <View style={styles.statusBar}>
        <Radio size={24} color={theme.danger} />
        <View style={styles.statusTextWrap}>
          <Text style={styles.statusTitle}>SOS: {activeSOS?.type || 'Emergency'} Broadcast</Text>
          <Text style={styles.statusMeta}>Broadcasting GPS coordinates in real-time</Text>
        </View>
      </View>

      {/* Map View */}
      <View style={styles.mapArea}>
        {MapView && Platform.OS !== 'web' ? (
          <MapView
            style={StyleSheet.absoluteFill}
            region={{
              latitude: currentLat,
              longitude: currentLng,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }}
          >
            <Marker coordinate={{ latitude: currentLat, longitude: currentLng }} title="My SOS Location">
              <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: theme.danger, borderWidth: 3, borderColor: '#FFFFFF' }} />
            </Marker>
            <Circle
              center={{ latitude: currentLat, longitude: currentLng }}
              radius={80}
              strokeColor="rgba(239, 68, 68, 0.4)"
              fillColor="rgba(239, 68, 68, 0.15)"
            />
          </MapView>
        ) : (
          <View style={{ alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <Radio size={56} color={theme.danger} />
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700', marginTop: 12 }}>
              Map Simulation Coordinates
            </Text>
            <Text style={{ color: '#94A3B8', fontSize: 13, marginTop: 4 }}>
              Latitude: {currentLat.toFixed(6)} | Longitude: {currentLng.toFixed(6)}
            </Text>
          </View>
        )}
      </View>

      {/* Bottom control panel */}
      <View style={styles.bottomPanel}>
        <View style={styles.timerContainer}>
          <Text style={styles.timerLabel}>Alert Elapsed Time</Text>
          <Text style={styles.timerText}>{formatTimer(elapsedSecs)}</Text>
        </View>

        {/* Quick Contacts updates */}
        <Text style={{ color: '#E2E8F0', fontSize: 11, fontWeight: '800', textTransform: 'uppercase' }}>
          Dispatch Status Update to Contacts ({contacts.length})
        </Text>
        <View style={{ height: 40, marginVertical: 4 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickMsgScroll}>
            {[
              'I am safe, accidental trigger.',
              'Emergency services arrived.',
              'I am in a safe room, waiting.',
              'Injured but conscious.',
              'Call me immediately.',
            ].map((msg) => (
              <TouchableOpacity key={msg} style={styles.quickMsgBtn} onPress={() => sendQuickSMS(msg)}>
                <Text style={styles.quickMsgText}>{msg}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <TouchableOpacity style={styles.resolveBtn} onPress={handleResolve}>
          <ShieldCheck size={22} color="#FFFFFF" />
          <Text style={styles.resolveBtnText}>I Am Safe - Resolve SOS</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
