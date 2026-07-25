import { create } from 'zustand';
import { IncidentReport, IncidentMedia, IncidentUpdate, IncidentStatus, IncidentUrgency } from '../types';
import { supabase, isDemoMode } from '../utils/supabase';
import { MOCK_INCIDENTS } from '../utils/mock-data';

interface IncidentState {
  incidents: IncidentReport[];
  media: Record<string, IncidentMedia[]>;
  updates: Record<string, IncidentUpdate[]>;
  isLoading: boolean;
  error: string | null;
  fetchIncidents: () => Promise<void>;
  reportIncident: (
    userId: string | null,
    reporterName: string,
    data: {
      category: string;
      description: string;
      latitude: number;
      longitude: number;
      location_name?: string;
      is_anonymous: boolean;
      urgency: IncidentUrgency;
      summary: string;
      safety_actions: string[];
    },
    mediaUrls?: string[]
  ) => Promise<IncidentReport | null>;
  addIncidentUpdate: (
    incidentId: string,
    userId: string | null,
    userName: string,
    userRole: any,
    updateText: string
  ) => Promise<boolean>;
  moderateIncident: (
    incidentId: string,
    moderatorId: string,
    action: 'verify' | 'reject' | 'resolve' | 'escalate',
    notes?: string
  ) => Promise<boolean>;
  simulateAICategorization: (description: string) => Promise<{
    category: string;
    urgency: IncidentUrgency;
    summary: string;
    safety_actions: string[];
  }>;
}

export const useIncidentStore = create<IncidentState>((set, get) => ({
  incidents: MOCK_INCIDENTS,
  media: {},
  updates: {
    'inc-1': [
      {
        id: 'upd-1',
        incident_id: 'inc-1',
        user_id: 'mod-456',
        user_name: 'Officer Alex Chen',
        user_role: 'moderator',
        update_text: 'Fire crews and gas company technicians are currently digging up the street to cap the pipe. Evacuation zone set to 2 blocks around Civic Center.',
        created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      }
    ]
  },
  isLoading: false,
  error: null,

  fetchIncidents: async () => {
    if (isDemoMode) {
      // Mock data is already set
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase!
        .from('incident_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ incidents: data || [], isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  reportIncident: async (userId, reporterName, input, mediaUrls = []) => {
    set({ isLoading: true, error: null });
    
    const newIncident: IncidentReport = {
      id: `inc-${Math.random().toString(36).substr(2, 9)}`,
      reporter_id: input.is_anonymous ? null : userId,
      reporter_name: input.is_anonymous ? 'Anonymous' : reporterName,
      category: input.category,
      description: input.description,
      latitude: input.latitude,
      longitude: input.longitude,
      location_name: input.location_name || 'Current Location',
      incident_time: new Date().toISOString(),
      is_anonymous: input.is_anonymous,
      urgency: input.urgency,
      summary: input.summary,
      safety_actions: input.safety_actions,
      status: 'Submitted',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isDemoMode) {
      const current = get().incidents;
      
      // Save media locally if any
      const mockMedia: IncidentMedia[] = mediaUrls.map((url) => ({
        id: `med-${Math.random().toString(36).substr(2, 9)}`,
        incident_id: newIncident.id,
        media_url: url,
        media_type: 'image',
        created_at: new Date().toISOString(),
      }));

      set({ 
        incidents: [newIncident, ...current], 
        media: { ...get().media, [newIncident.id]: mockMedia },
        isLoading: false 
      });

      return newIncident;
    }

    try {
      // Real Supabase insert
      const { data, error } = await supabase!
        .from('incident_reports')
        .insert({
          reporter_id: input.is_anonymous ? null : userId,
          category: input.category,
          description: input.description,
          latitude: input.latitude,
          longitude: input.longitude,
          location_name: input.location_name,
          incident_time: new Date().toISOString(),
          is_anonymous: input.is_anonymous,
          urgency: input.urgency,
          summary: input.summary,
          safety_actions: input.safety_actions,
          status: 'Submitted',
        })
        .select()
        .single();

      if (error) throw error;

      // Insert media if present
      if (mediaUrls.length > 0) {
        const mediaInserts = mediaUrls.map((url) => ({
          incident_id: data.id,
          media_url: url,
          media_type: 'image',
        }));
        await supabase!.from('incident_media').insert(mediaInserts);
      }

      set({ incidents: [data, ...get().incidents], isLoading: false });
      return data;
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      return null;
    }
  },

  addIncidentUpdate: async (incidentId, userId, userName, userRole, updateText) => {
    set({ isLoading: true, error: null });

    const newUpdate: IncidentUpdate = {
      id: `upd-${Math.random().toString(36).substr(2, 9)}`,
      incident_id: incidentId,
      user_id: userId,
      user_name: userName,
      user_role: userRole,
      update_text: updateText,
      created_at: new Date().toISOString(),
    };

    if (isDemoMode) {
      const currentUpdates = get().updates[incidentId] || [];
      set({
        updates: {
          ...get().updates,
          [incidentId]: [...currentUpdates, newUpdate],
        },
        isLoading: false,
      });
      return true;
    }

    try {
      const { error } = await supabase!
        .from('incident_updates')
        .insert({
          incident_id: incidentId,
          user_id: userId,
          update_text: updateText,
        });

      if (error) throw error;
      
      const currentUpdates = get().updates[incidentId] || [];
      set({
        updates: {
          ...get().updates,
          [incidentId]: [...currentUpdates, newUpdate],
        },
        isLoading: false,
      });
      return true;
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      return false;
    }
  },

  moderateIncident: async (incidentId, moderatorId, action, notes) => {
    set({ isLoading: true, error: null });

    let nextStatus: IncidentStatus = 'Submitted';
    if (action === 'verify') nextStatus = 'Verified';
    else if (action === 'reject') nextStatus = 'Rejected';
    else if (action === 'resolve') nextStatus = 'Resolved';

    if (isDemoMode) {
      const updated = get().incidents.map((inc) => {
        if (inc.id === incidentId) {
          return {
            ...inc,
            status: nextStatus,
            updated_at: new Date().toISOString(),
          };
        }
        return inc;
      });

      // Add a status update card automatically
      const currentUpdates = get().updates[incidentId] || [];
      const systemUpdate: IncidentUpdate = {
        id: `upd-sys-${Math.random().toString(36).substr(2, 9)}`,
        incident_id: incidentId,
        user_id: moderatorId,
        user_name: 'Moderation System',
        user_role: 'moderator',
        update_text: `Status updated to [${nextStatus}] by Moderator. Note: ${notes || 'No description provided.'}`,
        created_at: new Date().toISOString(),
      };

      set({
        incidents: updated,
        updates: {
          ...get().updates,
          [incidentId]: [...currentUpdates, systemUpdate],
        },
        isLoading: false,
      });
      return true;
    }

    try {
      // Create Moderator Action
      const { error: actionErr } = await supabase!
        .from('moderator_actions')
        .insert({
          moderator_id: moderatorId,
          incident_id: incidentId,
          action_type: action,
          notes,
        });

      if (actionErr) throw actionErr;

      // Update Incident Status
      const { error: incidentErr } = await supabase!
        .from('incident_reports')
        .update({ status: nextStatus, updated_at: new Date().toISOString() })
        .eq('id', incidentId);

      if (incidentErr) throw incidentErr;

      // Log audit
      await supabase!.from('audit_logs').insert({
        user_id: moderatorId,
        action: `moderate_${action}`,
        details: { incident_id: incidentId, notes },
      });

      const updated = get().incidents.map((inc) => 
        inc.id === incidentId ? { ...inc, status: nextStatus, updated_at: new Date().toISOString() } : inc
      );

      set({ incidents: updated, isLoading: false });
      return true;
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      return false;
    }
  },

  simulateAICategorization: async (description) => {
    // Artificial latency for realism
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const lowercase = description.toLowerCase();
    let category = 'Other';
    let urgency: IncidentUrgency = 'Medium';
    let summary = 'A safety incident has been reported.';
    let safety_actions: string[] = ['Maintain situational awareness.', 'Contact local authorities if immediate help is required.'];

    if (lowercase.includes('fire') || lowercase.includes('smoke') || lowercase.includes('blaze')) {
      category = 'Fire';
      urgency = 'High';
      summary = 'Active fire reported in the vicinity.';
      safety_actions = [
        'Evacuate immediately if you are near the source.',
        'Do not inhale smoke; stay low to the ground.',
        'Keep emergency access paths clear for fire vehicles.'
      ];
      if (lowercase.includes('trapped') || lowercase.includes('building')) {
        urgency = 'Critical';
      }
    } else if (lowercase.includes('chest pain') || lowercase.includes('heart') || lowercase.includes('bleeding') || lowercase.includes('unconscious') || lowercase.includes('collapse') || lowercase.includes('breathing')) {
      category = 'Medical';
      urgency = 'High';
      summary = 'Urgent medical emergency requiring assistance.';
      safety_actions = [
        'Check airway and breathing if safe to do so.',
        'If trained, administer appropriate first-aid/CPR.',
        'Do not move the individual unless they are in immediate danger.'
      ];
      if (lowercase.includes('stop breathing') || lowercase.includes('unresponsive')) {
        urgency = 'Critical';
      }
    } else if (lowercase.includes('gun') || lowercase.includes('rob') || lowercase.includes('theft') || lowercase.includes('fight') || lowercase.includes('assault') || lowercase.includes('attack') || lowercase.includes('weapon')) {
      category = 'Threat/Crime';
      urgency = 'High';
      summary = 'Active security threat or criminal activity.';
      safety_actions = [
        'Do not engage or confront the perpetrator.',
        'Seek a secure location and lock/barricade doors.',
        'Keep phone volume on silent and stay out of sight.'
      ];
      if (lowercase.includes('shooter') || lowercase.includes('hostage')) {
        urgency = 'Critical';
      }
    } else if (lowercase.includes('crash') || lowercase.includes('collision') || lowercase.includes('accident') || lowercase.includes('fender')) {
      category = 'Accident';
      urgency = 'Medium';
      summary = 'Traffic accident blocking right-of-way.';
      safety_actions = [
        'Slow down when approaching the area to avoid multi-car pileups.',
        'Stay inside the vehicle unless safe to exit to the shoulder.'
      ];
      if (lowercase.includes('trapped') || lowercase.includes('highway')) {
        urgency = 'High';
      }
    } else if (lowercase.includes('gas leak') || lowercase.includes('earthquake') || lowercase.includes('flood') || lowercase.includes('chemical') || lowercase.includes('explosion')) {
      category = 'Disaster';
      urgency = 'Critical';
      summary = 'Significant environmental hazard or natural disaster.';
      safety_actions = [
        'Follow official evacuation paths immediately.',
        'Avoid turning on lights or electronic devices if gas leak is suspected.',
        'Stay updated via community alerts.'
      ];
    }

    return { category, urgency, summary, safety_actions };
  },
}));
