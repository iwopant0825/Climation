import React from 'react';

const ControlsHelp: React.FC = () => {
  return (
    <div style={{
      position: 'absolute',
      bottom: '20px',
      left: '20px',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
      fontSize: 'clamp(12px, 2vw, 14px)', // 반응형 폰트
      background: 'rgba(0, 0, 0, 0.5)',
      padding: 'clamp(8px, 2vw, 10px)',
      borderRadius: '5px',
      backdropFilter: 'blur(10px)',
      maxWidth: '90vw', // 모바일에서 화면 넘침 방지
      boxSizing: 'border-box',
    }}>
      <div>🖱️ 터치/마우스로 지구 회전</div>
      <div>🔍 핀치/휠로 확대/축소</div>
      <div>🌍 지구 위 핀을 터치/클릭하여 탐험 시작</div>
    </div>
  );
};

export default ControlsHelp;
