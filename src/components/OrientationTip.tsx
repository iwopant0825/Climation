import React from 'react'
import { MaterialIcon } from './MaterialIcon';

interface OrientationTipProps {
  isMobile: boolean;
  isLandscape: boolean;
  isLoading: boolean;
  showOrientationTip: boolean;
}

const OrientationTip: React.FC<OrientationTipProps> = ({ 
  isMobile, 
  isLandscape, 
  isLoading, 
  showOrientationTip 
}) => {
  if (!isMobile || isLandscape || isLoading || !showOrientationTip) return null;
  
  return (
    <div style={{
      position: 'absolute',
      top: 'auto',
      bottom: '80px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'rgba(0,0,0,0.7)',
      color: 'white',
      padding: '10px 15px',
      borderRadius: '8px',
      fontSize: '12px',
      zIndex: 9000,
      textAlign: 'center',
      backdropFilter: 'blur(10px)',
      maxWidth: '85vw',
      boxSizing: 'border-box',
      animation: 'fadeIn 0.5s ease-in-out',
      border: '1px solid rgba(0, 255, 136, 0.3)',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '8px',
      }}>
        <MaterialIcon icon="screen_rotation" size={16} color="#007bff" style={{ marginRight: '8px' }} />
        <span>기기를 가로로 돌리면 더 넓은 화면으로 볼 수 있어요!</span>
      </div>
      <div style={{ fontSize: '10px', opacity: 0.8 }}>
        이 메시지는 10초 후 자동으로 사라집니다
      </div>
    </div>
  );
};

export default OrientationTip;
