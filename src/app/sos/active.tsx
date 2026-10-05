import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  ScrollView,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSOSStore } from '@/store/sos';
import { useContactStore } from '@/store/contacts';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import {
  ShieldCheck,
  MessageSquare,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Phone,
  PhoneCall,
  Send,
  ShieldAlert,
  Users,
} from 'lucide-react-native';
import {
  makePhoneCall,
  sendSMSMessage,
  composeSOSBroadcastSMS,
  formatMapsLocationUrl,
} from '@/utils/communication';
import { EmergencyContactActionModal } from '@/components/emergency-contact-action-modal';
import { EmergencyContact } from '@/types';
import { Alert } from '@/utils/alert';

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
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal states for Call / SMS
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [selectedContact, setSelectedContact] = useState<EmergencyContact | null>(null);
  const [isBroadcast, setIsBroadcast] = useState(false);

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

  const currentLat = activeSOS?.latitude ?? 37.7793;
  const currentLng = activeSOS?.longitude ?? -122.4192;

  const formatTimer = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const handleOpenResolve = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmResolve = async () => {
    setIsResolving(true);
    try {
      await resolveSOS();
    } catch (err) {
      console.error('Failed to resolve SOS:', err);
    } finally {
      setIsResolving(false);
      setShowConfirmModal(false);
      router.replace('/(tabs)');
    }
  };

  // Broadcast SOS SMS with live coordinates to all contacts
  const handleBroadcastSOS = async () => {
    if (contacts.length === 0) {
      Alert.alert(
        'No Emergency Contacts',
        'You have not added any emergency contacts yet. Please add contacts from the Contacts tab to alert them.'
      );
      return;
    }

    const phones = contacts.map((c) => c.phone).filter(Boolean);
    const alertType = activeSOS?.type || 'SOS Emergency';
    const message = composeSOSBroadcastSMS(alertType, currentLat, currentLng);

    const success = await sendSMSMessage(phones, message, `All ${phones.length} Emergency Contacts`);
    if (success) {
      setToastMessage(`Dispatched SOS SMS broadcast with GPS coordinates to ${phones.length} contacts.`);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  // Call a specific contact or primary contact
  const handleCall = async (phone: string, name: string) => {
    await makePhoneCall(phone, name);
  };

  // Open SMS modal for a single contact
  const handleOpenContactSMS = (contact: EmergencyContact) => {
    setSelectedContact(contact);
    setIsBroadcast(false);
    setActionModalVisible(true);
  };

  // Send quick status update via SMS to contacts
  const sendQuickStatusSMS = async (msg: string) => {
    const phones = contacts.map((c) => c.phone).filter(Boolean);
    const mapsUrl = formatMapsLocationUrl(currentLat, currentLng);
    const fullMessage = `[CrowdShield Safety Update]\n${msg}\nLive Location: ${mapsUrl}`;

    if (phones.length > 0) {
      await sendSMSMessage(phones, fullMessage, `${phones.length} Contacts`);
    }

    setToastMessage(`Status update sent to ${contacts.length} contacts:\n"${msg}"`);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const primaryContact = contacts[0];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#0A1128', // Dark navy theme for SOS
    },
    mapArea: {
      height: 220,
      backgroundColor: '#1E293B',
      justifyContent: 'center',
      alignItems: 'center',
    },
    statusBar: {
      position: 'absolute',
      top: 50,
      left: Spacing.four,
      right: Spacing.four,
      backgroundColor: 'rgba(10, 17, 40, 0.95)',
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
      flex: 1,
      backgroundColor: '#0A1128',
      borderTopWidth: 1,
      borderTopColor: '#1E293B',
      paddingHorizontal: Spacing.four,
      paddingTop: Spacing.three,
      gap: Spacing.three,
    },
    timerContainer: {
      alignItems: 'center',
      marginBottom: 2,
    },
    timerLabel: {
      color: '#94A3B8',
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'uppercase',
    },
    timerText: {
      color: '#FFFFFF',
      fontSize: 28,
      fontWeight: '900',
      marginTop: 2,
    },
    // Emergency Actions Toolbar
    sosActionRow: {
      flexDirection: 'row',
      gap: Spacing.two,
      marginVertical: 4,
    },
    sosBroadcastBtn: {
      flex: 1.2,
      backgroundColor: theme.danger,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: Spacing.three,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.two,
      shadowColor: theme.danger,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 6,
      elevation: 4,
    },
    sosBroadcastBtnText: {
      color: '#FFFFFF',
      fontSize: 13,
      fontWeight: '800',
    },
    callPrimaryBtn: {
      flex: 1,
      backgroundColor: '#1E293B',
      borderWidth: 1,
      borderColor: theme.primary,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: Spacing.two,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.one,
    },
    callPrimaryBtnText: {
      color: theme.primary,
      fontSize: 12,
      fontWeight: '800',
    },
    // Contacts strip
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 4,
    },
    sectionTitle: {
      color: '#E2E8F0',
      fontSize: 11,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    contactsScroll: {
      gap: Spacing.two,
      paddingVertical: 4,
    },
    contactChip: {
      backgroundColor: '#1E293B',
      borderWidth: 1,
      borderColor: '#334155',
      borderRadius: 12,
      paddingHorizontal: Spacing.three,
      paddingVertical: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
    },
    contactChipName: {
      color: '#FFFFFF',
      fontSize: 13,
      fontWeight: '700',
    },
    contactChipActions: {
      flexDirection: 'row',
      gap: 6,
      marginLeft: 4,
    },
    iconActionBtn: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      alignItems: 'center',
      justifyContent: 'center',
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
      height: 50,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: Spacing.two,
      marginTop: 'auto',
      marginBottom: Platform.OS === 'ios' ? 20 : 12,
    },
    resolveBtnText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '800',
    },
    // Toast Notification Banner
    toast: {
      position: 'absolute',
      top: 115,
      left: Spacing.four,
      right: Spacing.four,
      backgroundColor: '#0F172A',
      borderColor: '#10B981',
      borderWidth: 1,
      borderRadius: 12,
      padding: Spacing.three,
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.three,
      zIndex: 50,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    toastText: {
      color: '#FFFFFF',
      fontSize: 13,
      fontWeight: '600',
      flex: 1,
    },
    // Modal Overlay & Content
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.78)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: Spacing.four,
    },
    modalCard: {
      width: '100%',
      maxWidth: 420,
      backgroundColor: '#0F172A',
      borderRadius: 22,
      borderWidth: 1,
      borderColor: '#334155',
      padding: Spacing.five,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.5,
      shadowRadius: 20,
      elevation: 10,
    },
    modalHeader: {
      alignItems: 'center',
      marginBottom: Spacing.four,
    },
    modalIconWrap: {
      width: 68,
      height: 68,
      borderRadius: 34,
      backgroundColor: 'rgba(16, 185, 129, 0.15)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: Spacing.three,
      borderWidth: 1,
      borderColor: 'rgba(16, 185, 129, 0.3)',
    },
    modalTitle: {
      color: '#FFFFFF',
      fontSize: 20,
      fontWeight: '800',
      textAlign: 'center',
      marginBottom: Spacing.two,
    },
    modalDesc: {
      color: '#94A3B8',
      fontSize: 13,
      textAlign: 'center',
      lineHeight: 20,
    },
    modalStats: {
      flexDirection: 'row',
      backgroundColor: '#1E293B',
      borderRadius: 14,
      padding: Spacing.three,
      width: '100%',
      marginBottom: Spacing.four,
      borderWidth: 1,
      borderColor: '#334155',
    },
    modalStatItem: {
      flex: 1,
      alignItems: 'center',
    },
    modalStatDivider: {
      width: 1,
      backgroundColor: '#334155',
      marginHorizontal: Spacing.two,
    },
    modalStatLabel: {
      color: '#64748B',
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'uppercase',
      marginBottom: 4,
    },
    modalStatVal: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '800',
    },
    modalActions: {
      width: '100%',
      gap: Spacing.two,
    },
    modalConfirmBtn: {
      backgroundColor: '#10B981',
      height: 52,
      borderRadius: 14,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: Spacing.two,
      shadowColor: '#10B981',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    modalConfirmBtnText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '800',
    },
    modalCancelBtn: {
      backgroundColor: '#1E293B',
      borderWidth: 1,
      borderColor: '#475569',
      height: 48,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalCancelBtnText: {
      color: '#CBD5E1',
      fontSize: 14,
      fontWeight: '700',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Toast Notification */}
      {toastMessage && (
        <View style={styles.toast}>
          <MessageSquare size={18} color="#10B981" />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

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
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: theme.danger,
                  borderWidth: 3,
                  borderColor: '#FFFFFF',
                }}
              />
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
            <Radio size={48} color={theme.danger} />
            <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '700', marginTop: 10 }}>
              Live GPS Broadcast Active
            </Text>
            <Text style={{ color: '#94A3B8', fontSize: 12, marginTop: 4 }}>
              Coordinates: {currentLat.toFixed(6)}, {currentLng.toFixed(6)}
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

        {/* SOS Action Row: Broadcast SMS & Direct Call */}
        <View style={styles.sosActionRow}>
          <TouchableOpacity
            style={styles.sosBroadcastBtn}
            onPress={handleBroadcastSOS}
            activeOpacity={0.8}
          >
            <Send size={16} color="#FFFFFF" />
            <Text style={styles.sosBroadcastBtnText}>SMS Alert ({contacts.length})</Text>
          </TouchableOpacity>

          {primaryContact ? (
            <TouchableOpacity
              style={styles.callPrimaryBtn}
              onPress={() => handleCall(primaryContact.phone, primaryContact.name)}
              activeOpacity={0.8}
            >
              <PhoneCall size={16} color={theme.primary} />
              <Text style={styles.callPrimaryBtnText}>Call {primaryContact.name.split(' ')[0]}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.callPrimaryBtn}
              onPress={() => handleCall('911', 'Emergency Services')}
              activeOpacity={0.8}
            >
              <PhoneCall size={16} color={theme.danger} />
              <Text style={[styles.callPrimaryBtnText, { color: theme.danger }]}>Call 911</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Emergency Contacts Strip */}
        {contacts.length > 0 && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Emergency Contacts ({contacts.length})</Text>
              <TouchableOpacity
                onPress={() => {
                  setSelectedContact(null);
                  setIsBroadcast(true);
                  setActionModalVisible(true);
                }}
              >
                <Text style={{ color: theme.primary, fontSize: 11, fontWeight: '700' }}>Custom SMS</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.contactsScroll}>
              {contacts.map((contact) => (
                <View key={contact.id} style={styles.contactChip}>
                  <Text style={styles.contactChipName}>{contact.name}</Text>
                  <View style={styles.contactChipActions}>
                    <TouchableOpacity
                      style={styles.iconActionBtn}
                      onPress={() => handleCall(contact.phone, contact.name)}
                      activeOpacity={0.7}
                    >
                      <Phone size={13} color={theme.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.iconActionBtn}
                      onPress={() => handleOpenContactSMS(contact)}
                      activeOpacity={0.7}
                    >
                      <Send size={13} color={theme.success} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Quick Contacts updates */}
        <View>
          <Text style={styles.sectionTitle}>Dispatch Quick SMS Update</Text>
          <View style={{ height: 38, marginVertical: 4 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickMsgScroll}>
              {[
                'I am safe, accidental trigger.',
                'Emergency services arrived.',
                'I am in a safe room, waiting.',
                'Injured but conscious.',
                'Call me immediately.',
              ].map((msg) => (
                <TouchableOpacity
                  key={msg}
                  style={styles.quickMsgBtn}
                  onPress={() => sendQuickStatusSMS(msg)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.quickMsgText}>{msg}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Resolve SOS Button */}
        <TouchableOpacity
          style={styles.resolveBtn}
          onPress={handleOpenResolve}
          activeOpacity={0.8}
        >
          <ShieldCheck size={20} color="#FFFFFF" />
          <Text style={styles.resolveBtnText}>I Am Safe - Resolve SOS</Text>
        </TouchableOpacity>
      </View>

      {/* Emergency Contact Action Modal for custom SMS / Call */}
      <EmergencyContactActionModal
        visible={actionModalVisible}
        contact={selectedContact}
        allContacts={contacts}
        isBroadcast={isBroadcast}
        alertType={activeSOS?.type || 'SOS Emergency'}
        latitude={currentLat}
        longitude={currentLng}
        onClose={() => setActionModalVisible(false)}
        onSuccess={(action, target) => {
          setToastMessage(
            action === 'call' ? `Initiated call to ${target}` : `Dispatched SMS to ${target}`
          );
          setTimeout(() => setToastMessage(null), 4000);
        }}
      />

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmModal}
        transparent
        animationType="fade"
        onRequestClose={() => !isResolving && setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconWrap}>
                <ShieldCheck size={36} color="#10B981" />
              </View>
              <Text style={styles.modalTitle}>Resolve Emergency SOS?</Text>
              <Text style={styles.modalDesc}>
                Are you safe? Resolving this alert will immediately stop live GPS tracking and notify your{' '}
                {contacts.length} emergency contacts that you are safe.
              </Text>
            </View>

            <View style={styles.modalStats}>
              <View style={styles.modalStatItem}>
                <Text style={styles.modalStatLabel}>Alert Duration</Text>
                <Text style={styles.modalStatVal}>{formatTimer(elapsedSecs)}</Text>
              </View>
              <View style={styles.modalStatDivider} />
              <View style={styles.modalStatItem}>
                <Text style={styles.modalStatLabel}>Emergency Contacts</Text>
                <Text style={styles.modalStatVal}>{contacts.length} Notified</Text>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalConfirmBtn, isResolving && { opacity: 0.7 }]}
                onPress={handleConfirmResolve}
                disabled={isResolving}
                activeOpacity={0.8}
              >
                {isResolving ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <CheckCircle2 size={20} color="#FFFFFF" />
                    <Text style={styles.modalConfirmBtnText}>Yes, I Am Safe</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowConfirmModal(false)}
                disabled={isResolving}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCancelBtnText}>No, Keep SOS Active</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
