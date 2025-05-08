import { useState, useEffect, lazy, Suspense } from 'react'
import { JobForm } from './components/JobForm'
import { ResponseCard } from './components/ResponseCard'
import { checkJobWithAI } from './services/aiService'
// Lazy load the SplineScene component
const SplineScene = lazy(() => import('./components/ui/splite').then(module => ({ default: module.SplineScene })))
import { TypeWriter } from './components/TypeWriter'
import { ShineBorder } from './components/ShineBorder'
import LaserPointer from './components/LaserPointer'
import './App.css'

// Preload the 3D model assets
const preloadSplineAssets = () => {
  // Create a hidden iframe to preload the Spline scene
  const preloader = document.createElement('link');
  preloader.rel = 'preload';
  preloader.href = 'https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode';
  preloader.as = 'fetch';
  preloader.crossOrigin = 'anonymous';
  document.head.appendChild(preloader);
  
  // Also preload the static preview image
  const imagePreloader = document.createElement('link');
  imagePreloader.rel = 'preload';
  imagePreloader.href = 'https://prod.spline.design/kZDDjO5HuC9GJUM2/preview.png';
  imagePreloader.as = 'image';
  document.head.appendChild(imagePreloader);

  return () => {
    document.head.removeChild(preloader);
    document.head.removeChild(imagePreloader);
  };
};

function App() {
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [splineVisible, setSplineVisible] = useState(false);

  // To fix the dimensions when the page is loaded
  useEffect(() => {
    // Preload the 3D assets in the background
    const cleanupPreloader = preloadSplineAssets();
    
    // Wait 200ms after page load to mark as loaded
    // This gives time for Spline and other resources to load
    const timer = setTimeout(() => {
      setPageLoaded(true);
      
      // Delay showing the 3D model until after the page transition
      // to ensure smooth loading
      const splineTimer = setTimeout(() => {
        setSplineVisible(true);
      }, 300);
      
      return () => clearTimeout(splineTimer);
    }, 500);
    
    return () => {
      clearTimeout(timer);
      cleanupPreloader();
    };
  }, []);

  const handleJobSubmit = async (job) => {
    setIsLoading(true);
    console.log('Job submit started:', job);
    try {
      console.log('Requesting AI response...');
      const aiResponse = await checkJobWithAI(job);
      console.log('AI response received:', aiResponse);
      setResponse(aiResponse);
      return Promise.resolve(); // Make sure a Promise is returned
    } catch (error) {
      console.error('AI response error:', error);
      setResponse('Sorry, there was a problem communicating with the AI.');
      return Promise.reject(error); // Return a Promise in error case too
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

  // Loading screen
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

  // Main content
  const mainContent = {
    opacity: pageLoaded ? 1 : 0,
    transition: 'opacity 0.3s ease-in-out'
  };

  return (
    <div style={pageStyles}>
      {/* Loading indicator */}
      <div style={loadingContainer}>
        <div className="loader"></div>
      </div>
      
      {/* Main content - only show after loading */}
      <div style={mainContent}>
        {/* Laser pointer effect */}
        <LaserPointer />
        
        <div style={containerStyles}>
          {/* Title */}
          <div style={{textAlign: "center", marginBottom: "20px", height: "40px"}}>
            <h1 style={{fontSize: "24px", color: "#ffffff", fontWeight: "bold"}}>
              <TypeWriter strings={["Enter your job, and the AI will tell you if it's taking your place!", "Did AI Take My Job?", "Welcome to the future!"]} />
            </h1>
          </div>
          
          {/* Two-column layout */}
          <div style={{display: "flex", flexDirection: "row", gap: "20px", flexWrap: "wrap", minHeight: "500px"}}>
            {/* Left side - Form */}
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
                  {/* Title - fixed height */}
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
                      Check Your Profession
                    </h2>
                  </div>
                  
                  {/* Form section - fixed height */}
                  <div style={{
                    height: "120px", 
                    minHeight: "120px", 
                    maxHeight: "120px"
                  }}>
                    <JobForm onSubmit={handleJobSubmit} />
                  </div>
                  
                  {/* Response section - expands to fill remaining space */}
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
            
            {/* Right side - Visual */}
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
                  {/* Black gradient under the robot */}
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
                  
                  {/* Only render the 3D model when ready */}
                  {splineVisible ? (
                    <Suspense fallback={
                      <div 
                        style={{
                          width: '100%',
                          height: '100%',
                          backgroundSize: 'contain',
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'center',
                          backgroundImage: 'url(https://prod.spline.design/kZDDjO5HuC9GJUM2/preview.png)'
                        }}
                      />
                    }>
                      <SplineScene 
                        scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                        className="w-full h-full"
                      />
                    </Suspense>
                  ) : (
                    <div 
                      style={{
                        width: '100%',
                        height: '100%',
                        backgroundSize: 'contain',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center',
                        backgroundImage: 'url(https://prod.spline.design/kZDDjO5HuC9GJUM2/preview.png)',
                        opacity: 0.7
                      }}
                    />
                  )}
                </div>
              </ShineBorder>
            </div>
          </div>
        </div>

        <div style={footerStyles}>
          <p>© {new Date().getFullYear()} Did AI Take My Job? | For entertainment purposes only</p>
        </div>
      </div>
    </div>
  )
}

export default App
