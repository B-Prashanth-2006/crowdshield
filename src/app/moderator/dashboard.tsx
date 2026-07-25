import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useIncidentStore } from '@/store/incident';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { ChevronLeft, BarChart3, ListFilter, ShieldCheck, AlertCircle, FileText, CheckCircle2, History } from 'lucide-react-native';

export default function ModeratorDashboardScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { incidents } = useIncidentStore();

  const [activeTab, setActiveTab] = useState<'queue' | 'analytics' | 'audit'>('queue');

  // Filter unverified submissions
  const submittedQueue = incidents.filter((inc) => inc.status === 'Submitted' || inc.status === 'Under Review');

  // Analytics helper metrics
  const totalReports = incidents.length;
  const criticalCount = incidents.filter(i => i.urgency === 'Critical').length;
  const highCount = incidents.filter(i => i.urgency === 'High').length;
  const mediumCount = incidents.filter(i => i.urgency === 'Medium').length;
  const lowCount = incidents.filter(i => i.urgency === 'Low').length;

  const verifiedCount = incidents.filter(i => i.status === 'Verified').length;
  const resolvedCount = incidents.filter(i => i.status === 'Resolved').length;
  const rejectedCount = incidents.filter(i => i.status === 'Rejected').length;

  // Mock Audit Logs
  const auditLogs = [
    {
      id: 'aud-1',
      actor: 'Officer Alex Chen (Mod)',
      action: 'Incident Verification',
      target: 'inc-1 (Civic Center Gas leak)',
      time: '15 mins ago',
      details: 'Changed status from [Submitted] to [Verified]. Left notes: Fire crew dispatched.',
    },
    {
      id: 'aud-2',
      actor: 'Sarah Jenkins (Admin)',
      action: 'Incident Escalation',
      target: 'inc-2 (Dumpster fire on 8th St)',
      time: '35 mins ago',
      details: 'Marked urgency to Critical due to proximity of overhead electric cables.',
    },
    {
      id: 'aud-3',
      actor: 'Officer Alex Chen (Mod)',
      action: 'Incident Resolution',
      target: 'inc-3 (Market St Fender bender)',
      time: '1 hour ago',
      details: 'Changed status to [Resolved] after tow truck cleared the bottleneck.',
    },
  ];

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
      fontSize: 18,
      fontWeight: '800',
      color: theme.text,
      marginLeft: Spacing.three,
    },
    // Selector tabs
    tabContainer: {
      flexDirection: 'row',
      paddingHorizontal: Spacing.four,
      paddingVertical: Spacing.two,
      backgroundColor: theme.backgroundElement,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    tabBtn: {
      flex: 1,
      paddingVertical: Spacing.two,
      alignItems: 'center',
      borderBottomWidth: 3,
      borderBottomColor: 'transparent',
    },
    tabText: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.textSecondary,
    },
    scrollView: {
      padding: Spacing.four,
    },
    // Queue lists
    queueCard: {
      backgroundColor: theme.backgroundElement,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      padding: Spacing.three,
      marginBottom: Spacing.three,
    },
    queueHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.two,
    },
    queueTitle: {
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
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: '800',
      textTransform: 'uppercase',
    },
    queueDesc: {
      fontSize: 13,
      color: theme.textSecondary,
      lineHeight: 18,
      marginBottom: Spacing.two,
    },
    queueMeta: {
      fontSize: 11,
      color: theme.textSecondary,
      fontWeight: '600',
    },
    // Analytics visuals
    metricRow: {
      flexDirection: 'row',
      gap: Spacing.two,
      marginBottom: Spacing.four,
    },
    metricCard: {
      flex: 1,
      backgroundColor: theme.backgroundElement,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      padding: Spacing.three,
      alignItems: 'center',
    },
    metricVal: {
      fontSize: 22,
      fontWeight: '900',
      color: theme.text,
      marginTop: 4,
    },
    metricLabel: {
      fontSize: 10,
      color: theme.textSecondary,
      fontWeight: '700',
      textTransform: 'uppercase',
    },
    chartContainer: {
      backgroundColor: theme.backgroundElement,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 16,
      padding: Spacing.four,
      marginBottom: Spacing.four,
    },
    chartTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: theme.text,
      textTransform: 'uppercase',
      marginBottom: Spacing.three,
    },
    barRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Spacing.two,
    },
    barLabel: {
      width: 70,
      fontSize: 12,
      fontWeight: '600',
      color: theme.text,
    },
    barTrack: {
      flex: 1,
      height: 8,
      backgroundColor: theme.background,
      borderRadius: 4,
      marginHorizontal: Spacing.two,
      overflow: 'hidden',
    },
    barFill: {
      height: '100%',
      borderRadius: 4,
    },
    barVal: {
      width: 30,
      fontSize: 12,
      fontWeight: '700',
      color: theme.text,
      textAlign: 'right',
    },
    // Audit list
    auditCard: {
      backgroundColor: theme.backgroundElement,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      padding: Spacing.three,
      marginBottom: Spacing.three,
    },
    auditHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 2,
    },
    auditActor: {
      fontSize: 13,
      fontWeight: '800',
      color: theme.text,
    },
    auditTime: {
      fontSize: 10,
      color: theme.textSecondary,
    },
    auditAction: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.primary,
    },
    auditDetails: {
      fontSize: 12,
      color: theme.textSecondary,
      lineHeight: 16,
      marginTop: 4,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={{ padding: 4 }}>
          <ChevronLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Moderator Dashboard</Text>
      </View>

      {/* Selector tab buttons */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'queue' && { borderBottomColor: theme.primary }]}
          onPress={() => setActiveTab('queue')}
        >
          <Text style={[styles.tabText, activeTab === 'queue' && { color: theme.primary }]}>Review Queue ({submittedQueue.length})</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'analytics' && { borderBottomColor: theme.primary }]}
          onPress={() => setActiveTab('analytics')}
        >
          <Text style={[styles.tabText, activeTab === 'analytics' && { color: theme.primary }]}>Analytics</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'audit' && { borderBottomColor: theme.primary }]}
          onPress={() => setActiveTab('audit')}
        >
          <Text style={[styles.tabText, activeTab === 'audit' && { color: theme.primary }]}>Audit Logs</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollView}>
        {/* REVIEW QUEUE TAB */}
        {activeTab === 'queue' && (
          <View>
            {submittedQueue.map((item) => {
              const severityColor = getUrgencyColor(item.urgency);
              const severityBg = getUrgencyLightColor(item.urgency);
              
              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.queueCard}
                  onPress={() => router.push(`/report/${item.id}`)}
                >
                  <View style={styles.queueHeader}>
                    <Text style={styles.queueTitle} numberOfLines={1}>
                      {item.category} near {item.location_name}
                    </Text>
                    <View style={[styles.badge, { backgroundColor: severityBg }]}>
                      <Text style={[styles.badgeText, { color: severityColor }]}>{item.urgency}</Text>
                    </View>
                  </View>
                  <Text style={styles.queueDesc} numberOfLines={2}>
                    {item.description}
                  </Text>
                  <Text style={styles.queueMeta}>
                    Submitted at: {new Date(item.incident_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Status: <Text style={{ color: theme.warning, fontWeight: '700' }}>{item.status}</Text>
                  </Text>
                </TouchableOpacity>
              );
            })}

            {submittedQueue.length === 0 && (
              <View style={{ alignItems: 'center', paddingVertical: Spacing.six }}>
                <ShieldCheck size={44} color={theme.success} />
                <Text style={{ fontSize: 16, fontWeight: '700', color: theme.text, marginTop: Spacing.two }}>
                  Queue Fully Cleared
                </Text>
                <Text style={{ fontSize: 13, color: theme.textSecondary, textAlign: 'center', marginTop: Spacing.one }}>
                  There are no unverified safety reports pending moderator review right now.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <View>
            {/* Core Metrics */}
            <View style={styles.metricRow}>
              <View style={styles.metricCard}>
                <FileText size={20} color={theme.primary} />
                <Text style={styles.metricVal}>{totalReports}</Text>
                <Text style={styles.metricLabel}>Total Cases</Text>
              </View>
              
              <View style={styles.metricCard}>
                <AlertCircle size={20} color={theme.danger} />
                <Text style={styles.metricVal}>{criticalCount}</Text>
                <Text style={styles.metricLabel}>Critical SOS</Text>
              </View>

              <View style={styles.metricCard}>
                <CheckCircle2 size={20} color={theme.success} />
                <Text style={styles.metricVal}>{resolvedCount}</Text>
                <Text style={styles.metricLabel}>Resolved</Text>
              </View>
            </View>

            {/* Urgency breakdown */}
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Severity Breakdown</Text>
              
              <View style={styles.barRow}>
                <Text style={styles.barLabel}>Critical</Text>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { backgroundColor: theme.danger, width: `${(criticalCount / totalReports) * 100}%` }]} />
                </View>
                <Text style={styles.barVal}>{criticalCount}</Text>
              </View>

              <View style={styles.barRow}>
                <Text style={styles.barLabel}>High Priority</Text>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { backgroundColor: theme.warning, width: `${(highCount / totalReports) * 100}%` }]} />
                </View>
                <Text style={styles.barVal}>{highCount}</Text>
              </View>

              <View style={styles.barRow}>
                <Text style={styles.barLabel}>Medium</Text>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { backgroundColor: theme.primary, width: `${(mediumCount / totalReports) * 100}%` }]} />
                </View>
                <Text style={styles.barVal}>{mediumCount}</Text>
              </View>

              <View style={styles.barRow}>
                <Text style={styles.barLabel}>Low / Safe</Text>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { backgroundColor: theme.success, width: `${(lowCount / totalReports) * 100}%` }]} />
                </View>
                <Text style={styles.barVal}>{lowCount}</Text>
              </View>
            </View>

            {/* Verification Status breakdown */}
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Milestone Progression Status</Text>

              <View style={styles.barRow}>
                <Text style={styles.barLabel}>Submitted</Text>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { backgroundColor: theme.textSecondary, width: `${(submittedQueue.length / totalReports) * 100}%` }]} />
                </View>
                <Text style={styles.barVal}>{submittedQueue.length}</Text>
              </View>

              <View style={styles.barRow}>
                <Text style={styles.barLabel}>Verified</Text>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { backgroundColor: theme.primary, width: `${(verifiedCount / totalReports) * 100}%` }]} />
                </View>
                <Text style={styles.barVal}>{verifiedCount}</Text>
              </View>

              <View style={styles.barRow}>
                <Text style={styles.barLabel}>Resolved</Text>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { backgroundColor: theme.success, width: `${(resolvedCount / totalReports) * 100}%` }]} />
                </View>
                <Text style={styles.barVal}>{resolvedCount}</Text>
              </View>

              <View style={styles.barRow}>
                <Text style={styles.barLabel}>Rejected</Text>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { backgroundColor: theme.danger, width: `${(rejectedCount / totalReports) * 100}%` }]} />
                </View>
                <Text style={styles.barVal}>{rejectedCount}</Text>
              </View>
            </View>
          </View>
        )}

        {/* AUDIT LOGS TAB */}
        {activeTab === 'audit' && (
          <View>
            {auditLogs.map((log) => (
              <View key={log.id} style={styles.auditCard}>
                <View style={styles.auditHeader}>
                  <Text style={styles.auditActor}>{log.actor}</Text>
                  <Text style={styles.auditTime}>{log.time}</Text>
                </View>
                <Text style={styles.auditAction}>{log.action}</Text>
                <Text style={{ fontSize: 12, color: theme.text, marginTop: 4, fontWeight: '600' }}>
                  Target: {log.target}
                </Text>
                <Text style={styles.auditDetails}>{log.details}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
