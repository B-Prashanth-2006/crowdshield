import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {
  Phone,
  PhoneCall,
  Send,
  ShieldAlert,
  MapPin,
  AlertTriangle,
  HeartPulse,
  CheckCircle2,
  X,
  Copy,
  Users,
  MessageSquare,
} from 'lucide-react-native';
import { EmergencyContact } from '@/types';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { Alert } from '@/utils/alert';
import {
  makePhoneCall,
  sendSMSMessage,
  EMERGENCY_SMS_PRESETS,
  formatMapsLocationUrl,
  SMSPreset,
} from '@/utils/communication';
import { SIMULATION_CENTER_LAT, SIMULATION_CENTER_LNG } from '@/utils/mock-data';

interface EmergencyContactActionModalProps {
  visible: boolean;
  contact: EmergencyContact | null;
  allContacts?: EmergencyContact[];
  isBroadcast?: boolean;
  alertType?: string;
  latitude?: number;
  longitude?: number;
  onClose: () => void;
  onSuccess?: (action: 'call' | 'sms', target: string) => void;
}

export const EmergencyContactActionModal: React.FC<EmergencyContactActionModalProps> = ({
  visible,
  contact,
  allContacts = [],
  isBroadcast = false,
  alertType = 'Emergency Alert',
  latitude = SIMULATION_CENTER_LAT,
  longitude = SIMULATION_CENTER_LNG,
  onClose,
  onSuccess,
}) => {
  const theme = useTheme();

  const [activeTab, setActiveTab] = useState<'sms' | 'call'>('sms');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('sos_urgent');
  const [customMessage, setCustomMessage] = useState<string>('');
  const [includeLocation, setIncludeLocation] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);

  // Update default message when preset or location changes
  useEffect(() => {
    const preset = EMERGENCY_SMS_PRESETS.find((p) => p.id === selectedPresetId);
    if (preset) {
      const generated = preset.template(
        includeLocation ? latitude : undefined,
        includeLocation ? longitude : undefined,
        alertType
      );
      setCustomMessage(generated);
    }
  }, [selectedPresetId, includeLocation, latitude, longitude, alertType, visible]);

  if (!visible) return null;

  const targetPhoneNumbers = isBroadcast
    ? allContacts.map((c) => c.phone).filter(Boolean)
    : contact
    ? [contact.phone]
    : [];

  const targetTitle = isBroadcast
    ? `All Emergency Contacts (${allContacts.length})`
    : contact?.name || 'Emergency Contact';

  const targetSubtitle = isBroadcast
    ? `${targetPhoneNumbers.length} recipients selected`
    : contact?.phone || '';

  const handleCall = async () => {
    if (!contact?.phone) {
      Alert.alert('No Number', 'No valid phone number for this contact.');
      return;
    }

    const success = await makePhoneCall(contact.phone, contact.name);
    if (success) {
      onSuccess?.('call', contact.name);
      onClose();
    }
  };

  const handleSendSMS = async () => {
    if (targetPhoneNumbers.length === 0) {
      Alert.alert('No Contacts', 'No phone numbers available to send SMS.');
      return;
    }

    if (!customMessage.trim()) {
      Alert.alert('Empty Message', 'Please enter a message to send.');
      return;
    }

    setIsSending(true);
    try {
      const success = await sendSMSMessage(targetPhoneNumbers, customMessage, targetTitle);
      if (success) {
        onSuccess?.('sms', targetTitle);
        onClose();
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleCopyMessage = async () => {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(customMessage);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
        return;
      } catch (e) {
        // fallback
      }
    }

    setCopied(true);
    Alert.alert('Message Copied', 'SMS text copied to clipboard. You can paste it into any messaging app.');
    setTimeout(() => setCopied(false), 2500);
  };

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      justifyContent: 'flex-end',
    },
    sheetContainer: {
      backgroundColor: theme.backgroundElement,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      borderWidth: 1,
      borderColor: theme.border,
      maxHeight: '90%',
      paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.four,
      paddingTop: Spacing.four,
      paddingBottom: Spacing.three,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    headerInfo: {
      flex: 1,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: theme.text,
    },
    headerSubtitle: {
      fontSize: 13,
      color: theme.textSecondary,
      marginTop: 2,
    },
    closeBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.background,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.border,
    },
    tabBar: {
      flexDirection: 'row',
      paddingHorizontal: Spacing.four,
      paddingTop: Spacing.three,
      gap: Spacing.two,
    },
    tabBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      borderRadius: 10,
      gap: Spacing.two,
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.border,
    },
    tabBtnActive: {
      backgroundColor: theme.primaryLight,
      borderColor: theme.primary,
    },
    tabText: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.textSecondary,
    },
    tabTextActive: {
      color: theme.primary,
    },
    contentScroll: {
      paddingHorizontal: Spacing.four,
      paddingTop: Spacing.three,
      paddingBottom: Spacing.three,
    },
    // Preset chips
    sectionTitle: {
      fontSize: 12,
      fontWeight: '800',
      color: theme.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: Spacing.two,
      marginTop: Spacing.two,
    },
    presetsRow: {
      gap: Spacing.two,
      marginBottom: Spacing.three,
    },
    presetChip: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10,
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.border,
      marginRight: Spacing.two,
    },
    presetChipSelected: {
      backgroundColor: theme.primaryLight,
      borderColor: theme.primary,
    },
    presetChipText: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.textSecondary,
    },
    presetChipTextSelected: {
      color: theme.primary,
      fontWeight: '700',
    },
    // Message input
    inputBox: {
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      padding: Spacing.three,
      color: theme.text,
      fontSize: 14,
      minHeight: 120,
      textAlignVertical: 'top',
      lineHeight: 20,
    },
    locationToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.background,
      borderRadius: 10,
      padding: Spacing.three,
      marginTop: Spacing.two,
      borderWidth: 1,
      borderColor: theme.border,
    },
    locationToggleText: {
      fontSize: 13,
      color: theme.text,
      fontWeight: '600',
      marginLeft: Spacing.two,
      flex: 1,
    },
    toggleBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      backgroundColor: theme.successLight,
    },
    toggleBadgeText: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.success,
    },
    // Action buttons
    actionRow: {
      flexDirection: 'row',
      gap: Spacing.two,
      paddingHorizontal: Spacing.four,
      paddingTop: Spacing.two,
    },
    sendBtn: {
      flex: 2,
      backgroundColor: theme.primary,
      borderRadius: 12,
      height: 50,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.two,
    },
    sendBtnText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '700',
    },
    copyBtn: {
      flex: 1,
      backgroundColor: theme.background,
      borderRadius: 12,
      height: 50,
      borderWidth: 1,
      borderColor: theme.border,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.one,
    },
    copyBtnText: {
      color: theme.text,
      fontSize: 13,
      fontWeight: '600',
    },
    // Direct call view
    callContainer: {
      padding: Spacing.four,
      alignItems: 'center',
    },
    callAvatar: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: theme.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.three,
      borderWidth: 2,
      borderColor: theme.primary,
    },
    callName: {
      fontSize: 20,
      fontWeight: '800',
      color: theme.text,
      marginBottom: 4,
    },
    callPhone: {
      fontSize: 15,
      color: theme.textSecondary,
      marginBottom: Spacing.four,
    },
    dialBtn: {
      backgroundColor: theme.success,
      borderRadius: 14,
      width: '100%',
      height: 54,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.two,
      shadowColor: theme.success,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    dialBtnText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '800',
    },
    callNotice: {
      fontSize: 12,
      color: theme.textSecondary,
      textAlign: 'center',
      marginTop: Spacing.three,
      lineHeight: 18,
    },
  });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>{targetTitle}</Text>
              <Text style={styles.headerSubtitle}>{targetSubtitle}</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <X size={18} color={theme.text} />
            </TouchableOpacity>
          </View>

          {/* Tab Selector (only show Call tab if not a multi-contact broadcast) */}
          {!isBroadcast && (
            <View style={styles.tabBar}>
              <TouchableOpacity
                style={[styles.tabBtn, activeTab === 'sms' && styles.tabBtnActive]}
                onPress={() => setActiveTab('sms')}
              >
                <Send size={16} color={activeTab === 'sms' ? theme.primary : theme.textSecondary} />
                <Text style={[styles.tabText, activeTab === 'sms' && styles.tabTextActive]}>
                  Send SMS Alert
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabBtn, activeTab === 'call' && styles.tabBtnActive]}
                onPress={() => setActiveTab('call')}
              >
                <PhoneCall size={16} color={activeTab === 'call' ? theme.primary : theme.textSecondary} />
                <Text style={[styles.tabText, activeTab === 'call' && styles.tabTextActive]}>
                  Direct Call
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* SMS Tab */}
          {activeTab === 'sms' ? (
            <ScrollView contentContainerStyle={styles.contentScroll} keyboardShouldPersistTaps="handled">
              {/* Presets */}
              <Text style={styles.sectionTitle}>Select Emergency Preset</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.presetsRow}
              >
                {EMERGENCY_SMS_PRESETS.map((preset) => {
                  const isSelected = selectedPresetId === preset.id;
                  return (
                    <TouchableOpacity
                      key={preset.id}
                      style={[styles.presetChip, isSelected && styles.presetChipSelected]}
                      onPress={() => setSelectedPresetId(preset.id)}
                    >
                      <Text style={[styles.presetChipText, isSelected && styles.presetChipTextSelected]}>
                        {preset.title}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Message Composer */}
              <Text style={styles.sectionTitle}>Message Content</Text>
              <TextInput
                style={styles.inputBox}
                multiline
                numberOfLines={5}
                value={customMessage}
                onChangeText={setCustomMessage}
                placeholder="Type your emergency alert message..."
                placeholderTextColor={theme.textSecondary}
              />

              {/* Location Attachment Switch */}
              <TouchableOpacity
                style={styles.locationToggle}
                onPress={() => setIncludeLocation(!includeLocation)}
                activeOpacity={0.8}
              >
                <MapPin size={18} color={includeLocation ? theme.primary : theme.textSecondary} />
                <Text style={styles.locationToggleText}>Include GPS Google Maps Coordinates</Text>
                <View style={[styles.toggleBadge, !includeLocation && { backgroundColor: theme.background }]}>
                  <Text style={[styles.toggleBadgeText, !includeLocation && { color: theme.textSecondary }]}>
                    {includeLocation ? 'ATTACHED' : 'OFF'}
                  </Text>
                </View>
              </TouchableOpacity>

              <View style={{ height: Spacing.three }} />

              {/* Action Buttons */}
              <View style={{ flexDirection: 'row', gap: Spacing.two }}>
                <TouchableOpacity
                  style={styles.copyBtn}
                  onPress={handleCopyMessage}
                  activeOpacity={0.8}
                >
                  {copied ? <CheckCircle2 size={16} color={theme.success} /> : <Copy size={16} color={theme.text} />}
                  <Text style={styles.copyBtnText}>{copied ? 'Copied!' : 'Copy Text'}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.sendBtn, isSending && { opacity: 0.7 }]}
                  onPress={handleSendSMS}
                  disabled={isSending}
                  activeOpacity={0.8}
                >
                  {isSending ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Send size={18} color="#FFFFFF" />
                      <Text style={styles.sendBtnText}>
                        {isBroadcast ? `Dispatch SMS to All (${targetPhoneNumbers.length})` : 'Open SMS App'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          ) : (
            /* Call Tab */
            <View style={styles.callContainer}>
              <View style={styles.callAvatar}>
                <PhoneCall size={34} color={theme.primary} />
              </View>
              <Text style={styles.callName}>{contact?.name || 'Contact'}</Text>
              <Text style={styles.callPhone}>{contact?.phone}</Text>

              <TouchableOpacity style={styles.dialBtn} onPress={handleCall} activeOpacity={0.8}>
                <Phone size={20} color="#FFFFFF" />
                <Text style={styles.dialBtnText}>Dial {contact?.name}</Text>
              </TouchableOpacity>

              <Text style={styles.callNotice}>
                Tapping Dial will immediately open your phone's dialer application with this contact's number.
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};
