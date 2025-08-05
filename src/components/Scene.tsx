import React, { useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { Stars } from './Stars'
import { CameraControls } from './CameraControls'
import RotatingEarth from './RotatingEarth'
import { AsphaltWorld } from './AsphaltWorld'

export function Scene() {
  const [showTitle, setShowTitle] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [currentWorld, setCurrentWorld] = useState<'earth' | 'heatisland'>('earth')

  // 기후 위기 핸들러
  const handleHeatIslandCrisis = () => {
    console.log('열섬 현상 위기 탐험!')
    setCurrentWorld('heatisland')
  }

  const handleBackToEarth = () => {
    console.log('지구로 돌아가기')
    setCurrentWorld('earth')
  }

  const handleOtherCrisis = (type: string) => {
    console.log(`${type} 위기 탐험!`)
    // 여기에 다른 위기 관련 로직 추가
  }

  useEffect(() => {
    // 기기 타입 감지
    const checkDeviceType = () => {
      const width = window.innerWidth
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      const isTouchDevice = 'ontouchstart' in window
      
      setIsMobile((isMobileDevice || isTouchDevice) && width <= 768)
      setIsTablet((isMobileDevice || isTouchDevice) && width > 768 && width <= 1024)
    }

    checkDeviceType()
    window.addEventListener('resize', checkDeviceType)
    window.addEventListener('orientationchange', checkDeviceType)

    // 로딩 시뮬레이션
    const loadingTimer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    // 타이틀 자동 숨김
    const titleTimer = setTimeout(() => {
      setShowTitle(false)
    }, 5000)

    return () => {
      window.removeEventListener('resize', checkDeviceType)
      window.removeEventListener('orientationchange', checkDeviceType)
      clearTimeout(loadingTimer)
      clearTimeout(titleTimer)
    }
  }, [])

  // 열섬 현상 세계인 경우 별도 렌더링
  if (currentWorld === 'heatisland') {
    return <AsphaltWorld onBackToEarth={handleBackToEarth} />
  }

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* 로딩 화면 */}
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #0a1929 0%, #1a2332 50%, #0a1929 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          animation: 'fadeOut 0.5s ease-out 1.5s both',
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            border: '4px solid rgba(0, 255, 136, 0.3)',
            borderTop: '4px solid #00ff88',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '20px',
          }} />
          <div style={{
            color: '#00ff88',
            fontSize: isMobile ? '18px' : '24px',
            fontWeight: 'bold',
            textAlign: 'center',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}>
            기후 위기 메타버스 로딩 중...
          </div>
          <div style={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: isMobile ? '12px' : '14px',
            marginTop: '10px',
            textAlign: 'center',
          }}>
            지구의 현재 상태를 확인하세요
          </div>
        </div>
      )}

      {/* 메인 타이틀 */}
      {showTitle && !isLoading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 100,
          textAlign: 'center',
          color: 'white',
          pointerEvents: 'none',
        }}>
          <h1 style={{
            fontSize: isMobile ? '32px' : isTablet ? '42px' : '48px',
            fontWeight: 'bold',
            margin: '0 0 16px 0',
            color: '#00ff88',
            textShadow: '0 0 20px rgba(0, 255, 136, 0.6)',
            letterSpacing: '2px',
            opacity: 0,
            animation: 'titleFadeIn 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) both, titleSmoothFadeOut 1.5s cubic-bezier(0.55, 0.06, 0.68, 0.19) 4s both',
          }}>
            기후 위기 메타버스
          </h1>
          <p style={{
            fontSize: isMobile ? '16px' : isTablet ? '18px' : '20px',
            margin: '0',
            fontWeight: '300',
            color: 'rgba(255, 255, 255, 0.9)',
            textShadow: '0 0 10px rgba(255, 255, 255, 0.3)',
            opacity: 0,
            animation: 'titleFadeIn 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.8s both, titleSmoothFadeOut 1.5s cubic-bezier(0.55, 0.06, 0.68, 0.19) 4s both',
          }}>
            지구의 현재를 탐험하고 미래를 생각해보세요
          </p>
        </div>
      )}

      {/* 3D 캔버스 */}
      <Canvas
        camera={{ 
          position: [0, 0, 5], 
          fov: isMobile ? 85 : 75 // 모바일에서 더 넓은 시야각
        }}
        style={{ background: 'transparent' }}
        dpr={isMobile ? [1, 1.5] : [1, 2]} // 모바일에서 성능 최적화
        performance={{ min: 0.5 }} // 성능 임계값 설정
        gl={{ 
          antialias: !isMobile, // 모바일에서 안티앨리어싱 비활성화
          powerPreference: isMobile ? "low-power" : "high-performance",
          alpha: false // 투명도 비활성화로 성능 향상
        }}
      >
        {/* 전체 기본 조명 - 모바일에서 조명 최적화 */}
        <ambientLight intensity={isMobile ? 0.8 : 0.6} />
        
        {/* 메인 태양광 (지구 정면) */}
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={isMobile ? 1.0 : 1.2} 
          color="#ffffff"
          castShadow={!isMobile} // 모바일에서 그림자 비활성화
        />
        
        {/* 보조 조명 (지구 측면) - 모바일에서 간소화 */}
        {!isMobile && (
          <pointLight 
            position={[-8, 5, 8]} 
            intensity={0.8} 
            color="#ffeaa7"
          />
        )}
        
        {/* 뒷조명 (지구 뒤쪽 가장자리) - 모바일에서 간소화 */}
        {!isMobile && (
          <pointLight 
            position={[0, -5, -10]} 
            intensity={0.5} 
            color="#74b9ff"
          />
        )}
        
        {/* 상단 조명 (북극 쪽) - 모바일에서 간소화 */}
        {!isMobile && (
          <pointLight 
            position={[0, 15, 0]} 
            intensity={0.4} 
            color="#fdcb6e"
          />
        )}
        
        <Stars /> {/* 별 개수는 Stars 컴포넌트 내부에서 조정 */}
        <RotatingEarth 
          onHeatIslandCrisis={handleHeatIslandCrisis}
          onOtherCrisis={handleOtherCrisis}
        />
        <CameraControls />
      </Canvas>

      {/* 조작 안내 */}
      {!isLoading && (
        <div style={{
          position: 'absolute',
          bottom: isMobile ? '15px' : isTablet ? '20px' : '25px',
          left: isMobile ? '15px' : isTablet ? '20px' : '25px',
          color: 'white',
          fontFamily: 'Arial, sans-serif',
          fontSize: isMobile ? '12px' : isTablet ? '13px' : '14px',
          background: 'rgba(0, 0, 0, 0.7)',
          padding: isMobile ? '12px' : isTablet ? '14px' : '16px',
          borderRadius: '12px',
          backdropFilter: 'blur(15px)',
          border: '1px solid rgba(0, 255, 136, 0.3)',
          maxWidth: isMobile ? '180px' : '220px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 20px rgba(0, 255, 136, 0.1)',
          animation: 'fadeIn 2s ease-in-out 1s both',
          transition: 'all 0.3s ease',
        }}>
          <div style={{ 
            marginBottom: '8px', 
            fontWeight: 'bold', 
            color: '#00ff88',
            fontSize: isMobile ? '13px' : '15px'
          }}>
            🎮 조작법
          </div>
          <div style={{ marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#0088ff' }}>🖱️</span>
            <span>{isMobile || isTablet ? '터치로 지구 회전' : '마우스로 지구 회전'}</span>
          </div>
          <div style={{ marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#ff8800' }}>🔍</span>
            <span>{isMobile || isTablet ? '핀치로 확대/축소' : '휠로 확대/축소'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#ff4444' }}>🌍</span>
            <span>{isMobile || isTablet ? '핀을 터치하여 탐험' : '핀을 클릭하여 탐험'}</span>
          </div>
        </div>
      )}

      {/* 우측 하단 정보 */}
      {!isLoading && (
        <div style={{
          position: 'absolute',
          bottom: isMobile ? '15px' : '25px',
          right: isMobile ? '15px' : '25px',
          color: 'rgba(255, 255, 255, 0.8)',
          fontFamily: 'Arial, sans-serif',
          fontSize: isMobile ? '11px' : '12px',
          textAlign: 'right',
          background: 'rgba(0, 0, 0, 0.5)',
          padding: isMobile ? '8px 12px' : '10px 15px',
          borderRadius: '8px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          animation: 'fadeIn 2s ease-in-out 2s both',
        }}>
          <div style={{ fontWeight: 'bold', color: '#00ff88', marginBottom: '4px' }}>
            Climate Crisis Metaverse
          </div>
          <div style={{ opacity: 0.8 }}>
            Ver 1.0 | 2025
          </div>
        </div>
      )}
    </div>
  )
}