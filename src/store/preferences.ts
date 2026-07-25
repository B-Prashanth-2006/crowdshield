import { create } from 'zustand';

interface PreferencesState {
  theme: 'system' | 'light' | 'dark';
  demoMode: boolean;
  alertRadiusKm: number;
  pushEnabled: boolean;
  smsEnabled: boolean;
  emailEnabled: boolean;
  setTheme: (theme: 'system' | 'light' | 'dark') => void;
  setDemoMode: (active: boolean) => void;
  setAlertRadius: (radius: number) => void;
  setPushEnabled: (enabled: boolean) => void;
  setSmsEnabled: (enabled: boolean) => void;
  setEmailEnabled: (enabled: boolean) => void;
}

export const useAppPreferencesStore = create<PreferencesState>((set) => ({
  theme: 'system',
  demoMode: true, // Default to demoMode since API keys are placeholders
  alertRadiusKm: 5.0,
  pushEnabled: true,
  smsEnabled: true,
  emailEnabled: false,
  setTheme: (theme) => set({ theme }),
  setDemoMode: (demoMode) => set({ demoMode }),
  setAlertRadius: (alertRadiusKm) => set({ alertRadiusKm }),
  setPushEnabled: (pushEnabled) => set({ pushEnabled }),
  setSmsEnabled: (smsEnabled) => set({ smsEnabled }),
  setEmailEnabled: (emailEnabled) => set({ emailEnabled }),
}));
