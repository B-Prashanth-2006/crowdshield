import { Alert as RNAlert, Platform } from 'react-native';

export interface AlertButton {
  text?: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

export interface AlertOptions {
  cancelable?: boolean;
}

/**
 * Cross-platform alert replacement that works on iOS, Android, and Web.
 * On Web, React Native Web's Alert.alert is a no-op that drops callbacks.
 * This implementation provides window.confirm / window.alert on web so buttons and actions work.
 */
export const showAlert = (
  title: string,
  message?: string,
  buttons?: AlertButton[],
  options?: AlertOptions
) => {
  if (Platform.OS === 'web') {
    const fullMessage = [title, message].filter(Boolean).join('\n\n');

    if (buttons && buttons.length > 0) {
      const cancelBtn = buttons.find((b) => b.style === 'cancel');
      const actionBtn = buttons.find((b) => b.style !== 'cancel') || buttons[0];

      if (buttons.length > 1) {
        if (typeof window !== 'undefined') {
          const confirmed = window.confirm(fullMessage);
          if (confirmed) {
            actionBtn?.onPress?.();
          } else {
            cancelBtn?.onPress?.();
          }
        }
      } else {
        if (typeof window !== 'undefined') {
          window.alert(fullMessage);
          buttons[0]?.onPress?.();
        }
      }
    } else {
      if (typeof window !== 'undefined') {
        window.alert(fullMessage);
      }
    }
  } else {
    RNAlert.alert(title, message, buttons, options);
  }
};

export const Alert = {
  alert: showAlert,
};

export default Alert;
