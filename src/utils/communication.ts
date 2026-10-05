import { Linking, Platform } from 'react-native';
import { Alert } from './alert';
import { EmergencyContact } from '../types';

/**
 * Clean phone number for tel: and sms: protocols.
 * Preserves leading '+' for international codes, strips spaces, parentheses, hyphens.
 */
export function cleanPhoneNumber(phone: string): string {
  if (!phone) return '';
  const trimmed = phone.trim();
  const hasPlus = trimmed.startsWith('+');
  const digitsOnly = trimmed.replace(/\D/g, '');
  return hasPlus ? `+${digitsOnly}` : digitsOnly;
}

/**
 * Formats a Google Maps location link
 */
export function formatMapsLocationUrl(latitude: number, longitude: number): string {
  return `https://maps.google.com/?q=${latitude.toFixed(6)},${longitude.toFixed(6)}`;
}

/**
 * Initiates a phone call to a contact
 */
export async function makePhoneCall(phoneNumber: string, contactName?: string): Promise<boolean> {
  const cleaned = cleanPhoneNumber(phoneNumber);
  if (!cleaned) {
    Alert.alert('Invalid Number', 'The phone number provided is not valid.');
    return false;
  }

  const telUrl = `tel:${cleaned}`;
  const displayName = contactName ? `${contactName} (${phoneNumber})` : phoneNumber;

  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        window.location.href = telUrl;
        return true;
      }
    }

    const supported = await Linking.canOpenURL(telUrl).catch(() => true);
    if (supported) {
      await Linking.openURL(telUrl);
      return true;
    } else {
      Alert.alert(
        'Call Not Supported',
        `This device does not support direct calls. Please dial ${displayName} manually.`
      );
      return false;
    }
  } catch (err: any) {
    console.warn('Failed to open tel url:', err);
    // On web or devices without dialer, offer to copy number
    Alert.alert(
      'Emergency Call',
      `Calling ${displayName}.\n\nIf the dialer did not open automatically, please dial: ${cleaned}`
    );
    return false;
  }
}

/**
 * Creates the appropriate sms: URL for iOS, Android, or Web
 */
export function createSMSUrl(phoneNumbers: string | string[], message?: string): string {
  const numbers = Array.isArray(phoneNumbers) ? phoneNumbers : [phoneNumbers];
  const cleanedNumbers = numbers.map(cleanPhoneNumber).filter(Boolean);
  const recipients = cleanedNumbers.join(',');

  const encodedBody = message ? encodeURIComponent(message) : '';

  // iOS uses &body= whereas Android and standard RFC use ?body=
  const separator = Platform.OS === 'ios' ? '&' : '?';

  if (!encodedBody) {
    return `sms:${recipients}`;
  }

  return `sms:${recipients}${separator}body=${encodedBody}`;
}

/**
 * Dispatches an SMS to one or more phone numbers via the native SMS/Messaging app
 */
export async function sendSMSMessage(
  phoneNumbers: string | string[],
  message: string,
  contactName?: string
): Promise<boolean> {
  const url = createSMSUrl(phoneNumbers, message);
  const targetLabel = contactName || (Array.isArray(phoneNumbers) ? `${phoneNumbers.length} contacts` : phoneNumbers);

  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        window.location.href = url;
        return true;
      }
    }

    const supported = await Linking.canOpenURL(url).catch(() => true);
    if (supported) {
      await Linking.openURL(url);
      return true;
    } else {
      Alert.alert(
        'SMS Not Supported',
        `Unable to open SMS app directly. Message for ${targetLabel}:\n\n"${message}"`
      );
      return false;
    }
  } catch (err: any) {
    console.warn('Failed to open sms URL:', err);
    Alert.alert(
      'SMS Dispatch',
      `Prepared SMS for ${targetLabel}:\n\n"${message}"\n\nPlease send this via your messaging app.`
    );
    return false;
  }
}

/**
 * Standard emergency preset templates
 */
export interface SMSPreset {
  id: string;
  title: string;
  icon: string;
  template: (lat?: number, lng?: number, type?: string) => string;
}

export const EMERGENCY_SMS_PRESETS: SMSPreset[] = [
  {
    id: 'sos_urgent',
    title: '🚨 Urgent SOS Alert',
    icon: 'ShieldAlert',
    template: (lat, lng, type) =>
      `[EMERGENCY SOS - CrowdShield]\nI need immediate assistance! Emergency Type: ${
        type || 'SOS Alert'
      }.\n${
        lat && lng ? `My Live GPS Location: ${formatMapsLocationUrl(lat, lng)}\n` : ''
      }Please call me or send emergency help immediately!`,
  },
  {
    id: 'location_share',
    title: '📍 Share Live Location',
    icon: 'MapPin',
    template: (lat, lng) =>
      `[CrowdShield Safety Broadcast]\nHere is my current live safety location:\n${
        lat && lng ? formatMapsLocationUrl(lat, lng) : 'GPS Tracking Active'
      }\nPlease keep track of my whereabouts.`,
  },
  {
    id: 'feeling_unsafe',
    title: '⚠️ Feeling Unsafe',
    icon: 'AlertTriangle',
    template: (lat, lng) =>
      `[CrowdShield Alert]\nI am feeling unsafe in my current situation. Please call or text me to check in.\n${
        lat && lng ? `Location: ${formatMapsLocationUrl(lat, lng)}\n` : ''
      }Staying on alert.`,
  },
  {
    id: 'medical_help',
    title: '🏥 Medical Emergency',
    icon: 'HeartPulse',
    template: (lat, lng) =>
      `[CrowdShield Medical Alert]\nI have a medical emergency and need immediate assistance!\n${
        lat && lng ? `Location: ${formatMapsLocationUrl(lat, lng)}\n` : ''
      }Please contact emergency medical services or call me now!`,
  },
  {
    id: 'safe_resolved',
    title: '✅ I Am Safe Now',
    icon: 'CheckCircle',
    template: () =>
      `[CrowdShield Update]\nI am safe now. The emergency alert has been resolved. Thank you for your support!`,
  },
];

/**
 * Builds an emergency broadcast SMS to all contacts
 */
export function composeSOSBroadcastSMS(
  alertType: string,
  latitude: number,
  longitude: number,
  customNote?: string
): string {
  const mapsUrl = formatMapsLocationUrl(latitude, longitude);
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    `🚨 [EMERGENCY SOS ALERT - CrowdShield]\n` +
    `I have triggered an urgent emergency broadcast!\n` +
    `• Alert Type: ${alertType}\n` +
    `• Time: ${time}\n` +
    (customNote ? `• Note: ${customNote}\n` : '') +
    `• Live Location: ${mapsUrl}\n` +
    `Please call emergency services or check on me immediately!`
  );
}
