import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Define a type for your database schema
type Database = {
  public: {
    Tables: {
      feedback: {
        Row: {
          id: string;
          email?: string;
          message: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email?: string;
          message: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          message?: string;
          created_at?: string;
        };
      };
    };
  };
};

// Log environment variables for debugging (they won't be exposed in production)
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set');

// Log partial key for verification (first 10 chars)
const partialKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY 
  ? `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 10)}...` 
  : 'Not set';
console.log('Supabase Anon Key:', partialKey);

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

if (!supabaseUrl || !supabaseAnonKey) {
  const errorMsg = 'Missing Supabase environment variables. Please check your .env.local file.';
  console.error(errorMsg);
  throw new Error(errorMsg);
}

// Validate URL format
if (!supabaseUrl.startsWith('http')) {
  const errorMsg = 'Invalid Supabase URL. It should start with http:// or https://';
  console.error(errorMsg);
  throw new Error(errorMsg);
}

// Validate key format
if (!supabaseAnonKey.startsWith('ey')) {
  const errorMsg = 'Invalid Supabase anon key format. It should start with "ey"';
  console.error(errorMsg);
  throw new Error(errorMsg);
}

// Declare supabase at the module level with proper type
let supabase: SupabaseClient<Database>;

try {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: false,
      detectSessionInUrl: false
    }
  });

  // Test connection
  supabase.from('feedback').select('*').limit(1)
    .then(({ error }) => {
      if (error) {
        console.error('Supabase connection test failed:', error);
      } else {
        console.log('Supabase connected successfully');
      }
    });
} catch (error) {
  console.error('Failed to initialize Supabase:', error);
  throw error;
}

export { supabase };

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
