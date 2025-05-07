import { useState, useEffect } from 'react'
import { JobForm } from './components/JobForm'
import { ResponseCard } from './components/ResponseCard'
import { checkJobWithAI } from './services/aiService'
import { SplineScene } from './components/ui/splite'
import { TypeWriter } from './components/TypeWriter'
import { ShineBorder } from './components/ShineBorder'
import LaserPointer from './components/LaserPointer'
import './App.css'

function App() {
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);

  // Sayfa yüklendiğinde boyutları sabitlemek için
  useEffect(() => {
    // Sayfa yüklendikten sonra 200ms bekleyip işaretleyelim
    // Bu Spline ve diğer kaynakların yüklenmesi için zaman tanır
    const timer = setTimeout(() => {
      setPageLoaded(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleJobSubmit = async (job) => {
    setIsLoading(true);
    console.log('Job submit başladı:', job);
    try {
      console.log('AI yanıtı isteniyor...');
      const aiResponse = await checkJobWithAI(job);
      console.log('AI yanıtı alındı:', aiResponse);
      setResponse(aiResponse);
      return Promise.resolve(); // Promise döndürüldüğünden emin ol
    } catch (error) {
      console.error('AI yanıt hatası:', error);
      setResponse('Üzgünüm, AI ile iletişim kurarken bir sorun oluştu.');
      return Promise.reject(error); // Hata durumunda da Promise döndür
    } finally {
      setIsLoading(false);
    }
  };

  const pageStyles = {
    backgroundColor: "#000",
    color: "#ffffff",
    minHeight: "100vh",
    padding: "0",
    margin: "0",
    display: "flex", 
    flexDirection: "column"
  };

  const containerStyles = {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "20px",
    flex: "1"
  };

  const footerStyles = {
    borderTop: "1px solid #222",
    padding: "20px",
    textAlign: "center",
    color: "#888",
    backgroundColor: "#000"
  };

  // Yükleme işlemi için ekran
  const loadingContainer = {
    opacity: pageLoaded ? 0 : 1,
    position: pageLoaded ? 'absolute' : 'relative',
    top: 0,
    left: 0,
    width: '100%',
    height: '100vh',
    backgroundColor: '#000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    transition: 'opacity 0.3s ease-in-out',
    pointerEvents: pageLoaded ? 'none' : 'auto'
  };

  // Ana içerik için
  const mainContent = {
    opacity: pageLoaded ? 1 : 0,
    transition: 'opacity 0.3s ease-in-out'
  };

  return (
    <div style={pageStyles}>
      {/* Yükleme göstergesi */}
      <div style={loadingContainer}>
        <div className="loader"></div>
      </div>
      
      {/* Ana içerik - sadece yüklendikten sonra göster */}
      <div style={mainContent}>
        {/* Lazer pointer efekti */}
        <LaserPointer />
        
        <div style={containerStyles}>
          {/* Başlık */}
          <div style={{textAlign: "center", marginBottom: "20px", height: "40px"}}>
            <h1 style={{fontSize: "24px", color: "#ffffff", fontWeight: "bold"}}>
              <TypeWriter strings={["Mesleğinizi yazın, AI sizin yerinizi alıp almadığını söylesin!", "AI İşimi Aldı mı?", "Geleceğe hoş geldiniz!"]} />
            </h1>
          </div>
          
          {/* İki sütunlu düzen */}
          <div style={{display: "flex", flexDirection: "row", gap: "20px", flexWrap: "wrap", minHeight: "500px"}}>
            {/* Sol taraf - Form */}
            <div style={{
              flex: "1 1 350px", 
              minWidth: "350px", 
              height: "500px",
              minHeight: "500px",
              maxHeight: "500px"
            }}>
              <ShineBorder
                borderRadius={12}
                duration={10}
                color="#3B82F6"
                className="p-5"
              >
                <div style={{
                  backgroundColor: "#000", 
                  padding: "15px", 
                  borderRadius: "8px",
                  height: "100%", 
                  display: "flex",
                  flexDirection: "column"
                }}>
                  {/* Başlık - sabit yükseklik */}
                  <div style={{
                    height: "70px", 
                    minHeight: "70px",
                    maxHeight: "70px",
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center"
                  }}>
                    <h2 style={{
                      fontSize: "24px", 
                      fontWeight: "bold", 
                      textAlign: "center", 
                      color: "#ffffff"
                    }}>
                      Mesleğinizi Kontrol Edin
                    </h2>
                  </div>
                  
                  {/* Form kısmı - sabit yükseklik */}
                  <div style={{
                    height: "120px", 
                    minHeight: "120px", 
                    maxHeight: "120px"
                  }}>
                    <JobForm onSubmit={handleJobSubmit} />
                  </div>
                  
                  {/* Yanıt kısmı - kalan alana yayılır */}
                  <div style={{
                    flex: "1",
                    minHeight: "200px",
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column"
                  }}>
                    <ResponseCard response={response} isLoading={isLoading} />
                  </div>
                </div>
              </ShineBorder>
            </div>
            
            {/* Sağ taraf - Görsel */}
            <div style={{
              flex: "1 1 400px", 
              minWidth: "400px", 
              height: "600px",
              minHeight: "600px",
              maxHeight: "600px"
            }}>
              <ShineBorder
                borderRadius={12}
                duration={14}
                color={["#ff0080", "#7928ca", "#3B82F6"]}
              >
                <div style={{
                  height: "100%", 
                  backgroundColor: "#000", 
                  width: "100%",
                  position: "relative",
                  overflow: "visible",
                }}>
                    {/* Robotun altındaki siyah gradyan */}
                    <div style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      width: "100%",
                      height: "200px",
                      background: "linear-gradient(to top, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)",
                      zIndex: 15,
                      pointerEvents: "none"
                    }}></div>

                    <SplineScene 
                      scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                      className="w-full h-full"
                    />
                </div>
              </ShineBorder>
            </div>
          </div>
        </div>

        <div style={footerStyles}>
          <p>© {new Date().getFullYear()} AI İşimi Aldı mı? | Tamamen eğlence amaçlıdır</p>
        </div>
      </div>
    </div>
  )
}

export default App
