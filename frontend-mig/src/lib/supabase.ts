import { createClient } from '@supabase/supabase-js';

// Log environment variables for debugging (they won't be exposed in production)
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set');
console.log('Supabase Anon Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set');

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false,
    detectSessionInUrl: false
  }
});

// Type for feedback data
export interface FeedbackItem {
  id: string;
  email?: string;
  message: string;
  created_at: string;
}

// For backward compatibility
export type FeedbackData = Omit<FeedbackItem, 'id' | 'created_at'>;

// Function to submit feedback
export const submitFeedback = async (feedback: FeedbackData) => {
  const { data, error } = await supabase
    .from('feedback')
    .insert([feedback])
    .select();

  if (error) {
    console.error('Error submitting feedback:', error);
    throw error;
  }

  return data;
};
