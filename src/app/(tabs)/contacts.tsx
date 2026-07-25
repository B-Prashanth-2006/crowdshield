import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Alert } from 'react-native';
import { useContactStore } from '@/store/contacts';
import { useAuthStore } from '@/store/auth';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { Phone, Mail, UserPlus, Trash2, Send, PhoneCall, Plus } from 'lucide-react-native';

export default function ContactsScreen() {
  const theme = useTheme();
  const { user } = useAuthStore();
  const { contacts, addContact, deleteContact } = useContactStore();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAdd = async () => {
    if (!name || !phone) {
      Alert.alert('Required Info', 'Name and Phone number are required.');
      return;
    }
    const success = await addContact(user?.id || 'user-123', name, phone, email || undefined);
    if (success) {
      setName('');
      setPhone('');
      setEmail('');
      setShowAddForm(false);
      Alert.alert('Contact Added', 'New emergency contact saved successfully.');
    }
  };

  const handleDelete = (id: string, contactName: string) => {
    Alert.alert('Remove Contact', `Are you sure you want to delete ${contactName} from your trusted emergency contacts list?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => await deleteContact(id) },
    ]);
  };

  const simulateCall = (contactName: string, phoneNum: string) => {
    Alert.alert('Emergency Call', `Simulating direct call to ${contactName} (${phoneNum})...`);
  };

  const simulateSMS = (contactName: string, phoneNum: string) => {
    Alert.alert('SMS Dispatch', `SMS safety notification sent to ${contactName} (${phoneNum}):\n\n"CrowdShield Emergency Alert: I need assistance!"`);
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
    contactsList: {
      gap: Spacing.three,
      marginBottom: Spacing.four,
    },
    contactCard: {
      backgroundColor: theme.backgroundElement,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.border,
      padding: Spacing.three,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Spacing.two,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: Spacing.three,
    },
    avatarText: {
      fontSize: 15,
      fontWeight: '800',
      color: theme.primary,
    },
    contactInfo: {
      flex: 1,
    },
    contactName: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.text,
    },
    priorityBadge: {
      backgroundColor: theme.primaryLight,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 4,
      alignSelf: 'flex-start',
      marginTop: 2,
    },
    priorityText: {
      fontSize: 9,
      fontWeight: '700',
      color: theme.primary,
    },
    contactMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
      marginVertical: Spacing.one,
    },
    metaText: {
      fontSize: 13,
      color: theme.textSecondary,
    },
    cardActions: {
      flexDirection: 'row',
      borderTopWidth: 1,
      borderTopColor: theme.border,
      paddingTop: Spacing.two,
      marginTop: Spacing.one,
      gap: Spacing.two,
    },
    actionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      paddingVertical: 8,
      flex: 1,
      gap: Spacing.one,
    },
    actionBtnText: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.text,
    },
    deleteBtn: {
      width: 38,
      height: 38,
      borderRadius: 8,
      backgroundColor: theme.dangerLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    // Form styles
    formCard: {
      backgroundColor: theme.backgroundElement,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.border,
      padding: Spacing.four,
      marginBottom: Spacing.five,
    },
    formTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: theme.text,
      marginBottom: Spacing.three,
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
    saveBtn: {
      backgroundColor: theme.primary,
      borderRadius: 10,
      height: 48,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: Spacing.two,
    },
    saveBtnText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '700',
    },
    addTriggerBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.primaryLight,
      borderWidth: 1,
      borderColor: theme.primary,
      borderRadius: 12,
      paddingVertical: Spacing.three,
      marginBottom: Spacing.five,
      gap: Spacing.two,
    },
    addTriggerBtnText: {
      color: theme.primary,
      fontSize: 15,
      fontWeight: '700',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Emergency Contacts</Text>
        <Text style={styles.subtitle}>
          Add up to 5 family members, friends, or medical providers to alert instantly in case of SOS triggers or missed check-ins.
        </Text>

        {/* Form toggler */}
        {!showAddForm && contacts.length < 5 && (
          <TouchableOpacity style={styles.addTriggerBtn} onPress={() => setShowAddForm(true)}>
            <Plus size={20} color={theme.primary} />
            <Text style={styles.addTriggerBtnText}>Add Trusted Contact</Text>
          </TouchableOpacity>
        )}

        {/* Add contact Form */}
        {showAddForm && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>New Emergency Contact</Text>
            
            <View style={styles.inputContainer}>
              <UserPlus size={18} color={theme.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor={theme.textSecondary}
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputContainer}>
              <Phone size={18} color={theme.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                placeholderTextColor={theme.textSecondary}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputContainer}>
              <Mail size={18} color={theme.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder="Email Address (Optional)"
                placeholderTextColor={theme.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={{ flexDirection: 'row', gap: Spacing.two }}>
              <TouchableOpacity
                style={[styles.saveBtn, { flex: 1, backgroundColor: theme.background, borderWidth: 1, borderColor: theme.border }]}
                onPress={() => setShowAddForm(false)}
              >
                <Text style={{ color: theme.text, fontSize: 15, fontWeight: '700' }}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.saveBtn, { flex: 1 }]} onPress={handleAdd}>
                <Text style={styles.saveBtnText}>Save Contact</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Existing Contacts list */}
        <View style={styles.contactsList}>
          {contacts.map((item) => {
            const initial = item.name.charAt(0);
            return (
              <View key={item.id} style={styles.contactCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{initial}</Text>
                  </View>
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactName}>{item.name}</Text>
                    <View style={styles.priorityBadge}>
                      <Text style={styles.priorityText}>Priority {item.priority}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDelete(item.id, item.name)}
                  >
                    <Trash2 size={18} color={theme.danger} />
                  </TouchableOpacity>
                </View>

                <View style={styles.contactMeta}>
                  <Phone size={14} color={theme.textSecondary} />
                  <Text style={styles.metaText}>{item.phone}</Text>
                </View>

                {item.email && (
                  <View style={styles.contactMeta}>
                    <Mail size={14} color={theme.textSecondary} />
                    <Text style={styles.metaText}>{item.email}</Text>
                  </View>
                )}

                {/* Instant Actions */}
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => simulateCall(item.name, item.phone)}
                  >
                    <PhoneCall size={16} color={theme.primary} />
                    <Text style={[styles.actionBtnText, { color: theme.primary }]}>Call</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => simulateSMS(item.name, item.phone)}
                  >
                    <Send size={16} color={theme.success} />
                    <Text style={[styles.actionBtnText, { color: theme.success }]}>Alert SMS</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}

          {contacts.length === 0 && (
            <View style={{ alignItems: 'center', paddingVertical: Spacing.six }}>
              <UserPlus size={44} color={theme.textSecondary} />
              <Text style={{ fontSize: 16, fontWeight: '700', color: theme.text, marginTop: Spacing.two }}>
                No Contacts Added
              </Text>
              <Text style={{ fontSize: 13, color: theme.textSecondary, textAlign: 'center', marginTop: Spacing.one }}>
                You have not designated any trusted safety contacts yet. Tap the button above to add one.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
