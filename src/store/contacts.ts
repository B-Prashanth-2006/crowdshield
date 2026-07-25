import { create } from 'zustand';
import { EmergencyContact } from '../types';
import { supabase, isDemoMode } from '../utils/supabase';
import { MOCK_CONTACTS } from '../utils/mock-data';

interface ContactState {
  contacts: EmergencyContact[];
  isLoading: boolean;
  error: string | null;
  fetchContacts: (userId: string) => Promise<void>;
  addContact: (userId: string, name: string, phone: string, email?: string) => Promise<boolean>;
  updateContact: (id: string, updates: Partial<EmergencyContact>) => Promise<boolean>;
  deleteContact: (id: string) => Promise<boolean>;
}

export const useContactStore = create<ContactState>((set, get) => ({
  contacts: MOCK_CONTACTS,
  isLoading: false,
  error: null,

  fetchContacts: async (userId) => {
    if (isDemoMode) {
      // Keep static mock contacts
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase!
        .from('emergency_contacts')
        .select('*')
        .eq('user_id', userId)
        .order('priority', { ascending: true });
      
      if (error) throw error;
      set({ contacts: data || [], isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  addContact: async (userId, name, phone, email) => {
    set({ isLoading: true, error: null });
    const current = get().contacts;
    if (current.length >= 5) {
      set({ error: 'You can add up to 5 emergency contacts.', isLoading: false });
      return false;
    }

    const newPriority = current.length + 1;

    if (isDemoMode) {
      const newContact: EmergencyContact = {
        id: `contact-${Math.random().toString(36).substr(2, 9)}`,
        user_id: userId,
        name,
        phone,
        email,
        priority: newPriority,
        created_at: new Date().toISOString(),
      };
      set({ contacts: [...current, newContact], isLoading: false });
      return true;
    }

    try {
      const { data, error } = await supabase!
        .from('emergency_contacts')
        .insert({
          user_id: userId,
          name,
          phone,
          email,
          priority: newPriority,
        })
        .select()
        .single();
      
      if (error) throw error;
      set({ contacts: [...current, data], isLoading: false });
      return true;
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      return false;
    }
  },

  updateContact: async (id, updates) => {
    set({ isLoading: true, error: null });
    const current = get().contacts;

    if (isDemoMode) {
      const updated = current.map((c) => (c.id === id ? { ...c, ...updates } : c));
      set({ contacts: updated, isLoading: false });
      return true;
    }

    try {
      const { error } = await supabase!
        .from('emergency_contacts')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
      const updated = current.map((c) => (c.id === id ? { ...c, ...updates } : c));
      set({ contacts: updated, isLoading: false });
      return true;
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      return false;
    }
  },

  deleteContact: async (id) => {
    set({ isLoading: true, error: null });
    const current = get().contacts;

    if (isDemoMode) {
      const filtered = current.filter((c) => c.id !== id);
      // Re-normalize priorities
      const updated = filtered.map((c, index) => ({ ...c, priority: index + 1 }));
      set({ contacts: updated, isLoading: false });
      return true;
    }

    try {
      const { error } = await supabase!
        .from('emergency_contacts')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      const filtered = current.filter((c) => c.id !== id);
      const updated = filtered.map((c, index) => ({ ...c, priority: index + 1 }));
      set({ contacts: updated, isLoading: false });
      return true;
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      return false;
    }
  },
}));
