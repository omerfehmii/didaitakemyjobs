import { useState, useEffect, useRef } from 'react';

export function JobForm({ onSubmit }) {
  const [job, setJob] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);
  
  useEffect(() => {
    return () => {
      setIsLoading(false);
    };
  }, []);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.backgroundColor = '#000';
      inputRef.current.style.color = '#fff';
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!job.trim()) return;
    
    setIsLoading(true);
    const promise = onSubmit(job);
    
    if (promise && typeof promise.then === 'function') {
      promise.finally(() => {
        setIsLoading(false);
        if (inputRef.current) {
          inputRef.current.style.backgroundColor = '#000';
          inputRef.current.style.color = '#fff';
        }
      });
    } else {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setJob(e.target.value);
    e.target.style.backgroundColor = '#000';
    e.target.style.color = '#fff';
  };

  const containerStyle = {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    position: 'relative'
  };

  const formStyle = {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  };

  const inputContainerStyle = {
    marginBottom: '8px',
    height: '60px'
  };

  const labelStyle = {
    display: 'block', 
    marginBottom: '6px', 
    textAlign: 'center', 
    color: '#fff',
    fontSize: '14px',
    height: '16px'
  };

  const fixedInputStyle = {
    display: 'block',
    width: '100%',
    height: '38px',
    backgroundColor: '#000',
    color: '#fff',
    border: '1px solid #222',
    borderRadius: '8px',
    padding: '8px 12px',
    outline: 'none',
    boxSizing: 'border-box',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    appearance: 'none',
    WebkitTextFillColor: '#fff',
    caretColor: '#ffffff',
    fontFamily: 'inherit',
    fontSize: '14px',
    lineHeight: '1.5',
    transition: 'border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out'
  };

  const buttonContainerStyle = {
    textAlign: 'center',
    height: '40px',
    marginTop: '5px'
  };

  // Styles for icons
  const iconStyle = {
    width: '20px',
    height: '20px',
    marginRight: '8px',
    position: 'relative',
    zIndex: 2
  };
  
  // Loading spinner icon
  const LoadingIcon = () => (
    <svg style={{...iconStyle, animation: 'rotation 1s linear infinite'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.2)"></circle>
      <path d="M12 2a10 10 0 0 1 10 10" stroke="white"></path>
    </svg>
  );
  
  // Search icon
  const SearchIcon = () => (
    <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  );

  return (
    <div style={containerStyle}>
      <form onSubmit={handleSubmit} style={formStyle}>
        <div style={inputContainerStyle}>
          <label htmlFor="job" style={labelStyle}>
            What is your profession?
          </label>
          
          <input
            ref={inputRef}
            type="text"
            id="job"
            name="job-input-black"
            value={job}
            onChange={handleChange}
            onFocus={(e) => { 
              e.target.style.backgroundColor = '#000'; 
              e.target.style.color = '#fff'; 
              e.target.style.borderColor = '#ffffff';
              e.target.style.boxShadow = '0 0 0 2px rgba(255, 255, 255, 0.2)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#222';
              e.target.style.boxShadow = 'none';
            }}
            placeholder="E.g.: Graphic Designer, Software Developer..."
            style={fixedInputStyle}
            disabled={isLoading}
            className="job-input"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            data-form-type="other"
          />
        </div>
        
        <div style={buttonContainerStyle}>
          <button
            type="submit"
            disabled={isLoading || !job.trim()}
            className="submit-button"
          >
            {isLoading ? <LoadingIcon /> : <SearchIcon />}
            {isLoading ? "CHECKING..." : "DID AI TAKE MY JOB?"}
          </button>
        </div>
      </form>
    </div>
  );
} 