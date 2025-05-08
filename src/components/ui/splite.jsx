import { Suspense, lazy, useRef, useEffect, useState } from 'react'
const Spline = lazy(() => import('@splinetool/react-spline'))

export function SplineScene({
  scene,
  className
}) {
  const containerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Preload the Spline scene
  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return prev;
        }
        return prev + Math.random() * 10;
      });
    }, 300);

    // Preload the Spline scene
    const preloadImage = new Image();
    preloadImage.src = 'https://prod.spline.design/kZDDjO5HuC9GJUM2/preview.png'; // Fallback static image
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    // This effect handles any additional setup needed for the Spline container
    const container = containerRef.current;
    if (!container) return;

    // Make container take full size of parent for better interaction
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.position = 'relative';
    
    // Lower resolution for better performance
    const setLowQualityRendering = (spline) => {
      if (spline?.runtime?.renderer) {
        // Reduce pixel ratio for better performance
        spline.runtime.renderer.setPixelRatio(window.devicePixelRatio > 1 ? 1.5 : 1);
      }
    };

    // Add the setLowQualityRendering function to the window object
    window.setLowQualitySpline = setLowQualityRendering;
    
    // Clean up if needed
    return () => {
      window.setLowQualitySpline = null;
    };
  }, []);

  const handleSplineLoad = (spline) => {
    setIsLoading(false);
    setLoadingProgress(100);
    
    // Apply low quality settings
    if (window.setLowQualitySpline) {
      window.setLowQualitySpline(spline);
    }
  };

  const handleSplineError = () => {
    setIsError(true);
    setIsLoading(false);
  };

  // Fallback image style
  const fallbackStyle = {
    width: '100%',
    height: '100%',
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    backgroundImage: 'url(https://prod.spline.design/kZDDjO5HuC9GJUM2/preview.png)'
  };

  // Loading styles
  const progressContainerStyle = {
    position: 'absolute',
    bottom: '30px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '70%',
    height: '4px',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: '2px',
    overflow: 'hidden',
    zIndex: 20
  };

  const progressStyle = {
    height: '100%',
    width: `${loadingProgress}%`,
    backgroundColor: '#3B82F6',
    borderRadius: '2px',
    transition: 'width 0.3s ease-out'
  };

  return (
    <div 
      ref={containerRef}
      className="w-full h-full overflow-visible" 
      style={{ 
        // Add extra padding around the container to increase the interaction area
        // while maintaining the same visual size using negative margins
        padding: '30px',
        margin: '-30px',
        position: 'relative',
        zIndex: 10
      }}
    >
      {isLoading && (
        <div 
          style={progressContainerStyle} 
          aria-hidden="true"
        >
          <div style={progressStyle}></div>
        </div>
      )}

      <Suspense
        fallback={
          <div className="w-full h-full flex items-center justify-center" style={fallbackStyle}>
            <span className="loader"></span>
          </div>
        }>
        {isError ? (
          <div style={fallbackStyle}></div>
        ) : (
          <Spline 
            scene={scene} 
            className={className} 
            onLoad={handleSplineLoad}
            onError={handleSplineError}
          />
        )}
      </Suspense>
    </div>
  );
}