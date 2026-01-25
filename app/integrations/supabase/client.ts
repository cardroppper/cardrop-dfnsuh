import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Database } from './types';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://pukpbqbxmuipnwtywrmm.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1a3BicWJ4bXVpcG53dHl3cm1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0MTE0MjksImV4cCI6MjA4MTk4NzQyOX0.-r4L3mqitNyhFKEfqq7llQC09f3Qd_APTDaET4FCEiI";

console.log('[Supabase] Starting initialization...');
console.log('[Supabase] URL:', SUPABASE_URL);
console.log('[Supabase] Key length:', SUPABASE_PUBLISHABLE_KEY?.length || 0);

// Validate configuration
if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  const errorMsg = 'Supabase configuration is missing. Please check your environment variables.';
  console.error('[Supabase] Missing configuration! URL:', !!SUPABASE_URL, 'Key:', !!SUPABASE_PUBLISHABLE_KEY);
  console.error('[Supabase]', errorMsg);
  throw new Error(errorMsg);
}

console.log('[Supabase] Configuration validated, creating client...');

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

let supabase: ReturnType<typeof createClient<Database>>;

try {
  console.log('[Supabase] Creating Supabase client with AsyncStorage...');
  
  supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
  
  console.log('[Supabase] Client created successfully');
  console.log('[Supabase] Client type:', typeof supabase);
  console.log('[Supabase] Has auth:', !!supabase.auth);
  console.log('[Supabase] Has from:', !!supabase.from);
} catch (error: any) {
  console.error('[Supabase] Failed to create client:', error);
  console.error('[Supabase] Error name:', error?.name);
  console.error('[Supabase] Error message:', error?.message);
  console.error('[Supabase] Error stack:', error?.stack);
  throw error;
}

export { supabase };

console.log('[Supabase] Module exported successfully');
