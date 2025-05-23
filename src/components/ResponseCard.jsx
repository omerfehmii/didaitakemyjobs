import { useState, useEffect } from 'react';

export function ResponseCard({ response, isLoading }) {
  const [isTyping, setIsTyping] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [typingIndex, setTypingIndex] = useState(0);
  
  // Start typing effect when response changes
  useEffect(() => {
    if (response && !isLoading) {
      setDisplayedText('');
      setTypingIndex(0);
      setIsTyping(true);
    }
  }, [response, isLoading]);
  
  // Typing effect
  useEffect(() => {
    if (isTyping && response) {
      if (typingIndex < response.length) {
        const timer = setTimeout(() => {
          setDisplayedText(prev => prev + response.charAt(typingIndex));
          setTypingIndex(prev => prev + 1);
        }, 30); // Wait 30ms for each character
        
        return () => clearTimeout(timer);
      } else {
        setIsTyping(false);
      }
    }
  }, [isTyping, response, typingIndex]);

  // Main container style - maintains fixed height
  const containerStyle = {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    padding: '10px 0',
    minHeight: '180px', // Fixed minimum height
    position: 'relative',
    height: '100%'
  };
  
  // Loading indicator style
  const loadingStyle = {
    padding: '15px',
    borderRadius: '8px',
    backgroundColor: '#000',
    border: '1px solid #222',
    height: '100px'
  };
  
  // Response container style
  const responseStyle = {
    padding: '15px 10px',
    color: '#fff',
    minHeight: '100px',
    width: '100%',
    textAlign: 'left'
  };
  
  // Content style - left-aligned, white text
  const contentStyle = {
    textAlign: 'left',
    color: '#ffffff', // White text
    minHeight: '60px',
    maxHeight: '120px',
    overflowY: 'auto',
    position: 'relative',
    padding: '0',
    fontWeight: 'bold', 
    fontSize: '16px',
    lineHeight: '1.5'
  };
  
  // Style for the "Answer:" part
  const answerPrefix = {
    color: '#ff0000', // Only the "Answer:" part is red
    fontWeight: 'bold',
    marginRight: '6px'
  };
  
  // Cursor style
  const cursorStyle = {
    display: isTyping ? 'inline-block' : 'none',
    width: '2px',
    height: '16px',
    backgroundColor: '#ffffff', // White cursor
    marginLeft: '2px',
    animation: 'blink 1s step-end infinite'
  };
  
  // Placeholder style
  const placeholderStyle = {
    textAlign: 'center',
    color: '#444',
    fontStyle: 'italic',
    margin: '0',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)'
  };

  if (isLoading) {
    return (
      <div style={containerStyle}>
        <div style={loadingStyle}>
          <div style={{animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'}}>
            <div style={{height: '12px', backgroundColor: '#222', borderRadius: '4px', width: '75%', marginBottom: '10px'}}></div>
            <div style={{height: '12px', backgroundColor: '#222', borderRadius: '4px', width: '50%', marginBottom: '10px'}}></div>
            <div style={{height: '12px', backgroundColor: '#222', borderRadius: '4px', width: '83%'}}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!response) {
    return (
      <div style={containerStyle}>
        <p style={placeholderStyle}>
          Results will appear here
        </p>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={responseStyle}>
        <div style={contentStyle}>
          <span style={answerPrefix}>Answer:</span> {displayedText}
          <span style={cursorStyle}></span>
        </div>
      </div>
    </div>
  );
} 