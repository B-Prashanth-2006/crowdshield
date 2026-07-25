export type UserRole = 'member' | 'moderator' | 'admin';

export interface Profile {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  blood_group?: string;
  emergency_notes?: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface EmergencyContact {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  email?: string;
  priority: number;
  created_at: string;
}

export type SOSStatus = 'active' | 'resolved' | 'cancelled';
export type SOSType = 'Medical' | 'Fire' | 'Threat/Crime' | 'Accident' | 'Disaster' | 'Other';

export interface EmergencyAlert {
  id: string;
  user_id: string;
  latitude: number;
  longitude: number;
  type: SOSType;
  status: SOSStatus;
  created_at: string;
  resolved_at?: string;
  profile?: Profile; // Joins
}

export type IncidentUrgency = 'Low' | 'Medium' | 'High' | 'Critical';
export type IncidentStatus = 'Submitted' | 'Under Review' | 'Verified' | 'Resolved' | 'Rejected';

export interface IncidentReport {
  id: string;
  reporter_id: string | null;
  category: string;
  description: string;
  latitude: number;
  longitude: number;
  location_name?: string;
  incident_time: string;
  is_anonymous: boolean;
  urgency: IncidentUrgency;
  summary?: string;
  safety_actions: string[];
  status: IncidentStatus;
  created_at: string;
  updated_at: string;
  reporter_name?: string; // Virtual UI join
}

export interface IncidentMedia {
  id: string;
  incident_id: string;
  media_url: string;
  media_type: 'image' | 'video';
  created_at: string;
}

export interface IncidentUpdate {
  id: string;
  incident_id: string;
  user_id: string | null;
  user_name?: string; // Virtual UI join
  user_role?: UserRole; // Virtual UI join
  update_text: string;
  created_at: string;
}

export type CheckInStatus = 'active' | 'safe' | 'delayed' | 'missed_check_in';

export interface CheckIn {
  id: string;
  user_id: string;
  destination_name: string;
  latitude: number;
  longitude: number;
  eta: string;
  status: CheckInStatus;
  created_at: string;
  checked_in_at?: string;
}

export interface LocationShare {
  id: string;
  user_id: string;
  contact_ids: string[];
  latitude?: number;
  longitude?: number;
  is_active: boolean;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreference {
  user_id: string;
  push_enabled: boolean;
  sms_enabled: boolean;
  email_enabled: boolean;
  alert_radius_km: number;
}

export interface ModeratorAction {
  id: string;
  moderator_id: string;
  incident_id: string;
  action_type: 'verify' | 'reject' | 'resolve' | 'escalate';
  notes?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  action: string;
  details?: Record<string, any>;
  created_at: string;
}
