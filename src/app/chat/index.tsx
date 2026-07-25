import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { Send, ShieldAlert, Sparkles, AlertOctagon, HelpCircle } from 'lucide-react-native';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  created_at: Date;
}

export default function AISafetyAssistantScreen() {
  const router = useRouter();
  const theme = useTheme();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-init',
      sender: 'assistant',
      text: 'Hello! I am your AI Safety Assistant. I can help guide you through emergency preparedness, basic first-aid suggestions, or general hazard checklists.\n\nDisclaimer: I am not a replacement for official emergency services. In a life-threatening crisis, please activate the SOS button or contact 911 immediately.',
      created_at: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: `msg-usr-${Math.random().toString(36).substr(2, 9)}`,
      sender: 'user',
      text: textToSend,
      created_at: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI thinking and reply logic
    setTimeout(() => {
      let replyText = 'I am scanning safety directories. To help you prepare, please tell me more about the category (e.g. fire, medical, blackout) or activate SOS if you feel unsafely threatened.';
      const lowercase = textToSend.toLowerCase();

      if (lowercase.includes('first aid') || lowercase.includes('choking') || lowercase.includes('cpr') || lowercase.includes('bleed')) {
        replyText = 'BASIC FIRST AID PROTOCOL:\n1. Check for responsiveness and breathing.\n2. Call local emergency services (911) immediately.\n3. If heavy bleeding: Apply direct, firm pressure to the wound with a clean cloth.\n4. If choking and responsive: Perform abdominal thrusts (Heimlich maneuver).\n5. If unresponsive & not breathing: Initiate CPR (30 chest compressions to 2 rescue breaths) if trained.';
      } else if (lowercase.includes('blackout') || lowercase.includes('power') || lowercase.includes('electricity')) {
        replyText = 'POWER BLACKOUT PREPARATION:\n1. Keep flashlights and extra batteries accessible (avoid candles to reduce fire hazard).\n2. Keep refrigerator doors closed to preserve food (lasts ~4 hours).\n3. Disconnect sensitive electronics to protect against power surge damage when grid restores.\n4. Keep phone batteries charged and utilize power-saving modes.';
      } else if (lowercase.includes('earthquake') || lowercase.includes('quake') || lowercase.includes('shake')) {
        replyText = 'EARTHQUAKE PROTOCOL:\n1. DROP down onto your hands and knees.\n2. COVER your head and neck under a sturdy table or desk.\n3. HOLD ON until the shaking stops.\n4. If outdoors: Move to an open area away from buildings, streetlights, and utility wires.';
      } else if (lowercase.includes('fire') || lowercase.includes('smoke')) {
        replyText = 'FIRE EMERGENCIES:\n1. If smoke is present, stay low to the floor where air is cleaner.\n2. Feel doors with the back of your hand before opening. If hot, do not open.\n3. Get out immediately, do not gather belongings.\n4. Meet at a pre-designated assembly point outside and call 911.';
      }

      const assistantMsg: Message = {
        id: `msg-ast-${Math.random().toString(36).substr(2, 9)}`,
        sender: 'assistant',
        text: replyText,
        created_at: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 1200);
  };

  const handleQuickPrompt = (prompt: string) => {
    handleSend(prompt);
  };

  const handleSOSShortcut = () => {
    Alert.alert(
      'Activate SOS',
      'This will redirect you to the SOS countdown page. Do you wish to proceed?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Activate SOS', style: 'destructive', onPress: () => router.push('/sos/trigger') },
      ]
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    disclaimerBar: {
      backgroundColor: theme.dangerLight,
      borderColor: theme.danger,
      borderWidth: 1,
      borderRadius: 12,
      margin: Spacing.three,
      padding: Spacing.three,
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
    },
    disclaimerText: {
      color: theme.danger,
      fontSize: 12,
      fontWeight: '700',
      flex: 1,
      lineHeight: 16,
    },
    sosBtn: {
      backgroundColor: theme.danger,
      borderRadius: 8,
      paddingHorizontal: Spacing.three,
      paddingVertical: 6,
      justifyContent: 'center',
    },
    sosText: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: '900',
    },
    chatScroll: {
      flex: 1,
      paddingHorizontal: Spacing.four,
    },
    messageBubble: {
      borderRadius: 14,
      padding: Spacing.three,
      marginVertical: 4,
      maxWidth: '85%',
    },
    userBubble: {
      backgroundColor: theme.primary,
      alignSelf: 'flex-end',
    },
    assistantBubble: {
      backgroundColor: theme.backgroundElement,
      borderWidth: 1,
      borderColor: theme.border,
      alignSelf: 'flex-start',
    },
    messageText: {
      fontSize: 14,
      lineHeight: 20,
    },
    timeText: {
      fontSize: 9,
      marginTop: 4,
      alignSelf: 'flex-end',
    },
    typingText: {
      fontSize: 13,
      color: theme.textSecondary,
      fontStyle: 'italic',
      marginHorizontal: Spacing.four,
      marginVertical: Spacing.two,
    },
    quickSuggestions: {
      paddingHorizontal: Spacing.four,
      paddingVertical: Spacing.two,
      height: 48,
    },
    suggestPill: {
      backgroundColor: theme.backgroundElement,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 20,
      paddingHorizontal: Spacing.three,
      paddingVertical: 6,
      marginRight: Spacing.two,
    },
    suggestText: {
      fontSize: 12,
      color: theme.textSecondary,
      fontWeight: '700',
    },
    inputBox: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing.four,
      paddingVertical: Spacing.three,
      borderTopWidth: 1,
      borderTopColor: theme.border,
      backgroundColor: theme.background,
    },
    input: {
      flex: 1,
      backgroundColor: theme.backgroundElement,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 22,
      paddingHorizontal: Spacing.four,
      color: theme.text,
      fontSize: 14,
      height: 40,
    },
    sendBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: Spacing.two,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Non-emergency disclaimer warning */}
      <View style={styles.disclaimerBar}>
        <ShieldAlert size={20} color={theme.danger} />
        <Text style={styles.disclaimerText}>
          Non-Emergency Advice Only. For life-threatening emergencies, alert SOS immediately.
        </Text>
        <TouchableOpacity style={styles.sosBtn} onPress={handleSOSShortcut}>
          <Text style={styles.sosText}>SOS ESCALATE</Text>
        </TouchableOpacity>
      </View>

      {/* Messages Scroll Area */}
      <ScrollView style={styles.chatScroll} contentContainerStyle={{ paddingBottom: Spacing.four }}>
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <View
              key={msg.id}
              style={[
                styles.messageBubble,
                isUser ? styles.userBubble : styles.assistantBubble,
              ]}
            >
              <Text style={[styles.messageText, { color: isUser ? '#FFFFFF' : theme.text }]}>
                {msg.text}
              </Text>
              <Text style={[styles.timeText, { color: isUser ? '#E2E8F0' : theme.textSecondary }]}>
                {msg.created_at.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          );
        })}
        {isTyping && <Text style={styles.typingText}>Safety Assistant is typing...</Text>}
      </ScrollView>

      {/* Quick Prompts options */}
      <View style={{ height: 44 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickSuggestions}>
          {[
            'Choking first aid tips',
            'Prep for power blackout',
            'Drop cover hold earthquake',
            'Dumpster fire instructions',
          ].map((prompt) => (
            <TouchableOpacity
              key={prompt}
              style={styles.suggestPill}
              onPress={() => handleQuickPrompt(prompt)}
            >
              <Text style={styles.suggestText}>{prompt}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Text message box inputs */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.inputBox}>
          <TextInput
            style={styles.input}
            placeholder="Ask AI safety question..."
            placeholderTextColor={theme.textSecondary}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={() => handleSend(inputText)}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={() => handleSend(inputText)}>
            <Send size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
