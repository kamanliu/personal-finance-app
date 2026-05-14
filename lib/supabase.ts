import { Database } from '@/database.types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://svjigbewalmygfufmvie.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2amlnYmV3YWxteWdmdWZtdmllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5NjUxMTgsImV4cCI6MjA4NjU0MTExOH0.n3LNGeTHU1tYcctXbVY8MTMtb097K5eeGk96KKpzKfM'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
})
