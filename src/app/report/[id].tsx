import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Image, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useIncidentStore } from '@/store/incident';
import { useAuthStore } from '@/store/auth';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { ShieldCheck, MessageSquare, Send, ChevronLeft, MapPin, Clock, ShieldAlert, FileText, CheckCircle2 } from 'lucide-react-native';

export default function IncidentDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const theme = useTheme();

  const { user } = useAuthStore();
  const { incidents, media, updates, addIncidentUpdate, moderateIncident, isLoading } = useIncidentStore();

  const [commentText, setCommentText] = useState('');
  const [modNotes, setModNotes] = useState('');

  const incident = incidents.find((inc) => inc.id === id);
  const incidentMedia = media[id as string] || [];
  const incidentUpdates = updates[id as string] || [];

  if (!incident) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: theme.text, fontSize: 16 }}>Incident report not found.</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: theme.primary }}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleAddComment = async () => {
    if (!commentText.trim()) return;

    const success = await addIncidentUpdate(
      incident.id,
      user?.id || null,
      user?.name || 'Anonymous Member',
      user?.role || 'member',
      commentText
    );

    if (success) {
      setCommentText('');
    } else {
      Alert.alert('Error', 'Failed to submit update.');
    }
  };

  const handleModerate = async (action: 'verify' | 'reject' | 'resolve' | 'escalate') => {
    if (!user) return;
    
    Alert.alert(
      'Confirm Action',
      `Are you sure you want to execute [${action}] on this incident?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            const success = await moderateIncident(incident.id, user.id, action, modNotes);
            if (success) {
              setModNotes('');
              Alert.alert('Success', `Incident status set to ${action}.`);
            } else {
              Alert.alert('Error', 'Failed to update moderation state.');
            }
          },
        },
      ]
    );
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'Critical': return theme.danger;
      case 'High': return theme.warning;
      case 'Medium': return theme.primary;
      default: return theme.success;
    }
  };

  const getUrgencyLightColor = (urgency: string) => {
    switch (urgency) {
      case 'Critical': return theme.dangerLight;
      case 'High': return theme.warningLight;
      case 'Medium': return theme.primaryLight;
      default: return theme.successLight;
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing.four,
      paddingVertical: Spacing.three,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    headerTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: theme.text,
      marginLeft: Spacing.three,
      flex: 1,
    },
    badge: {
      paddingHorizontal: Spacing.two,
      paddingVertical: 4,
      borderRadius: 6,
    },
    badgeText: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: '800',
      textTransform: 'uppercase',
    },
    scrollView: {
      padding: Spacing.four,
    },
    reporterCard: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.three,
    },
    reporterName: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.text,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.one,
      marginTop: 2,
    },
    metaText: {
      fontSize: 12,
      color: theme.textSecondary,
    },
    description: {
      fontSize: 15,
      lineHeight: 22,
      color: theme.text,
      marginVertical: Spacing.three,
    },
    // AI assessment preview
    aiBlock: {
      backgroundColor: theme.primaryLight,
      borderRadius: 12,
      padding: Spacing.three,
      marginVertical: Spacing.two,
      borderWidth: 1,
      borderColor: theme.primary,
    },
    aiTitle: {
      fontSize: 13,
      fontWeight: '800',
      color: theme.primary,
      marginBottom: 4,
      textTransform: 'uppercase',
    },
    aiText: {
      fontSize: 13,
      color: theme.textSecondary,
      lineHeight: 18,
    },
    // Media attachment
    mediaScroll: {
      marginVertical: Spacing.three,
    },
    mediaImg: {
      width: 280,
      height: 160,
      borderRadius: 12,
      marginRight: Spacing.three,
    },
    // Status Tracker Milestone
    statusTracker: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginVertical: Spacing.four,
      paddingVertical: Spacing.two,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: theme.border,
    },
    statusStep: {
      alignItems: 'center',
      flex: 1,
    },
    statusIconWrap: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 4,
    },
    statusLabel: {
      fontSize: 10,
      fontWeight: '700',
    },
    // Comments Thread
    commentsLabel: {
      fontSize: 14,
      fontWeight: '800',
      color: theme.text,
      textTransform: 'uppercase',
      marginTop: Spacing.three,
      marginBottom: Spacing.three,
    },
    commentCard: {
      backgroundColor: theme.backgroundElement,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      padding: Spacing.three,
      marginBottom: Spacing.two,
    },
    commentHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    commentUser: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.text,
    },
    commentText: {
      fontSize: 13,
      color: theme.textSecondary,
      lineHeight: 18,
    },
    // Input comment
    commentInputBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.backgroundElement,
      borderRadius: 12,
      paddingHorizontal: Spacing.three,
      height: 48,
      marginTop: Spacing.two,
      marginBottom: Spacing.five,
      borderWidth: 1,
      borderColor: theme.border,
    },
    commentInput: {
      flex: 1,
      color: theme.text,
      fontSize: 14,
    },
    // Moderator Section
    modConsole: {
      backgroundColor: theme.dangerLight,
      borderColor: theme.danger,
      borderWidth: 1,
      borderRadius: 16,
      padding: Spacing.four,
      marginVertical: Spacing.four,
    },
    modConsoleTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: theme.danger,
      textTransform: 'uppercase',
      marginBottom: Spacing.two,
    },
    modGrid: {
      flexDirection: 'row',
      gap: Spacing.two,
      marginTop: Spacing.three,
    },
    modActionBtn: {
      flex: 1,
      height: 40,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

  const milestones = ['Submitted', 'Under Review', 'Verified', 'Resolved'];
  const currentStepIndex = milestones.indexOf(incident.status);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <ChevronLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {incident.category} Alert
        </Text>
        <View style={[styles.badge, { backgroundColor: getUrgencyColor(incident.urgency) }]}>
          <Text style={styles.badgeText}>{incident.urgency}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollView}>
        {/* Reporter info */}
        <View style={styles.reporterCard}>
          <View>
            <Text style={styles.reporterName}>
              Reporter: {incident.is_anonymous ? 'Anonymous' : incident.reporter_name || 'Community Member'}
            </Text>
            <View style={styles.metaRow}>
              <Clock size={12} color={theme.textSecondary} />
              <Text style={styles.metaText}>
                {new Date(incident.incident_time).toLocaleDateString()} at{' '}
                {new Date(incident.incident_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <MapPin size={12} color={theme.textSecondary} />
              <Text style={styles.metaText}>{incident.location_name || 'Coordinates'}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.description}>{incident.description}</Text>

        {/* AI summary block if available */}
        {incident.summary && (
          <View style={styles.aiBlock}>
            <Text style={styles.aiTitle}>AI Critical Summary</Text>
            <Text style={styles.aiText}>{incident.summary}</Text>
            
            {incident.safety_actions.length > 0 && (
              <View style={{ marginTop: Spacing.two }}>
                <Text style={[styles.aiTitle, { color: theme.textSecondary }]}>Safety Actions suggested</Text>
                {incident.safety_actions.map((act, idx) => (
                  <Text key={idx} style={{ fontSize: 11, color: theme.text, marginTop: 2 }}>
                    • {act}
                  </Text>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Media Attachments scroll */}
        {incidentMedia.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mediaScroll}>
            {incidentMedia.map((m) => (
              <Image key={m.id} source={{ uri: m.media_url }} style={styles.mediaImg} />
            ))}
          </ScrollView>
        )}

        {/* Status timeline milestone tracker */}
        <View style={styles.statusTracker}>
          {milestones.map((step, idx) => {
            const isCompleted = idx <= currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            const stepColor = isCurrent ? theme.primary : isCompleted ? theme.success : theme.backgroundSelected;
            
            return (
              <View key={step} style={styles.statusStep}>
                <View style={[styles.statusIconWrap, { backgroundColor: isCompleted ? theme.successLight : theme.backgroundElement }]}>
                  <CheckCircle2 size={16} color={isCompleted ? theme.success : theme.textSecondary} />
                </View>
                <Text style={[styles.statusLabel, { color: isCurrent ? theme.primary : theme.textSecondary }]}>
                  {step}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Moderator Panel logic */}
        {(user?.role === 'moderator' || user?.role === 'admin') && (
          <View style={styles.modConsole}>
            <Text style={styles.modConsoleTitle}>Moderation Review Queue</Text>
            <TextInput
              style={{
                backgroundColor: theme.background,
                color: theme.text,
                borderRadius: 8,
                padding: 8,
                fontSize: 13,
                minHeight: 48,
                textAlignVertical: 'top',
                borderWidth: 1,
                borderColor: theme.border,
              }}
              placeholder="Provide moderator review notes or escalation details..."
              placeholderTextColor={theme.textSecondary}
              value={modNotes}
              onChangeText={setModNotes}
              multiline
            />
            
            <View style={styles.modGrid}>
              <TouchableOpacity
                style={[styles.modActionBtn, { backgroundColor: theme.primary }]}
                onPress={() => handleModerate('verify')}
                disabled={isLoading}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700' }}>Verify</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modActionBtn, { backgroundColor: theme.success }]}
                onPress={() => handleModerate('resolve')}
                disabled={isLoading}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700' }}>Resolve</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modActionBtn, { backgroundColor: theme.danger }]}
                onPress={() => handleModerate('reject')}
                disabled={isLoading}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700' }}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Community Comments / Updates */}
        <Text style={styles.commentsLabel}>Community Logs & Comments</Text>
        {incidentUpdates.map((upd) => (
          <View key={upd.id} style={styles.commentCard}>
            <View style={styles.commentHeader}>
              <Text style={styles.commentUser}>
                {upd.user_name} {upd.user_role === 'moderator' ? '(Mod)' : ''}
              </Text>
              <Text style={{ fontSize: 10, color: theme.textSecondary }}>
                {new Date(upd.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
            <Text style={styles.commentText}>{upd.update_text}</Text>
          </View>
        ))}

        {incidentUpdates.length === 0 && (
          <Text style={{ fontSize: 12, color: theme.textSecondary, fontStyle: 'italic', marginBottom: Spacing.three }}>
            No comments or updates logged yet.
          </Text>
        )}

        {/* Write Comment */}
        <View style={styles.commentInputBox}>
          <TextInput
            style={styles.commentInput}
            placeholder="Type comment or safety status update..."
            placeholderTextColor={theme.textSecondary}
            value={commentText}
            onChangeText={setCommentText}
          />
          <TouchableOpacity onPress={handleAddComment} style={{ padding: 4 }}>
            <Send size={18} color={theme.primary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
