import { Suspense, lazy, useRef, useEffect } from 'react'
const Spline = lazy(() => import('@splinetool/react-spline'))

export function SplineScene({
  scene,
  className
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    // This effect handles any additional setup needed for the Spline container
    const container = containerRef.current;
    if (!container) return;

    // Make container take full size of parent for better interaction
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.position = 'relative';
    
    // Clean up if needed
    return () => {
      // Any cleanup code here
    };
  }, []);

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
    <Suspense
      fallback={
        <div className="w-full h-full flex items-center justify-center">
          <span className="loader"></span>
        </div>
      }>
      <Spline scene={scene} className={className} />
    </Suspense>
    </div>
  );
}