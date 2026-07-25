import { create } from 'zustand';
import { Profile, UserRole } from '../types';
import { supabase, isDemoMode } from '../utils/supabase';
import { MOCK_USER_PROFILE, MOCK_MODERATOR_PROFILE, MOCK_ADMIN_PROFILE } from '../utils/mock-data';

interface AuthState {
  user: Profile | null;
  isAuthenticated: boolean;
  isOnboarded: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string) => Promise<boolean>;
  signup: (name: string, phone: string, email: string, role?: UserRole) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<boolean>;
  setOnboarded: (onboarded: boolean) => void;
  switchRole: (role: UserRole) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: MOCK_USER_PROFILE, // Default logged-in user in Demo Mode
  isAuthenticated: true,   // Default authenticated in Demo Mode
  isOnboarded: false,       // Prompt onboarding walkthrough
  isLoading: false,
  error: null,

  login: async (email) => {
    set({ isLoading: true, error: null });
    if (isDemoMode) {
      // Direct mock login
      const selectedMock = email.includes('mod') 
        ? MOCK_MODERATOR_PROFILE 
        : email.includes('admin') 
          ? MOCK_ADMIN_PROFILE 
          : MOCK_USER_PROFILE;
      
      set({ 
        user: { ...selectedMock, name: email.split('@')[0] || selectedMock.name }, 
        isAuthenticated: true, 
        isLoading: false 
      });
      return true;
    }

    try {
      // Connect to real Supabase auth
      const { data, error } = await supabase!.auth.signInWithOtp({ email });
      if (error) throw error;
      set({ isLoading: false });
      return true;
    } catch (err: any) {
      set({ error: err.message, isLoading: false, isAuthenticated: false });
      return false;
    }
  },

  signup: async (name, phone, email, role = 'member') => {
    set({ isLoading: true, error: null });
    if (isDemoMode) {
      const newUser: Profile = {
        id: `user-${Math.random().toString(36).substr(2, 9)}`,
        name,
        phone,
        role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      set({ user: newUser, isAuthenticated: true, isLoading: false });
      return true;
    }

    try {
      const { data, error } = await supabase!.auth.signUp({
        email,
        password: 'TemporaryPassword123!', // OTP handles normal login
        options: {
          data: { name, phone, role },
        },
      });
      if (error) throw error;
      
      if (data.user) {
        // Create profile in profiles table
        const { error: profileErr } = await supabase!
          .from('profiles')
          .insert({
            id: data.user.id,
            name,
            phone,
            role,
          });
        if (profileErr) throw profileErr;
      }
      set({ isLoading: false });
      return true;
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      return false;
    }
  },

  logout: async () => {
    if (!isDemoMode) {
      await supabase!.auth.signOut();
    }
    set({ user: null, isAuthenticated: false, isOnboarded: false });
  },

  updateProfile: async (updates) => {
    const currentUser = get().user;
    if (!currentUser) return false;
    
    set({ isLoading: true, error: null });
    const updatedUser = { ...currentUser, ...updates, updated_at: new Date().toISOString() };

    if (isDemoMode) {
      set({ user: updatedUser, isLoading: false });
      return true;
    }

    try {
      const { error } = await supabase!
        .from('profiles')
        .update(updates)
        .eq('id', currentUser.id);
      if (error) throw error;

      set({ user: updatedUser, isLoading: false });
      return true;
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      return false;
    }
  },

  setOnboarded: (isOnboarded) => set({ isOnboarded }),

  switchRole: (role) => {
    const currentUser = get().user;
    if (!currentUser) return;
    set({ 
      user: { ...currentUser, role, updated_at: new Date().toISOString() } 
    });
  },
}));
