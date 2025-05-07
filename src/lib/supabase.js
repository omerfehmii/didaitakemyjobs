import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://msholfsvozgrqypfhkvk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zaG9sZnN2b3pncnF5cGZoa3ZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MDI4MzIsImV4cCI6MjA2MjA3ODgzMn0.HWZnpAwUqzwfDPQ_iPSDaBp1iH5WZQq3BeaTBdtpq-k';
 
export const supabase = createClient(supabaseUrl, supabaseKey);