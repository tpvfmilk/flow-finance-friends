// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://irpvodwbqpmqiiuqswoa.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlycHZvZHdicXBtcWlpdXFzd29hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1Njc5NjYsImV4cCI6MjA2MTE0Mzk2Nn0.uGfR6jPFZDINMaO5ti0bG-E1ZJXboxe8U0kkugXlARY";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);