import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
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

// Enhanced environment variable logging
console.group('Supabase Configuration');
console.log('Environment:', process.env.NODE_ENV);
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Not set');

// More detailed key logging (first and last 4 chars for verification)
const formatKey = (key?: string) => {
  if (!key) return 'Not set';
  if (key.length <= 8) return 'Invalid key length';
  return `${key.substring(0, 4)}...${key.substring(key.length - 4)}`;
};

console.log('Supabase Anon Key:', formatKey(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY));
console.groupEnd();

// Create a function to get the Supabase client with proper error handling
const createSupabaseClient = () => {
  // Validate environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || '';

  if (!supabaseUrl || !supabaseAnonKey) {
    const errorMsg = `Missing Supabase environment variables. Please check your .env.local file.\n\n` +
      `NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✅ Present' : '❌ Missing'}\n` +
      `NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✅ Present' : '❌ Missing'}`;
    console.error(errorMsg);
    throw new Error('Missing Supabase environment variables');
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
  
  try {
    console.group('Supabase Client Initialization');
    
    // Log the URL being used (without the key for security)
    console.log('Initializing Supabase client with URL:', supabaseUrl);
    
    const client = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: false,
        detectSessionInUrl: false
      }
    });

    // Test connection with better error handling
    console.log('Testing Supabase connection...');
    const testConnection = async () => {
      try {
        const { data, error, status, statusText } = await client
          .from('feedback')
          .select('*')
          .limit(1);
          
        console.group('Connection Test Results');
        console.log('Status:', status, statusText);
        
        if (error) {
          console.error('❌ Connection test failed with error:', {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
          });
          
          // Provide more helpful error messages for common issues
          if (error.code === '42501') {
            console.error('Error: Insufficient permissions. Check your RLS policies in Supabase.');
          } else if (error.code === '42P01') {
            console.error('Error: The "feedback" table does not exist. Did you run your database migrations?');
          } else if (error.message.includes('Failed to fetch')) {
            console.error('Error: Network request failed. Check your internet connection and CORS settings in Supabase.');
          }
        } else {
          console.log('✅ Successfully connected to Supabase');
          console.log('Retrieved records:', data?.length || 0);
        }
        console.groupEnd();
      } catch (err) {
        console.error('❌ Unexpected error during connection test:', err);
        console.error('This might be a CORS issue. Make sure to configure CORS in your Supabase dashboard to include your development URL.');
      }
    };
    
    // Don't await to avoid blocking, but handle any unhandled rejections
    testConnection().catch(console.error);

    console.groupEnd();
    return client;
  } catch (error) {
    console.group('❌ Supabase Initialization Error');
    console.error('Failed to initialize Supabase client:', error);
    
    // Check for common configuration issues
    if (error instanceof Error) {
      if (error.message.includes('Invalid URL')) {
        console.error('The Supabase URL appears to be invalid. Please check your NEXT_PUBLIC_SUPABASE_URL.');
      } else if (error.message.includes('Invalid API key')) {
        console.error('The Supabase anon key appears to be invalid. Please check your NEXT_PUBLIC_SUPABASE_ANON_KEY.');
      }
    }
    
    console.error('\nTroubleshooting tips:');
    console.error('1. Verify your .env.local file has the correct values');
    console.error('2. Check your internet connection');
    console.error('3. Verify your Supabase project is running and accessible');
    console.error('4. Check the browser console for CORS errors');
    console.error('5. Ensure your Supabase project has the correct RLS policies set up');
    console.groupEnd();
    
    throw new Error('Failed to initialize Supabase client. Check the console for details.');
  }
};

// Initialize Supabase client
const supabase = createSupabaseClient();

export { supabase, createSupabaseClient };

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
