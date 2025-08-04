import React from 'react';

interface TitleOverlayProps {
  showTitle: boolean;
}

const TitleOverlay: React.FC<TitleOverlayProps> = ({ showTitle }) => {
  if (!showTitle) return null;
  
  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
      textAlign: 'center',
      pointerEvents: 'none',
      zIndex: 10000,
      opacity: 1,
      animation: 'fadeOut 1s ease-in-out 2s forwards', // 2초 후 1초간 페이드아웃
    }}>
      <h1 style={{
        fontSize: 'clamp(2rem, 5vw, 3rem)', // 반응형 폰트 크기
        marginBottom: '1rem',
        background: 'linear-gradient(45deg, #00ff88, #0088ff)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        textShadow: '0 0 20px rgba(0, 255, 136, 0.5)',
        animation: 'fadeIn 1s ease-in-out',
      }}>
        CLIMATION
      </h1>
      <p style={{
        fontSize: 'clamp(0.9rem, 2.5vw, 1.2rem)', // 반응형 폰트 크기
        opacity: 0.8,
        maxWidth: '90vw',
        lineHeight: 1.6,
        animation: 'fadeIn 1.5s ease-in-out',
        padding: '0 1rem',
      }}>
        지구를 둘러보며 기후위기의 현실을 체험하고<br />
        해결책을 함께 찾아보세요
      </p>
    </div>
  );
};

export default TitleOverlay;
