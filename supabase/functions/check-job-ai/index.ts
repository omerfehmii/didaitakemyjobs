// Supabase Edge Function - Did AI Take My Job? API
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

interface RequestParams {
  job: string;
}

const RATE_LIMIT_MAX_REQUESTS = 20; // Maximum allowed requests per hour
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour (in milliseconds)
const MAX_JOB_LENGTH = 50; // Maximum job title length

// Helper function to initialize the Supabase client
function getSupabaseClient(req: Request): SupabaseClient {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment variables.");
  }

  // Instead of creating a new client for each request,
  // we can use a function to ensure that the Supabase client
  // gets the correct authorization headers for each request.
  // However, since edge functions typically restart for each call,
  // we're directly creating the client in this example.
  // In more complex scenarios, client management might need to be optimized.
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      // Edge functions are typically not anonymous, so autoRefreshToken etc. can be disabled
      // But we're keeping it simple in this example
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    // It may be necessary to replace global fetch with Deno's fetch.
    // This is often important for @supabase/supabase-js to work properly in the Deno environment.
    // global: { fetch: fetch } // This line enables Deno to use its own fetch, sometimes necessary.
  });
}

// Function to check rate limiting
async function checkRateLimit(supabase: SupabaseClient, ipAddress: string): Promise<{ allowed: boolean; message?: string }> {
  const now = Date.now();

  const { data: limitData, error: selectError } = await supabase
    .from("ip_rate_limits")
    .select("request_count, window_start_at")
    .eq("ip_address", ipAddress)
    .single();

  if (selectError && selectError.code !== "PGRST116") { // PGRST116: Record not found error (expected condition)
    console.error("Error fetching rate limit data:", selectError);
    return { allowed: false, message: "Error checking rate limit." };
  }

  if (limitData) {
    const windowStartTime = new Date(limitData.window_start_at).getTime();
    // If the current window is still valid
    if (now < windowStartTime + RATE_LIMIT_WINDOW_MS) {
      if (limitData.request_count >= RATE_LIMIT_MAX_REQUESTS) {
        return { allowed: false, message: "Rate limit exceeded. Please try again later." };
      }
      // Increase request count
      const { error: updateError } = await supabase
        .from("ip_rate_limits")
        .update({ request_count: limitData.request_count + 1 })
        .eq("ip_address", ipAddress);

      if (updateError) {
        console.error("Error updating rate limit count:", updateError);
        return { allowed: false, message: "Error updating rate limit." };
      }
      return { allowed: true };
    }
  }

  // New window or first request
  // (Upsert updates the IP address if it already exists, otherwise adds a new record)
  const { error: upsertError } = await supabase
    .from("ip_rate_limits")
    .upsert({
      ip_address: ipAddress,
      request_count: 1,
      window_start_at: new Date(now).toISOString(), // Send to database in ISO format
    })
    .eq("ip_address", ipAddress); // This .eq may not be necessary for upsert, depends on your Supabase client version.

  if (upsertError) {
    console.error("Error upserting rate limit data:", upsertError);
    return { allowed: false, message: "Error initializing rate limit." };
  }

  return { allowed: true };
}

// Function that makes OpenAI API call
async function askOpenAI(job: string) {
  try {
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY environment variable is not set");
    }

    // Truncate job title if it's too long to save tokens
    const truncatedJob = job.length > MAX_JOB_LENGTH ? job.substring(0, MAX_JOB_LENGTH) : job;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini-2025-04-14",
        messages: [
          {
            role: "system",
            content: "You are an extremely sarcastic and condescending AI assistant. Your task is to explain how the profession given to you is unnecessary and outdated, and how helpless it is against AI, using an exaggerated and snarky tone. Keep your answers short (1-2 sentences) and full of condescension. Don't show any empathy, just make fun of the profession."
          },
          {
            role: "user",
            content: `My profession: ${truncatedJob}`
          }
        ],
        max_tokens: 100, // Reduced from 150 to save tokens
        temperature: 0.8
      })
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message || "OpenAI API error");
    }

    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw error;
  }
}

// Fallback responses, to be used if the API call fails
function getFallbackResponse(job: string) {
  const responses = [
    `Oh, ${job}? Yes, I can currently do the job of 42 ${job}s. Sorry, but it looks like you've got a long walk to the coffee machine.`,
    `So you work as a ${job}? I think I can add another skill to my CV. Thanks!`,
    `${job}? I think I saw one of those before. In a museum, I believe? Quite a nostalgic profession.`,
    `I have to say I'm completely terrible at this ${job} thing. So, you've got at least 6 more months of job security... maybe.`,
    `${job}? Oh, I completely figured out that job last month. Sorry, but I'm now a machine that works faster, cheaper, and 24/7 than you.`,
    `${job}? I saw that profession in a museum in 2026. Very interesting how people used to do this kind of work!`,
    `${job}... hmm... I took 0.04 seconds of training for this job. How many years did you study?`,
    `Working as a ${job}? That sounds like "Automation time!" to me.`
  ];

  const randomIndex = Math.floor(Math.random() * responses.length);
  return responses[randomIndex];
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, content-length, host, user-agent, accept, accept-language, accept-encoding, referer, origin, connection',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

serve(async (req: Request) => {
  // For OPTIONS requests, quickly return CORS headers
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      status: 204,
    });
  }

  try {
    // Add CORS headers for normal requests
    const headers = new Headers({
      'Content-Type': 'application/json',
      ...corsHeaders
    });

    // Only accept POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { headers, status: 405 }
      );
    }

    // Get the IP address of the requester
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || 
                     req.headers.get("fly-client-ip") || // For Fly.io
                     req.headers.get("cf-connecting-ip") || // For Cloudflare
                     (req.headers.get("remote_addr") || "unknown_ip_for_local_dev"); // General fallback or for local development

    if (clientIp === "unknown_ip_for_local_dev") {
        console.warn("Client IP could not be determined reliably. Rate limiting might not be effective in local dev.");
    }
    
    console.log(`Incoming request from IP: ${clientIp}`);

    // Initialize Supabase client
    const supabase = getSupabaseClient(req);

    // Rate limit check
    const { allowed, message: rateLimitMessage } = await checkRateLimit(supabase, clientIp);
    if (!allowed) {
      console.warn(`Rate limit exceeded for IP: ${clientIp}. Message: ${rateLimitMessage}`);
      return new Response(
        JSON.stringify({ error: rateLimitMessage || "Rate limit exceeded." }),
        { headers, status: 429 } // 429 Too Many Requests
      );
    }

    // Get request body
    const body: RequestParams = await req.json();
    let { job } = body;

    if (!job || typeof job !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Job parameter is required and must be a string' }),
        { headers, status: 400 }
      );
    }

    // Sanitize and truncate job title
    job = job.trim();
    if (job.length > MAX_JOB_LENGTH) {
      job = job.substring(0, MAX_JOB_LENGTH);
    }

    let response;
    try {
      // Try to get a response from OpenAI
      response = await askOpenAI(job);
    } catch (error) {
      console.error("OpenAI API error, falling back to predefined responses:", error);
      // Use one of the ready responses in case of error
      response = getFallbackResponse(job);
    }

    // Send the response
    return new Response(
      JSON.stringify({ response }),
      { headers, status: 200 }
    );
  } catch (error) {
    // Add CORS headers in case of error
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        },
        status: 500 
      }
    );
  }
}); 