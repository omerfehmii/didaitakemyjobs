import { useEffect, useRef } from 'react';

export function Simple3D({ className }) {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    let rafId;
    let rotation = 0;
    
    const render = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      
      // Mavi gradient arka plan
      const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#4a80f5');
      gradient.addColorStop(1, '#2d3b8e');
      context.fillStyle = gradient;
      context.fillRect(0, 0, canvas.width, canvas.height);
      
      // Basit küp çizimi
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const size = Math.min(canvas.width, canvas.height) * 0.3;
      
      // Küp köşeleri (3D koordinatlar)
      const vertices = [
        // Ön yüz
        [-1, -1, 1],
        [1, -1, 1],
        [1, 1, 1],
        [-1, 1, 1],
        // Arka yüz
        [-1, -1, -1],
        [1, -1, -1],
        [1, 1, -1],
        [-1, 1, -1],
      ];
      
      // Kenarlar (köşe indeksleri)
      const edges = [
        [0, 1], [1, 2], [2, 3], [3, 0], // ön yüz
        [4, 5], [5, 6], [6, 7], [7, 4], // arka yüz
        [0, 4], [1, 5], [2, 6], [3, 7], // bağlantılar
      ];
      
      // Döndürme - basit rotasyon
      const rotatedVertices = vertices.map(([x, y, z]) => {
        // X ve Z eksenlerinde döndür
        const cosR = Math.cos(rotation);
        const sinR = Math.sin(rotation);
        
        const rotX = x;
        const rotY = y * cosR - z * sinR;
        const rotZ = y * sinR + z * cosR;
        
        const cosR2 = Math.cos(rotation * 0.7);
        const sinR2 = Math.sin(rotation * 0.7);
        
        const finalX = rotX * cosR2 - rotZ * sinR2;
        const finalY = rotY;
        const finalZ = rotX * sinR2 + rotZ * cosR2;
        
        // 3D'den 2D'ye projeksiyon (basit)
        const scale = 8 / (8 + finalZ);
        const projX = centerX + finalX * size * scale;
        const projY = centerY + finalY * size * scale;
        
        return [projX, projY, scale];
      });
      
      // Kenarları çiz
      context.lineWidth = 2;
      context.strokeStyle = '#ffffff';
      
      edges.forEach(([i, j]) => {
        context.beginPath();
        context.moveTo(rotatedVertices[i][0], rotatedVertices[i][1]);
        context.lineTo(rotatedVertices[j][0], rotatedVertices[j][1]);
        context.stroke();
      });
      
      // Köşeleri çiz
      context.fillStyle = '#4afffd';
      rotatedVertices.forEach(([x, y, scale]) => {
        context.beginPath();
        context.arc(x, y, 4 * scale, 0, Math.PI * 2);
        context.fill();
      });
      
      rotation += 0.01;
      rafId = requestAnimationFrame(render);
    };
    
    // Canvas boyutunu ayarla
    const resizeCanvas = () => {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;
    };
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    render();
    
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);
  
  return (
    <canvas 
      ref={canvasRef} 
      className={className || "w-full h-full"}
      style={{ display: 'block' }}
    />
  );
} 