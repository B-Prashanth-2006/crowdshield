import { create } from 'zustand';
import { EmergencyAlert, SOSType, EmergencyContact } from '../types';
import { supabase, isDemoMode } from '../utils/supabase';
import { useContactStore } from './contacts';
import { SIMULATION_CENTER_LAT, SIMULATION_CENTER_LNG } from '../utils/mock-data';

interface SOSState {
  activeSOS: EmergencyAlert | null;
  isTriggering: boolean;
  countdown: number;
  selectedType: SOSType;
  isLoading: boolean;
  error: string | null;
  startSOSCountdown: (type: SOSType) => void;
  cancelSOSCountdown: () => void;
  decrementCountdown: () => void;
  triggerSOSDirectly: (userId: string, type: SOSType, lat?: number, lng?: number) => Promise<boolean>;
  resolveSOS: () => Promise<boolean>;
  updateSOSLocation: (lat: number, lng: number) => Promise<void>;
}

let countdownInterval: ReturnType<typeof setInterval> | null = null;
let simulationInterval: ReturnType<typeof setInterval> | null = null;

export const useSOSStore = create<SOSState>((set, get) => ({
  activeSOS: null,
  isTriggering: false,
  countdown: 3,
  selectedType: 'Other',
  isLoading: false,
  error: null,

  startSOSCountdown: (type) => {
    if (countdownInterval) clearInterval(countdownInterval);
    set({ isTriggering: true, countdown: 3, selectedType: type });
    
    countdownInterval = setInterval(() => {
      get().decrementCountdown();
    }, 1000);
  },

  cancelSOSCountdown: () => {
    if (countdownInterval) {
      clearInterval(countdownInterval);
      countdownInterval = null;
    }
    set({ isTriggering: false, countdown: 3 });
  },

  decrementCountdown: () => {
    const current = get().countdown;
    if (current <= 1) {
      if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
      }
      set({ isTriggering: false, countdown: 0 });
      // Trigger the SOS!
      // For testing, let's grab user id from useAuthStore
      // It will use current simulation coordinates if not passed
      const { user } = require('./auth').useAuthStore.getState();
      const userId = user?.id || 'demo-user-id';
      get().triggerSOSDirectly(userId, get().selectedType);
    } else {
      set({ countdown: current - 1 });
    }
  },

  triggerSOSDirectly: async (userId, type, lat, lng) => {
    set({ isLoading: true, error: null });
    const finalLat = lat ?? SIMULATION_CENTER_LAT;
    const finalLng = lng ?? SIMULATION_CENTER_LNG;

    const mockAlert: EmergencyAlert = {
      id: `sos-${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      latitude: finalLat,
      longitude: finalLng,
      type,
      status: 'active',
      created_at: new Date().toISOString(),
    };

    if (isDemoMode) {
      set({ activeSOS: mockAlert, isLoading: false });
      
      // Start GPS simulation wiggle to prove live tracking
      if (simulationInterval) clearInterval(simulationInterval);
      let step = 0;
      simulationInterval = setInterval(() => {
        const active = get().activeSOS;
        if (active) {
          step += 1;
          const deltaLat = Math.sin(step / 5) * 0.0003;
          const deltaLng = Math.cos(step / 5) * 0.0003;
          get().updateSOSLocation(active.latitude + deltaLat, active.longitude + deltaLng);
        }
      }, 4000);

      return true;
    }

    try {
      const { data, error } = await supabase!
        .from('emergency_alerts')
        .insert({
          user_id: userId,
          latitude: finalLat,
          longitude: finalLng,
          type,
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;
      set({ activeSOS: data, isLoading: false });

      // Run real location update intervals here if needed in background
      return true;
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      return false;
    }
  },

  resolveSOS: async () => {
    if (simulationInterval) {
      clearInterval(simulationInterval);
      simulationInterval = null;
    }

    const active = get().activeSOS;
    if (!active) {
      set({ activeSOS: null, isLoading: false });
      return true;
    }

    set({ isLoading: true, error: null });

    if (isDemoMode) {
      set({ activeSOS: null, isLoading: false });
      return true;
    }

    try {
      const { error } = await supabase!
        .from('emergency_alerts')
        .update({
          status: 'resolved',
          resolved_at: new Date().toISOString(),
        })
        .eq('id', active.id);

      if (error) throw error;
      set({ activeSOS: null, isLoading: false });
      return true;
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      return false;
    }
  },

  updateSOSLocation: async (lat, lng) => {
    const active = get().activeSOS;
    if (!active) return;

    if (isDemoMode) {
      set({
        activeSOS: {
          ...active,
          latitude: lat,
          longitude: lng,
        },
      });
      return;
    }

    try {
      await supabase!
        .from('emergency_alerts')
        .update({ latitude: lat, longitude: lng })
        .eq('id', active.id);

      set({
        activeSOS: {
          ...active,
          latitude: lat,
          longitude: lng,
        },
      });
    } catch (err) {
      console.error('Failed to update SOS location:', err);
    }
  },
}));
