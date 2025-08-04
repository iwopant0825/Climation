import React from 'react';

interface LoadingScreenProps {
  isLoading: boolean;
  isMobile: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ isLoading, isMobile }) => {
  if (!isLoading) return null;
  
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#000022',
      zIndex: 99999,
      color: 'white',
      fontFamily: 'Arial, sans-serif',
    }}>
      <h2 style={{
        fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
        margin: '0 0 2rem 0',
        background: 'linear-gradient(45deg, #00ff88, #0088ff)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        animation: 'pulse 1.5s infinite ease-in-out',
      }}>
        CLIMATION
      </h2>
      <div style={{
        width: '180px',
        height: '4px',
        background: '#111133',
        borderRadius: '4px',
        overflow: 'hidden',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          width: '50%',
          background: 'linear-gradient(45deg, #00ff88, #0088ff)',
          animation: 'loading 1.5s infinite ease-in-out',
          borderRadius: '4px',
        }}></div>
      </div>
      <p style={{
        fontSize: 'clamp(0.8rem, 2vw, 1rem)',
        marginTop: '1rem',
        opacity: 0.7,
      }}>
        {isMobile ? '모바일 최적화 모드로 로딩 중...' : '기후위기 메타버스 로딩 중...'}
      </p>
    </div>
  );
};

export default LoadingScreen;
