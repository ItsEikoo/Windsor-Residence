import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://btmpagjaeggpouwbdibm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0bXBhZ2phZWdncG91d2JkaWJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxNjY5NjEsImV4cCI6MjA2Nzc0Mjk2MX0.4EVdi8Co1qTckPHxBu85XbRQR36muEiUUKw7OVPhcI4'; // Keep anon, not service key

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
