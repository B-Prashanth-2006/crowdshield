import { Profile, EmergencyContact, IncidentReport, CheckIn } from '../types';

export const MOCK_USER_PROFILE: Profile = {
  id: 'user-123',
  name: 'Jane Doe',
  phone: '+1 (555) 019-2834',
  address: '123 Safety Way, Secure Valley, CA',
  blood_group: 'O+',
  emergency_notes: 'Asthmatic, carries inhaler in backpack. Penicillin allergy.',
  role: 'member',
  created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  updated_at: new Date().toISOString(),
};

export const MOCK_MODERATOR_PROFILE: Profile = {
  id: 'mod-456',
  name: 'Officer Alex Chen',
  phone: '+1 (555) 014-9988',
  role: 'moderator',
  created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
  updated_at: new Date().toISOString(),
};

export const MOCK_ADMIN_PROFILE: Profile = {
  id: 'admin-789',
  name: 'Sarah Jenkins',
  phone: '+1 (555) 017-1122',
  role: 'admin',
  created_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
  updated_at: new Date().toISOString(),
};

export const MOCK_CONTACTS: EmergencyContact[] = [
  {
    id: 'contact-1',
    user_id: 'user-123',
    name: 'Mark Doe (Spouse)',
    phone: '+1 (555) 019-9900',
    email: 'mark.doe@example.com',
    priority: 1,
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'contact-2',
    user_id: 'user-123',
    name: 'Dr. Helen Carter (Physician)',
    phone: '+1 (555) 012-4411',
    email: 'dr.carter@safetyclinic.org',
    priority: 2,
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'contact-3',
    user_id: 'user-123',
    name: 'Officer Davis (Family Friend)',
    phone: '+1 (555) 018-7733',
    priority: 3,
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Center coordinates for simulation: San Francisco City Hall
export const SIMULATION_CENTER_LAT = 37.7793;
export const SIMULATION_CENTER_LNG = -122.4192;

export const MOCK_INCIDENTS: IncidentReport[] = [
  {
    id: 'inc-1',
    reporter_id: 'user-999',
    reporter_name: 'John Miller',
    category: 'Disaster',
    description: 'Gas line burst under the street. Strong smell of natural gas spreading rapidly. Fire department is on their way but streets are blocked.',
    latitude: SIMULATION_CENTER_LAT + 0.003,
    longitude: SIMULATION_CENTER_LNG - 0.002,
    location_name: 'Civic Center Plaza',
    incident_time: new Date(Date.now() - 25 * 60 * 1000).toISOString(), // 25 min ago
    is_anonymous: false,
    urgency: 'Critical',
    summary: 'Gas line burst near Civic Center. Strong gas odors reported, emergency crews en route, road blockages present.',
    safety_actions: [
      'Evacuate the area immediately.',
      'Avoid using open flames or electronic devices that may cause sparks.',
      'Follow instructions from first responders on site.'
    ],
    status: 'Verified',
    created_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
  },
  {
    id: 'inc-2',
    reporter_id: null,
    reporter_name: 'Anonymous',
    category: 'Fire',
    description: 'Large dumpster fire behind the commercial building. Heavy black smoke starting to rise. Threatening nearby power lines.',
    latitude: SIMULATION_CENTER_LAT - 0.004,
    longitude: SIMULATION_CENTER_LNG + 0.005,
    location_name: '8th St & Mission St',
    incident_time: new Date(Date.now() - 40 * 60 * 1000).toISOString(), // 40 min ago
    is_anonymous: true,
    urgency: 'High',
    summary: 'Commercial dumpster fire emitting toxic black smoke near power lines.',
    safety_actions: [
      'Keep clear of the smoke plume to avoid inhaling toxic fumes.',
      'Do not attempt to extinguish if flames exceed chest height.',
      'Allow space for arriving fire engines.'
    ],
    status: 'Under Review',
    created_at: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
  },
  {
    id: 'inc-3',
    reporter_id: 'user-777',
    reporter_name: 'Emily Watson',
    category: 'Accident',
    description: 'Minor fender-bender between a sedan and a delivery van. No injuries, but blocking the right lane causing a traffic bottleneck.',
    latitude: SIMULATION_CENTER_LAT + 0.001,
    longitude: SIMULATION_CENTER_LNG + 0.007,
    location_name: 'Market St & 6th St',
    incident_time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    is_anonymous: false,
    urgency: 'Medium',
    summary: 'Two-car minor collision blocking the right lane. No injuries, heavy traffic back-up.',
    safety_actions: [
      'Drive slowly when passing the scene.',
      'If involved, move vehicles to the shoulder if safe to do so.'
    ],
    status: 'Resolved',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: 'inc-4',
    reporter_id: 'user-123',
    reporter_name: 'Jane Doe',
    category: 'Threat/Crime',
    description: 'Shoplifting turned aggressive at the local convenience store. Suspect fled on foot heading north on 9th St. Wearing a black hoodie.',
    latitude: SIMULATION_CENTER_LAT - 0.002,
    longitude: SIMULATION_CENTER_LNG - 0.006,
    location_name: '9th St Convenience',
    incident_time: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 min ago
    is_anonymous: false,
    urgency: 'Medium',
    summary: 'Aggressive shoplifting suspect fleeing north on 9th St.',
    safety_actions: [
      'Do not attempt to confront the suspect.',
      'Report sightings matching the description to local authorities.'
    ],
    status: 'Verified',
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
];

export const MOCK_CHECKINS: CheckIn[] = [
  {
    id: 'check-1',
    user_id: 'user-123',
    destination_name: 'Home Office',
    latitude: SIMULATION_CENTER_LAT + 0.01,
    longitude: SIMULATION_CENTER_LNG + 0.015,
    eta: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 mins from now
    status: 'active',
    created_at: new Date().toISOString(),
  },
];
