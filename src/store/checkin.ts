import { create } from 'zustand';
import { CheckIn } from '../types';
import { supabase, isDemoMode } from '../utils/supabase';

interface CheckInState {
  activeCheckIn: CheckIn | null;
  isLoading: boolean;
  error: string | null;
  startTrip: (userId: string, destinationName: string, etaMinutes: number, lat: number, lng: number) => Promise<boolean>;
  checkInSafe: () => Promise<boolean>;
  cancelTrip: () => Promise<boolean>;
  simulateMissedCheckIn: () => void;
}

let etaTimer: ReturnType<typeof setTimeout> | null = null;

export const useCheckInStore = create<CheckInState>((set, get) => ({
  activeCheckIn: null,
  isLoading: false,
  error: null,

  startTrip: async (userId, destinationName, etaMinutes, lat, lng) => {
    set({ isLoading: true, error: null });
    const etaDate = new Date(Date.now() + etaMinutes * 60 * 1000);

    const mockCheckIn: CheckIn = {
      id: `check-${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      destination_name: destinationName,
      latitude: lat,
      longitude: lng,
      eta: etaDate.toISOString(),
      status: 'active',
      created_at: new Date().toISOString(),
    };

    if (isDemoMode) {
      set({ activeCheckIn: mockCheckIn, isLoading: false });
      
      // Auto-trigger missed check in if simulated ETA passes (simulated rapidly for reviewer check)
      if (etaTimer) clearTimeout(etaTimer);
      
      // For demo, if etaMinutes is small (like 1 or 2 minutes), let's trigger missed check in after 30 seconds to let them test it.
      const triggerTime = etaMinutes <= 5 ? 30000 : etaMinutes * 60 * 1000;
      etaTimer = setTimeout(() => {
        const active = get().activeCheckIn;
        if (active && active.status === 'active') {
          get().simulateMissedCheckIn();
        }
      }, triggerTime);

      return true;
    }

    try {
      const { data, error } = await supabase!
        .from('check_ins')
        .insert({
          user_id: userId,
          destination_name: destinationName,
          latitude: lat,
          longitude: lng,
          eta: etaDate.toISOString(),
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;
      set({ activeCheckIn: data, isLoading: false });
      return true;
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      return false;
    }
  },

  checkInSafe: async () => {
    const active = get().activeCheckIn;
    if (!active) return false;

    set({ isLoading: true, error: null });
    if (etaTimer) {
      clearTimeout(etaTimer);
      etaTimer = null;
    }

    if (isDemoMode) {
      set({ activeCheckIn: null, isLoading: false });
      return true;
    }

    try {
      const { error } = await supabase!
        .from('check_ins')
        .update({
          status: 'safe',
          checked_in_at: new Date().toISOString(),
        })
        .eq('id', active.id);

      if (error) throw error;
      set({ activeCheckIn: null, isLoading: false });
      return true;
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      return false;
    }
  },

  cancelTrip: async () => {
    const active = get().activeCheckIn;
    if (!active) return false;

    set({ isLoading: true, error: null });
    if (etaTimer) {
      clearTimeout(etaTimer);
      etaTimer = null;
    }

    if (isDemoMode) {
      set({ activeCheckIn: null, isLoading: false });
      return true;
    }

    try {
      const { error } = await supabase!
        .from('check_ins')
        .delete()
        .eq('id', active.id);

      if (error) throw error;
      set({ activeCheckIn: null, isLoading: false });
      return true;
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      return false;
    }
  },

  simulateMissedCheckIn: () => {
    const active = get().activeCheckIn;
    if (!active) return;
    set({
      activeCheckIn: {
        ...active,
        status: 'missed_check_in',
      },
    });
    // Triggers notification in app
    console.warn(`[CrowdShield Warning] Missed check-in ETA for ${active.destination_name}. Notifying trusted contacts.`);
  },
}));
