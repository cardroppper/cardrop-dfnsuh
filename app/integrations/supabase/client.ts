import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Database } from './types';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://pukpbqbxmuipnwtywrmm.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1a3BicWJ4bXVpcG53dHl3cm1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0MTE0MjksImV4cCI6MjA4MTk4NzQyOX0.-r4L3mqitNyhFKEfqq7llQC09f3Qd_APTDaET4FCEiI";

console.log('[Supabase] Starting initialization...');

// Validate configuration
if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  const errorMsg = 'Supabase configuration is missing. Please check your environment variables.';
  console.error('[Supabase] Missing configuration!');
  throw new Error(errorMsg);
}

console.log('[Supabase] Configuration validated, creating client...');

// Create Supabase client with error handling
let supabaseClient: ReturnType<typeof createClient<Database>>;

try {
  supabaseClient = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
  console.log('[Supabase] Client created successfully');
} catch (error: any) {
  console.error('[Supabase] Failed to create client:', error);
  throw new Error(`Failed to initialize Supabase: ${error?.message || 'Unknown error'}`);
}

export const supabase = supabaseClient;
