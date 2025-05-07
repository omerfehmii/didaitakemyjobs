import { supabase } from './src/lib/supabase.js';

// Edge Function'ı test et
async function testEdgeFunction() {
  console.log('Edge Function testi başlatılıyor...');
  
  try {
    const { data, error } = await supabase.functions.invoke('check-job-ai', {
      body: { job: 'Yazılım Geliştirici' },
    });

    if (error) {
      console.error('Hata:', error);
      return;
    }

    console.log('Başarılı yanıt:', data);
  } catch (err) {
    console.error('Çağrı hatası:', err);
  }
}

// Test fonksiyonunu çalıştır
testEdgeFunction(); 