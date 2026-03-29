import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xwklqmflhsvnvfuuyquj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3a2xxbWZsaHN2bnZmdXV5cXVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MjUxMDMsImV4cCI6MjA5MDMwMTEwM30.LgStdwcwfWjzOn7d6Ls8IW9D8kTeM8D7PGRBmXqlrAA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
