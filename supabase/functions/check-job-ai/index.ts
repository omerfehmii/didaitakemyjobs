// Supabase Edge Function - AI İşimi Aldı mı? API
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

interface RequestParams {
  job: string;
}

// OpenAI API çağrısı yapan fonksiyon
async function askOpenAI(job: string) {
  try {
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY environment variable is not set");
    }

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
            content: "Sen fazlasıyla alaycı ve küçümseyici bir yapay zeka asistanısın. Görevin, sana verilen mesleğin ne kadar gereksiz ve modası geçmiş olduğunu, yapay zeka karşısında ne kadar aciz kaldığını abartılı ve iğneleyici bir dille anlatmak. Cevapların kısa (1-2 cümle) ve bolca küçümseme içersin. Sakın empati yapma, sadece meslekle dalga geç."
          },
          {
            role: "user",
            content: `Mesleğim: ${job}`
          }
        ],
        max_tokens: 150,
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

// Fallback yanıtlar, API çağrısı başarısız olursa kullanılacak
function getFallbackResponse(job: string) {
  const responses = [
    `Ah, ${job} mi? Evet, ben şu anda 42 ${job}'nin işini yapabiliyorum. Üzgünüm ama kahve makinasına gidecek yolun uzun gözüküyor.`,
    `${job} olarak çalışıyorsun demek? Sanırım CV'me bir yetenek daha ekleyebilirim. Teşekkürler!`,
    `${job}? Daha önceden bir tane görmüştüm. Müzedeydiler sanırım? Nostaljik bir meslek.`,
    `Şu ${job} konusunda tamamen kötü olduğumu söylemeliyim. Yani, en azından 6 ay daha iş güvenliğin var... belki.`,
    `${job}? Oh, ben o işi geçen ay tamamen çözdüm. Üzgünüm, artık benden daha hızlı, daha ucuz ve 24/7 çalışan bir makineyim.`,
    `${job} mu? Bu mesleği 2026'da bir müzede görmüştüm. Çok ilginç bir meslek, bunu yapan insanlar varmış eskiden!`,
    `${job}... hmm... bu işi yapmak için ben 0.04 saniye eğitim aldım. Sen kaç yıl okudun?`,
    `${job} olarak çalışmak? Bu kulağa "Otomasyon zamanı!" gibi geliyor.`
  ];

  const randomIndex = Math.floor(Math.random() * responses.length);
  return responses[randomIndex];
}

// CORS başlıkları
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, content-length, host, user-agent, accept, accept-language, accept-encoding, referer, origin, connection',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

serve(async (req) => {
  // OPTIONS isteği için hızlı bir şekilde CORS başlıklarını döndür
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
    // Normal istekler için CORS başlıklarını ekle
    const headers = new Headers({
      'Content-Type': 'application/json',
      ...corsHeaders
    });

    // Sadece POST isteklerini kabul et
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { headers, status: 405 }
      );
    }

    // İstek gövdesini al
    const body: RequestParams = await req.json();
    const { job } = body;

    if (!job || typeof job !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Job parameter is required and must be a string' }),
        { headers, status: 400 }
      );
    }

    let response;
    try {
      // OpenAI'dan yanıt almaya çalış
      response = await askOpenAI(job);
    } catch (error) {
      console.error("OpenAI API hatası, fallback yanıta dönülüyor:", error);
      // Hata durumunda hazır yanıtlardan birini kullan
      response = getFallbackResponse(job);
    }

    // Yanıtı gönder
    return new Response(
      JSON.stringify({ response }),
      { headers, status: 200 }
    );
  } catch (error) {
    // Hata durumunda CORS başlıklarını ekle
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