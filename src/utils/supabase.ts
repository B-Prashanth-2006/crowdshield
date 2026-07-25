import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// If URL or Key is missing, run in interactive Mock/Demo mode
export const isDemoMode = !supabaseUrl || !supabaseAnonKey;

export const supabase = isDemoMode
  ? null
  : createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });

if (isDemoMode) {
  console.log('[CrowdShield] Running in interactive DEMO MODE. Local mock storage enabled.');
} else {
  console.log('[CrowdShield] Running in PRODUCTION BACKEND MODE. Supabase initialized.');
}
