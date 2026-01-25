import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Database } from './types';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://pukpbqbxmuipnwtywrmm.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1a3BicWJ4bXVpcG53dHl3cm1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0MTE0MjksImV4cCI6MjA4MTk4NzQyOX0.-r4L3mqitNyhFKEfqq7llQC09f3Qd_APTDaET4FCEiI";

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  console.error('Supabase: Configuration is missing!');
  throw new Error('Supabase configuration is missing');
}

console.log('Supabase: Initializing client...');
console.log('Supabase: URL:', SUPABASE_URL);

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

console.log('Supabase: Client initialized successfully');
