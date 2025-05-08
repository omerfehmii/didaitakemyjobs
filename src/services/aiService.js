import { supabase } from '../lib/supabase';

// This function sends the profession to AI and gets a response
export async function checkJobWithAI(job) {
  console.log('checkJobWithAI called:', job);

  try {
    // Send request directly to Supabase Edge Function URL
    const SUPABASE_URL = 'https://msholfsvozgrqypfhkvk.supabase.co';
    const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zaG9sZnN2b3pncnF5cGZoa3ZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MDI4MzIsImV4cCI6MjA2MjA3ODgzMn0.HWZnpAwUqzwfDPQ_iPSDaBp1iH5WZQq3BeaTBdtpq-k';
    
    console.log('Making direct API call...');
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/check-job-ai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ANON_KEY}`,
        'apikey': ANON_KEY
      },
      body: JSON.stringify({ job })
    });
    
    console.log('API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error response:', errorText);
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('API response:', data);
    
    if (data.error) {
      console.error('API response error:', data.error);
      return getFallbackResponse(job);
    }
    
    return data.response;
  } catch (err) {
    console.error('An error occurred during API call:', err);
    return getFallbackResponse(job);
  }
}

// Fallback responses (when API connection fails or in case of error)
function getFallbackResponse(job) {
  console.log('Using fallback response...');
  
  const responses = [
    `Oh, ${job}? Yes, I can currently do the job of 42 ${job}s. Sorry, but it looks like you've got a long walk to the coffee machine.`,
    `So you work as a ${job}? I think I can add another skill to my CV. Thanks!`,
    `${job}? I think I saw one of those before. In a museum, I believe? Quite a nostalgic profession.`,
    `I have to say I'm completely terrible at this ${job} thing. So, you've got at least 6 more months of job security... maybe.`,
    `${job}? Oh, I completely figured out that job last month. Sorry, but I'm now a machine that works faster, cheaper, and 24/7 than you.`
  ];
      
  const randomIndex = Math.floor(Math.random() * responses.length);
  return responses[randomIndex];
} 