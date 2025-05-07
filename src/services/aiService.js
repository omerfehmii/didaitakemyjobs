import { supabase } from '../lib/supabase';

// Bu fonksiyon yapay zekaya mesleği gönderip cevap alır
export async function checkJobWithAI(job) {
  console.log('checkJobWithAI çağrıldı:', job);

  try {
    // Doğrudan Supabase Edge Function URL'sine istek gönder
    const SUPABASE_URL = 'https://msholfsvozgrqypfhkvk.supabase.co';
    const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zaG9sZnN2b3pncnF5cGZoa3ZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MDI4MzIsImV4cCI6MjA2MjA3ODgzMn0.HWZnpAwUqzwfDPQ_iPSDaBp1iH5WZQq3BeaTBdtpq-k';
    
    console.log('Doğrudan API çağrısı yapılıyor...');
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/check-job-ai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ANON_KEY}`,
        'apikey': ANON_KEY
      },
      body: JSON.stringify({ job })
    });
    
    console.log('API yanıt durumu:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API hata yanıtı:', errorText);
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('API yanıtı:', data);
    
    if (data.error) {
      console.error('API yanıt hatası:', data.error);
      return getFallbackResponse(job);
    }
    
    return data.response;
  } catch (err) {
    console.error('API çağrısı sırasında bir hata oluştu:', err);
    return getFallbackResponse(job);
  }
}

// Yedek yanıtlar (API bağlantısı olmadığında veya hata durumunda)
function getFallbackResponse(job) {
  console.log('Fallback yanıt kullanılıyor...');
  
      const responses = [
        `Ah, ${job} mi? Evet, ben şu anda 42 ${job}'nin işini yapabiliyorum. Üzgünüm ama kahve makinasına gidecek yolun uzun gözüküyor.`,
        `${job} olarak çalışıyorsun demek? Sanırım CV'me bir yetenek daha ekleyebilirim. Teşekkürler!`,
        `${job}? Daha önceden bir tane görmüştüm. Müzedeydiler sanırım? Nostaljik bir meslek.`,
        `Şu ${job} konusunda tamamen kötü olduğumu söylemeliyim. Yani, en azından 6 ay daha iş güvenliğin var... belki.`,
        `${job}? Oh, ben o işi geçen ay tamamen çözdüm. Üzgünüm, artık benden daha hızlı, daha ucuz ve 24/7 çalışan bir makineyim.`
      ];
      
      const randomIndex = Math.floor(Math.random() * responses.length);
  return responses[randomIndex];
} 