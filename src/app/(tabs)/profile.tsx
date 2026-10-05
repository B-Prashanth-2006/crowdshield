import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Switch } from 'react-native';
import { Alert } from '@/utils/alert';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/auth';
import { useAppPreferencesStore } from '@/store/preferences';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { User, Shield, Info, Download, Trash2, Key, Bell, ShieldAlert, LogOut, FileText } from 'lucide-react-native';
import { AccountDataExportModal } from '@/components/account-data-export-modal';

export default function ProfileScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { user, updateProfile, switchRole, logout } = useAuthStore();
  const { 
    pushEnabled, setPushEnabled, 
    smsEnabled, setSmsEnabled, 
    alertRadiusKm, setAlertRadius 
  } = useAppPreferencesStore();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bloodGroup, setBloodGroup] = useState(user?.blood_group || '');
  const [notes, setNotes] = useState(user?.emergency_notes || '');
  const [exportModalVisible, setExportModalVisible] = useState(false);

  const handleUpdateProfile = async () => {
    const success = await updateProfile({
      name,
      phone,
      blood_group: bloodGroup,
      emergency_notes: notes,
    });
    if (success) {
      Alert.alert('Profile Saved', 'Your personal safety details have been updated.');
    }
  };

  const handleDownloadData = () => {
    setExportModalVisible(true);
  };

  const handleDeleteReports = () => {
    Alert.alert(
      'Delete Incident Reports',
      'Are you sure you want to request deletion of all your submitted incident reports? This request will be queued for moderator review.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Request Delete', 
          style: 'destructive',
          onPress: () => Alert.alert('Request Sent', 'Deletion requests are pending.')
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'WARNING: This will permanently delete your safety profile and clear all emergency contacts. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Permanently Delete', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/welcome');
          }
        },
      ]
    );
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/welcome');
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
    card: {
      backgroundColor: theme.backgroundElement,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 16,
      padding: Spacing.four,
      marginBottom: Spacing.four,
    },
    sectionLabel: {
      fontSize: 14,
      fontWeight: '800',
      color: theme.text,
      textTransform: 'uppercase',
      marginBottom: Spacing.three,
      letterSpacing: 0.5,
    },
    inputLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.textSecondary,
      marginBottom: Spacing.one,
      marginTop: Spacing.one,
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
      marginBottom: Spacing.two,
    },
    input: {
      flex: 1,
      color: theme.text,
      marginLeft: Spacing.two,
      fontSize: 15,
    },
    largeInput: {
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 10,
      paddingHorizontal: Spacing.three,
      paddingVertical: Spacing.two,
      color: theme.text,
      fontSize: 15,
      minHeight: 60,
      textAlignVertical: 'top',
      marginBottom: Spacing.three,
    },
    saveBtn: {
      backgroundColor: theme.primary,
      borderRadius: 10,
      height: 48,
      alignItems: 'center',
      justifyContent: 'center',
    },
    saveBtnText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '700',
    },
    // Toggle row
    toggleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: Spacing.two,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    toggleInfo: {
      flex: 1,
      marginRight: Spacing.two,
    },
    toggleTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.text,
    },
    toggleDesc: {
      fontSize: 12,
      color: theme.textSecondary,
      marginTop: 2,
    },
    // Sandbox role rows
    roleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: Spacing.two,
      marginTop: Spacing.two,
    },
    roleBtn: {
      flex: 1,
      paddingVertical: Spacing.two,
      borderRadius: 8,
      borderWidth: 1,
      alignItems: 'center',
    },
    roleBtnText: {
      fontSize: 12,
      fontWeight: '700',
    },
    // Privacy list
    privacyItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: Spacing.three,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    privacyTextWrap: {
      flex: 1,
      marginLeft: Spacing.three,
    },
    privacyTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.text,
    },
    privacyDesc: {
      fontSize: 12,
      color: theme.textSecondary,
      marginTop: 2,
    },
    logoutBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderColor: theme.border,
      borderWidth: 1,
      borderRadius: 12,
      paddingVertical: Spacing.three,
      gap: Spacing.two,
      marginBottom: Spacing.five,
    },
    logoutText: {
      color: theme.text,
      fontSize: 15,
      fontWeight: '700',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <Text style={styles.title}>Safety Profile</Text>
        <Text style={styles.subtitle}>Manage your emergency details, alerts notifications, and privacy center settings.</Text>

        {/* Sandbox Role Switcher */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Testing Sandbox Role</Text>
          <Text style={{ fontSize: 13, color: theme.textSecondary, marginBottom: Spacing.two }}>
            Switch roles to test different sections of CrowdShield immediately. Current Role: <Text style={{ fontWeight: '800', color: theme.primary }}>{user?.role.toUpperCase()}</Text>
          </Text>
          <View style={styles.roleRow}>
            {['member', 'moderator', 'admin'].map((r) => (
              <TouchableOpacity
                key={r}
                style={[
                  styles.roleBtn,
                  {
                    backgroundColor: user?.role === r ? theme.primaryLight : theme.background,
                    borderColor: user?.role === r ? theme.primary : theme.border,
                  },
                ]}
                onPress={() => switchRole(r as any)}
              >
                <Text style={[styles.roleBtnText, { color: user?.role === r ? theme.primary : theme.textSecondary }]}>
                  {r.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Profile Card */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Profile details</Text>
          
          <Text style={styles.inputLabel}>Full Name</Text>
          <View style={styles.inputContainer}>
            <User size={16} color={theme.textSecondary} />
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={name}
              onChangeText={setName}
            />
          </View>

          <Text style={styles.inputLabel}>Phone Number</Text>
          <View style={styles.inputContainer}>
            <Shield size={16} color={theme.textSecondary} />
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              value={phone}
              onChangeText={setPhone}
            />
          </View>

          <Text style={styles.inputLabel}>Blood Group</Text>
          <View style={styles.inputContainer}>
            <Info size={16} color={theme.textSecondary} />
            <TextInput
              style={styles.input}
              placeholder="e.g. O+"
              value={bloodGroup}
              onChangeText={setBloodGroup}
            />
          </View>

          <Text style={styles.inputLabel}>Emergency Medical Notes</Text>
          <TextInput
            style={styles.largeInput}
            placeholder="List any medical issues, prescription needs, allergies, etc."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={2}
          />

          <TouchableOpacity style={styles.saveBtn} onPress={handleUpdateProfile}>
            <Text style={styles.saveBtnText}>Save Profile Info</Text>
          </TouchableOpacity>
        </View>

        {/* Preferences / Notifications */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Alert channels</Text>
          
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleTitle}>Push Warnings</Text>
              <Text style={styles.toggleDesc}>Alert me on screen for critical hazards nearby.</Text>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={setPushEnabled}
              trackColor={{ false: theme.border, true: theme.primary }}
            />
          </View>

          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleTitle}>SMS Dispatch notifications</Text>
              <Text style={styles.toggleDesc}>SMS contacts when I miss my check-in ETA.</Text>
            </View>
            <Switch
              value={smsEnabled}
              onValueChange={setSmsEnabled}
              trackColor={{ false: theme.border, true: theme.primary }}
            />
          </View>

          <View style={[styles.toggleRow, { borderBottomWidth: 0 }]}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleTitle}>Proximity Radius: {alertRadiusKm} km</Text>
              <Text style={styles.toggleDesc}>Filter alerts based on distance coordinates.</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {[2.0, 5.0, 10.0].map((km) => (
                <TouchableOpacity
                  key={km}
                  style={{
                    backgroundColor: alertRadiusKm === km ? theme.primary : theme.background,
                    borderWidth: 1,
                    borderColor: theme.border,
                    borderRadius: 6,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                  }}
                  onPress={() => setAlertRadius(km)}
                >
                  <Text style={{ fontSize: 11, fontWeight: '700', color: alertRadiusKm === km ? '#FFFFFF' : theme.text }}>
                    {km}k
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Privacy Center */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Privacy Center</Text>

          {/* Download */}
          <TouchableOpacity style={styles.privacyItem} onPress={handleDownloadData}>
            <FileText size={20} color={theme.primary} />
            <View style={styles.privacyTextWrap}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.privacyTitle}>Request Account Data & Logs</Text>
                <View
                  style={{
                    backgroundColor: theme.primaryLight,
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    borderRadius: 4,
                  }}
                >
                  <Text style={{ fontSize: 10, fontWeight: '800', color: theme.primary }}>.PDF</Text>
                </View>
              </View>
              <Text style={styles.privacyDesc}>
                Summarize & download your profile, emergency contacts, SOS alerts, trips, and reports in a signed PDF document.
              </Text>
            </View>
          </TouchableOpacity>

          {/* Delete Reports */}
          <TouchableOpacity style={styles.privacyItem} onPress={handleDeleteReports}>
            <Trash2 size={20} color={theme.warning} />
            <View style={styles.privacyTextWrap}>
              <Text style={styles.privacyTitle}>Delete Selected Reports</Text>
              <Text style={styles.privacyDesc}>Anonymize or request removal of past reports.</Text>
            </View>
          </TouchableOpacity>

          {/* Delete Account */}
          <TouchableOpacity style={[styles.privacyItem, { borderBottomWidth: 0 }]} onPress={handleDeleteAccount}>
            <ShieldAlert size={20} color={theme.danger} />
            <View style={styles.privacyTextWrap}>
              <Text style={styles.privacyTitle}>Permanently Delete Account</Text>
              <Text style={styles.privacyDesc}>Remove all profile data and log histories.</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Logout button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <LogOut size={18} color={theme.text} />
          <Text style={styles.logoutText}>Log Out Account</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Account Data & Safety Audit PDF Export Modal */}
      <AccountDataExportModal
        visible={exportModalVisible}
        onClose={() => setExportModalVisible(false)}
      />
    </SafeAreaView>
  );
}
