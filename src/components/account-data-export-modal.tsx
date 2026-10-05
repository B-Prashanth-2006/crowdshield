import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {
  FileText,
  Download,
  Eye,
  CheckCircle2,
  X,
  Shield,
  Users,
  ShieldAlert,
  Clock,
  AlertCircle,
  FileCode,
} from 'lucide-react-native';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { Alert } from '@/utils/alert';
import { useAuthStore } from '@/store/auth';
import { useContactStore } from '@/store/contacts';
import { useSOSStore } from '@/store/sos';
import { useCheckInStore } from '@/store/checkin';
import { useIncidentStore } from '@/store/incident';
import { useAppPreferencesStore } from '@/store/preferences';
import {
  generateAccountDataPDF,
  downloadOrSharePDF,
  previewPDF,
} from '@/utils/pdf-generator';

interface AccountDataExportModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AccountDataExportModal: React.FC<AccountDataExportModalProps> = ({
  visible,
  onClose,
}) => {
  const theme = useTheme();
  const { user } = useAuthStore();
  const { contacts } = useContactStore();
  const { activeSOS } = useSOSStore();
  const { activeCheckIn } = useCheckInStore();
  const { incidents } = useIncidentStore();
  const preferences = useAppPreferencesStore();

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  // Inclusion toggles
  const [includeProfile, setIncludeProfile] = useState<boolean>(true);
  const [includeContacts, setIncludeContacts] = useState<boolean>(true);
  const [includeSOS, setIncludeSOS] = useState<boolean>(true);
  const [includeTrips, setIncludeTrips] = useState<boolean>(true);
  const [includeIncidents, setIncludeIncidents] = useState<boolean>(true);

  if (!visible) return null;

  // Gather all historical and active data
  const sosHistory = activeSOS ? [activeSOS] : [];
  const trips = activeCheckIn ? [activeCheckIn] : [];

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    setDownloadSuccess(false);

    try {
      // Allow UI to update spinner
      await new Promise((r) => setTimeout(r, 200));

      const pdfBytes = generateAccountDataPDF({
        user: includeProfile ? user : null,
        contacts: includeContacts ? contacts : [],
        sosHistory: includeSOS ? sosHistory : [],
        trips: includeTrips ? trips : [],
        incidents: includeIncidents ? incidents : [],
        preferences: {
          pushEnabled: preferences.pushEnabled,
          smsEnabled: preferences.smsEnabled,
          alertRadiusKm: preferences.alertRadiusKm,
        },
      });

      const safeName = (user?.name || 'Account').replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `CrowdShield_Account_Data_${safeName}_${new Date().toISOString().slice(0, 10)}.pdf`;

      const result = await downloadOrSharePDF(pdfBytes, filename);
      if (result.success) {
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 4500);
      } else {
        Alert.alert('Download Error', result.error || 'Failed to download PDF.');
      }
    } catch (err: any) {
      console.error(err);
      Alert.alert('Export Failed', err.message || 'Error compiling PDF data.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreviewPDF = () => {
    try {
      const pdfBytes = generateAccountDataPDF({
        user: includeProfile ? user : null,
        contacts: includeContacts ? contacts : [],
        sosHistory: includeSOS ? sosHistory : [],
        trips: includeTrips ? trips : [],
        incidents: includeIncidents ? incidents : [],
        preferences: {
          pushEnabled: preferences.pushEnabled,
          smsEnabled: preferences.smsEnabled,
          alertRadiusKm: preferences.alertRadiusKm,
        },
      });

      previewPDF(pdfBytes);
    } catch (err: any) {
      Alert.alert('Preview Failed', err.message);
    }
  };

  const handleDownloadJSON = () => {
    try {
      const exportObject = {
        exportDate: new Date().toISOString(),
        auditReference: `CS-AUDIT-${Date.now().toString(36).toUpperCase()}`,
        profile: user,
        contacts,
        sosHistory,
        checkInTrips: trips,
        incidents,
        preferences: {
          pushEnabled: preferences.pushEnabled,
          smsEnabled: preferences.smsEnabled,
          alertRadiusKm: preferences.alertRadiusKm,
        },
      };

      const jsonStr = JSON.stringify(exportObject, null, 2);

      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `CrowdShield_Data_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        Alert.alert('JSON Exported', 'Raw account JSON data downloaded successfully.');
      }
    } catch (e: any) {
      Alert.alert('Export Error', e.message);
    }
  };

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.78)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: Spacing.four,
    },
    sheetContainer: {
      backgroundColor: theme.backgroundElement,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: theme.border,
      width: '100%',
      maxWidth: 500,
      maxHeight: '92%',
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.4,
      shadowRadius: 20,
      elevation: 10,
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
    headerIconWrap: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: Spacing.three,
    },
    headerInfo: {
      flex: 1,
    },
    headerTitle: {
      fontSize: 17,
      fontWeight: '800',
      color: theme.text,
    },
    headerSubtitle: {
      fontSize: 12,
      color: theme.textSecondary,
      marginTop: 2,
    },
    closeBtn: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: theme.background,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.border,
    },
    contentScroll: {
      paddingHorizontal: Spacing.four,
      paddingVertical: Spacing.three,
      gap: Spacing.three,
    },
    successBanner: {
      backgroundColor: theme.successLight,
      borderColor: theme.success,
      borderWidth: 1,
      borderRadius: 12,
      padding: Spacing.three,
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
    },
    successText: {
      color: theme.success,
      fontSize: 13,
      fontWeight: '700',
      flex: 1,
    },
    // Summary Cards Grid
    gridRow: {
      flexDirection: 'row',
      gap: Spacing.two,
    },
    metricCard: {
      flex: 1,
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      padding: Spacing.two,
      alignItems: 'center',
    },
    metricVal: {
      fontSize: 18,
      fontWeight: '900',
      color: theme.text,
      marginTop: 2,
    },
    metricLabel: {
      fontSize: 9,
      fontWeight: '800',
      color: theme.textSecondary,
      textTransform: 'uppercase',
      marginTop: 2,
      textAlign: 'center',
    },
    // Section Checkboxes
    sectionTitle: {
      fontSize: 12,
      fontWeight: '800',
      color: theme.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginTop: Spacing.one,
    },
    checkboxList: {
      backgroundColor: theme.background,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.border,
      overflow: 'hidden',
    },
    checkItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing.three,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    checkItemText: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.text,
      marginLeft: Spacing.two,
      flex: 1,
    },
    checkItemBadge: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.primary,
      backgroundColor: theme.primaryLight,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 6,
    },
    // Document format badge
    formatCard: {
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      padding: Spacing.three,
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
    },
    formatTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.text,
    },
    formatDesc: {
      fontSize: 11,
      color: theme.textSecondary,
      marginTop: 1,
    },
    // Action Footer
    footer: {
      padding: Spacing.four,
      borderTopWidth: 1,
      borderTopColor: theme.border,
      backgroundColor: theme.backgroundElement,
      gap: Spacing.two,
    },
    downloadBtn: {
      backgroundColor: theme.primary,
      height: 50,
      borderRadius: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.two,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    downloadBtnText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '800',
    },
    secondaryRow: {
      flexDirection: 'row',
      gap: Spacing.two,
    },
    secondaryBtn: {
      flex: 1,
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.border,
      height: 42,
      borderRadius: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    },
    secondaryBtnText: {
      color: theme.text,
      fontSize: 12,
      fontWeight: '700',
    },
  });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerIconWrap}>
              <FileText size={22} color={theme.primary} />
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>Export Account Data</Text>
              <Text style={styles.headerSubtitle}>Summarize all activity logs in PDF format</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <X size={16} color={theme.text} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.contentScroll} showsVerticalScrollIndicator={false}>
            {/* Download Success Notice */}
            {downloadSuccess && (
              <View style={styles.successBanner}>
                <CheckCircle2 size={18} color={theme.success} />
                <Text style={styles.successText}>
                  Account data successfully compiled and downloaded as .PDF!
                </Text>
              </View>
            )}

            {/* Quick Metrics */}
            <Text style={styles.sectionTitle}>Summary of Account Data to Export</Text>
            <View style={styles.gridRow}>
              <View style={styles.metricCard}>
                <Users size={16} color={theme.primary} />
                <Text style={styles.metricVal}>{contacts.length}</Text>
                <Text style={styles.metricLabel}>Contacts</Text>
              </View>
              <View style={styles.metricCard}>
                <ShieldAlert size={16} color={theme.danger} />
                <Text style={styles.metricVal}>{sosHistory.length}</Text>
                <Text style={styles.metricLabel}>SOS Alerts</Text>
              </View>
              <View style={styles.metricCard}>
                <Clock size={16} color={theme.success} />
                <Text style={styles.metricVal}>{trips.length}</Text>
                <Text style={styles.metricLabel}>Trip ETAs</Text>
              </View>
              <View style={styles.metricCard}>
                <AlertCircle size={16} color={theme.warning} />
                <Text style={styles.metricVal}>{incidents.length}</Text>
                <Text style={styles.metricLabel}>Reports</Text>
              </View>
            </View>

            {/* Inclusions */}
            <Text style={styles.sectionTitle}>Select Log Categories to Include</Text>
            <View style={styles.checkboxList}>
              <TouchableOpacity
                style={styles.checkItem}
                onPress={() => setIncludeProfile(!includeProfile)}
                activeOpacity={0.7}
              >
                <Shield size={16} color={includeProfile ? theme.primary : theme.textSecondary} />
                <Text style={styles.checkItemText}>Profile & Emergency Medical Notes</Text>
                <Text style={styles.checkItemBadge}>{includeProfile ? 'INCLUDED' : 'SKIP'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.checkItem}
                onPress={() => setIncludeContacts(!includeContacts)}
                activeOpacity={0.7}
              >
                <Users size={16} color={includeContacts ? theme.primary : theme.textSecondary} />
                <Text style={styles.checkItemText}>Emergency Contacts Directory ({contacts.length})</Text>
                <Text style={styles.checkItemBadge}>{includeContacts ? 'INCLUDED' : 'SKIP'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.checkItem}
                onPress={() => setIncludeSOS(!includeSOS)}
                activeOpacity={0.7}
              >
                <ShieldAlert size={16} color={includeSOS ? theme.primary : theme.textSecondary} />
                <Text style={styles.checkItemText}>SOS Broadcasts & Location Tracking</Text>
                <Text style={styles.checkItemBadge}>{includeSOS ? 'INCLUDED' : 'SKIP'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.checkItem}
                onPress={() => setIncludeTrips(!includeTrips)}
                activeOpacity={0.7}
              >
                <Clock size={16} color={includeTrips ? theme.primary : theme.textSecondary} />
                <Text style={styles.checkItemText}>Safe Check-in Trip Records</Text>
                <Text style={styles.checkItemBadge}>{includeTrips ? 'INCLUDED' : 'SKIP'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.checkItem, { borderBottomWidth: 0 }]}
                onPress={() => setIncludeIncidents(!includeIncidents)}
                activeOpacity={0.7}
              >
                <AlertCircle size={16} color={includeIncidents ? theme.primary : theme.textSecondary} />
                <Text style={styles.checkItemText}>Community Incident Submissions ({incidents.length})</Text>
                <Text style={styles.checkItemBadge}>{includeIncidents ? 'INCLUDED' : 'SKIP'}</Text>
              </TouchableOpacity>
            </View>

            {/* Document specs */}
            <View style={styles.formatCard}>
              <FileText size={20} color={theme.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.formatTitle}>Output Format: Standard A4 PDF (.pdf)</Text>
                <Text style={styles.formatDesc}>
                  Multi-page security audit report complete with tables, metrics, and compliance metadata.
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Action Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.downloadBtn, isGenerating && { opacity: 0.7 }]}
              onPress={handleDownloadPDF}
              disabled={isGenerating}
              activeOpacity={0.8}
            >
              {isGenerating ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Download size={18} color="#FFFFFF" />
                  <Text style={styles.downloadBtnText}>Download Account Data (.PDF)</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.secondaryRow}>
              {Platform.OS === 'web' && (
                <TouchableOpacity
                  style={styles.secondaryBtn}
                  onPress={handlePreviewPDF}
                  activeOpacity={0.8}
                >
                  <Eye size={14} color={theme.text} />
                  <Text style={styles.secondaryBtnText}>Preview / Print</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={handleDownloadJSON}
                activeOpacity={0.8}
              >
                <FileCode size={14} color={theme.text} />
                <Text style={styles.secondaryBtnText}>Export JSON</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};
