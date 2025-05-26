import { createClient } from '@supabase/supabase-js';

// Supabase configuration
// Note: In a production app, these would be stored in environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Export initialized client for use throughout the app
export default supabase;

// Table names for reference
export const TABLES = {
  USERS: 'users',
  PATIENTS: 'patients',
  APPOINTMENTS: 'appointments',
  REMINDER_TEMPLATES: 'reminder_templates',
  SCHEDULED_REMINDERS: 'scheduled_reminders',
  SENT_REMINDERS: 'sent_reminders'
};

export const getPatients = async () => {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .order('name');
  if (error) throw error;
  return data;
};

/**
 * Utility function to handle Supabase errors in a consistent way
 * @param {Object} error - Error object from Supabase
 * @param {string} customMessage - Custom message to prepend to the error
 * @throws {Error} - Re-throws the error with more context
 */
export const handleSupabaseError = (error, customMessage) => {
  console.error(`${customMessage}:`, error);
  throw new Error(`${customMessage}: ${error.message || 'Unknown error'}`);
};