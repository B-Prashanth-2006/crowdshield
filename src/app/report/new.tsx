import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Switch,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useIncidentStore } from '@/store/incident';
import { useAuthStore } from '@/store/auth';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import {
  AlertCircle,
  Camera,
  ShieldAlert,
  Sparkles,
  ChevronLeft,
  MapPin,
  CheckCircle2,
} from 'lucide-react-native';
import { Alert } from '@/utils/alert';

export default function NewReportScreen() {
  const router = useRouter();
  const theme = useTheme();

  const { user } = useAuthStore();
  const { reportIncident, simulateAICategorization, isLoading } = useIncidentStore();

  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [locationName, setLocationName] = useState('Market St & 8th St, San Francisco');
  const [mockMediaUrl, setMockMediaUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // AI Assessment State
  const [aiRunning, setAiRunning] = useState(false);
  const [aiData, setAiData] = useState<{
    category: string;
    urgency: 'Low' | 'Medium' | 'High' | 'Critical';
    summary: string;
    safety_actions: string[];
  } | null>(null);

  const handleSimulateAI = async () => {
    if (!description || description.trim().length < 3) {
      setErrorMessage('Please enter at least 3 characters describing the incident.');
      return;
    }
    setErrorMessage(null);

    setAiRunning(true);
    try {
      const assessment = await simulateAICategorization(description.trim());
      setAiData(assessment as any);
    } catch (err) {
      Alert.alert('AI Assessment Failed', 'Could not parse incident content.');
    } finally {
      setAiRunning(false);
    }
  };

  const handleSimulateCamera = () => {
    // Inject a realistic hazard stock photo
    setMockMediaUrl(
      'https://images.unsplash.com/photo-1508873696983-2df519f0397e?q=80&w=300&auto=format&fit=crop'
    );
    Alert.alert('Camera Attached', 'Simulated camera photo attached successfully.');
  };

  const handleSubmit = async () => {
    if (!description || description.trim().length < 3) {
      setErrorMessage('Please describe what is happening (at least 3 characters).');
      return;
    }
    setErrorMessage(null);

    let assessment = aiData;

    // If user hasn't explicitly clicked Run AI Assessment, automatically run it now
    if (!assessment) {
      setAiRunning(true);
      try {
        assessment = (await simulateAICategorization(description.trim())) as any;
        setAiData(assessment);
      } catch (err) {
        assessment = {
          category: 'Other',
          urgency: 'Medium',
          summary: description.trim(),
          safety_actions: [
            'Maintain situational awareness.',
            'Contact local authorities if immediate help is required.',
          ],
        };
      } finally {
        setAiRunning(false);
      }
    }

    if (!assessment) return;

    const success = await reportIncident(
      user?.id || null,
      user?.name || 'Anonymous Member',
      {
        category: assessment.category,
        description: description.trim(),
        latitude: 37.7793,
        longitude: -122.4192,
        location_name: locationName.trim() || 'Market St & 8th St, San Francisco',
        is_anonymous: isAnonymous,
        urgency: assessment.urgency,
        summary: assessment.summary,
        safety_actions: assessment.safety_actions,
      },
      mockMediaUrl ? [mockMediaUrl] : []
    );

    if (success) {
      Alert.alert(
        'Report Submitted',
        'Your incident report has been submitted for review and pinned to the alerts feed.',
        [
          {
            text: 'View on Map',
            onPress: () => router.replace('/(tabs)/map'),
          },
        ]
      );
    } else {
      Alert.alert('Submission Failed', 'Could not submit report to database.');
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'Critical':
        return theme.danger;
      case 'High':
        return theme.warning;
      case 'Medium':
        return theme.primary;
      default:
        return theme.success;
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
    scrollView: {
      padding: Spacing.four,
    },
    label: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.text,
      textTransform: 'uppercase',
      marginBottom: Spacing.two,
      marginTop: Spacing.two,
    },
    input: {
      backgroundColor: theme.backgroundElement,
      borderWidth: 1,
      borderColor: errorMessage ? theme.danger : theme.border,
      borderRadius: 12,
      padding: Spacing.three,
      color: theme.text,
      fontSize: 15,
      minHeight: 100,
      textAlignVertical: 'top',
      marginBottom: Spacing.two,
    },
    errorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: Spacing.three,
      paddingHorizontal: 4,
    },
    errorText: {
      color: theme.danger,
      fontSize: 13,
      fontWeight: '600',
    },
    locContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.backgroundElement,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      paddingHorizontal: Spacing.three,
      height: 48,
      marginBottom: Spacing.three,
    },
    locInput: {
      flex: 1,
      color: theme.text,
      marginLeft: Spacing.two,
      fontSize: 15,
    },
    anonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.four,
    },
    anonLabel: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.text,
    },
    anonDesc: {
      fontSize: 12,
      color: theme.textSecondary,
      marginTop: 2,
    },
    // Photo attachment
    photoBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: theme.border,
      backgroundColor: theme.backgroundElement,
      borderRadius: 12,
      height: 72,
      marginBottom: Spacing.four,
      gap: Spacing.two,
    },
    photoText: {
      color: theme.textSecondary,
      fontSize: 14,
      fontWeight: '600',
    },
    // AI assessment box
    aiBtn: {
      backgroundColor: theme.primaryLight,
      borderWidth: 1,
      borderColor: theme.primary,
      borderRadius: 12,
      height: 48,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      marginBottom: Spacing.four,
      gap: Spacing.two,
    },
    aiBtnText: {
      color: theme.primary,
      fontSize: 15,
      fontWeight: '800',
    },
    aiCard: {
      backgroundColor: theme.backgroundElement,
      borderWidth: 1,
      borderColor: theme.primary,
      borderRadius: 16,
      padding: Spacing.four,
      marginBottom: Spacing.five,
    },
    aiHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      paddingBottom: Spacing.two,
      marginBottom: Spacing.three,
    },
    aiTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: theme.primary,
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
    aiSummaryTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 4,
    },
    aiSummary: {
      fontSize: 13,
      color: theme.textSecondary,
      lineHeight: 18,
      marginBottom: Spacing.three,
    },
    actionBullet: {
      fontSize: 12,
      color: theme.textSecondary,
      lineHeight: 18,
      marginLeft: Spacing.two,
      marginBottom: 2,
    },
    submitBtn: {
      backgroundColor: theme.success,
      borderRadius: 12,
      height: 52,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: Spacing.two,
      marginBottom: Spacing.six,
    },
    submitBtnText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '800',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <ChevronLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Report Incident</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollView}>
        <Text style={styles.label}>What is happening?</Text>
        <TextInput
          style={styles.input}
          placeholder="Describe the incident (e.g. Robbery, active fire, accident...)"
          placeholderTextColor={theme.textSecondary}
          value={description}
          onChangeText={(txt) => {
            setDescription(txt);
            if (errorMessage) setErrorMessage(null);
          }}
          multiline
          numberOfLines={4}
        />
        {errorMessage && (
          <View style={styles.errorContainer}>
            <AlertCircle size={16} color={theme.danger} />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        <Text style={styles.label}>Location / Landmark</Text>
        <View style={styles.locContainer}>
          <MapPin size={18} color={theme.textSecondary} />
          <TextInput
            style={styles.locInput}
            placeholder="Address or general location"
            placeholderTextColor={theme.textSecondary}
            value={locationName}
            onChangeText={setLocationName}
          />
        </View>

        {/* Anonymous Toggle */}
        <View style={styles.anonRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.anonLabel}>Report Anonymously</Text>
            <Text style={styles.anonDesc}>Hide your identity from community members.</Text>
          </View>
          <Switch
            value={isAnonymous}
            onValueChange={setIsAnonymous}
            trackColor={{ false: theme.border, true: theme.primary }}
          />
        </View>

        {/* Photo Upload simulation */}
        <Text style={styles.label}>Evidence (Photo/Video)</Text>
        {mockMediaUrl ? (
          <View style={{ position: 'relative', marginBottom: Spacing.four }}>
            <Image
              source={{ uri: mockMediaUrl }}
              style={{ width: '100%', height: 160, borderRadius: 12 }}
            />
            <TouchableOpacity
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                backgroundColor: 'rgba(0,0,0,0.6)',
                borderRadius: 20,
                padding: 6,
              }}
              onPress={() => setMockMediaUrl(null)}
            >
              <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>Remove</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.photoBtn} onPress={handleSimulateCamera}>
            <Camera size={24} color={theme.textSecondary} />
            <Text style={styles.photoText}>Attach Live Photo Evidence</Text>
          </TouchableOpacity>
        )}

        {/* AI Categorizer Trigger */}
        <TouchableOpacity
          style={styles.aiBtn}
          onPress={handleSimulateAI}
          disabled={aiRunning || isLoading}
          activeOpacity={0.8}
        >
          {aiRunning ? (
            <ActivityIndicator color={theme.primary} />
          ) : (
            <>
              <Sparkles size={18} color={theme.primary} />
              <Text style={styles.aiBtnText}>Run AI Incident Assessment</Text>
            </>
          )}
        </TouchableOpacity>

        {/* AI Results Review screen */}
        {aiData && (
          <View style={styles.aiCard}>
            <View style={styles.aiHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Sparkles size={18} color={theme.primary} />
                <Text style={styles.aiTitle}>AI Safety Review</Text>
              </View>
              <View
                style={[styles.badge, { backgroundColor: getUrgencyColor(aiData.urgency) }]}
              >
                <Text style={styles.badgeText}>{aiData.urgency}</Text>
              </View>
            </View>

            <Text style={styles.aiSummaryTitle}>Category Recommendation</Text>
            <Text style={[styles.aiSummary, { fontWeight: '700', color: theme.text }]}>
              {aiData.category}
            </Text>

            <Text style={styles.aiSummaryTitle}>Concise Incident Summary</Text>
            <Text style={styles.aiSummary}>{aiData.summary}</Text>

            <Text style={styles.aiSummaryTitle}>Immediate Safety Actions</Text>
            {aiData.safety_actions.map((act, index) => (
              <Text key={index} style={styles.actionBullet}>
                • {act}
              </Text>
            ))}
          </View>
        )}

        {/* Submit */}
        <TouchableOpacity
          style={[
            styles.submitBtn,
            (!description.trim() || isLoading || aiRunning) && { opacity: 0.7 },
          ]}
          onPress={handleSubmit}
          disabled={isLoading || aiRunning}
          activeOpacity={0.8}
        >
          {isLoading || aiRunning ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <ActivityIndicator color="#FFFFFF" size="small" />
              <Text style={styles.submitBtnText}>
                {aiRunning ? 'Assessing with AI...' : 'Submitting Report...'}
              </Text>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <CheckCircle2 size={20} color="#FFFFFF" />
              <Text style={styles.submitBtnText}>Confirm & Submit Report</Text>
            </View>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
