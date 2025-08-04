import React, { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Earth } from './Earth'
import { Stars } from './Stars'
import { CameraControls } from './CameraControls'
import { ClimatePin } from './ClimatePin'

// 지구와 핀들을 함께 회전시키는 컴포넌트
function RotatingEarth({ onAsphaltCrisis, onOtherCrisis }: { onAsphaltCrisis: () => void, onOtherCrisis: (type: string) => void }) {
  const groupRef = useRef<THREE.Group>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  
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

    return () => {
      window.removeEventListener('resize', checkDeviceType)
      window.removeEventListener('orientationchange', checkDeviceType)
    }
  }, [])
  
  useFrame((state, delta) => {
    if (groupRef.current) {
      // 모바일에서는 더 느리게 회전 (배터리 및 성능 고려)
      const rotationSpeed = isMobile ? 0.08 : isTablet ? 0.09 : 0.1
      groupRef.current.rotation.y += delta * rotationSpeed
    }
  })

  return (
    <group ref={groupRef}>
      <Earth />
      
      {/* 기후위기 핀들 - 지구와 함께 회전 */}
      <ClimatePin
        position={[1.5, 0.8, 1.2]}
        title="아스팔트 열섬 현상"
        description="도시 아스팔트로 인한 온도 상승"
        detailedInfo="도시의 아스팔트와 콘크리트는 태양열을 흡수하여 주변보다 2-5°C 높은 온도를 만듭니다. 이는 에너지 소비 증가, 대기질 악화, 열사병 위험 증가 등을 야기합니다."
        color="#ff4444"
        onClick={onAsphaltCrisis}
      />
      
      <ClimatePin
        position={[-1.2, 1.4, 0.8]}
        title="산림 파괴"
        description="열대우림 파괴와 생태계 변화"
        detailedInfo="매년 축구장 27개 크기의 숲이 사라집니다. 산림은 지구 산소의 30%를 생산하고 탄소를 흡수하는 역할을 하며, 파괴 시 생물다양성 감소와 기후변화가 가속화됩니다."
        color="#ff8800"
        onClick={() => onOtherCrisis('산림파괴')}
      />
      
      <ClimatePin
        position={[0.5, -1.6, 1.0]}
        title="해수면 상승"
        description="빙하 해빙과 해안 침수"
        detailedInfo="지구 온난화로 빙하가 녹으면서 해수면이 연간 3.3mm씩 상승하고 있습니다. 2100년까지 최대 2m 상승 예상되며, 전 세계 해안 도시들이 침수 위험에 처해있습니다."
        color="#0088ff"
        onClick={() => onOtherCrisis('해수면상승')}
      />
      
      <ClimatePin
        position={[-1.8, -0.2, 0.6]}
        title="사막화"
        description="토지 황폐화와 사막 확산"
        detailedInfo="매년 한반도 크기의 비옥한 토지가 사막으로 변하고 있습니다. 과도한 방목, 삼림벌채, 기후변화가 주요 원인이며, 식량 생산 감소와 환경 난민 증가를 야기합니다."
        color="#ffaa00"
        onClick={() => onOtherCrisis('사막화')}
      />
      
      <ClimatePin
        position={[0.8, 0.2, -1.8]}
        title="대기 오염"
        description="미세먼지와 온실가스 증가"
        detailedInfo="화석연료 사용으로 CO2 농도가 산업혁명 이전보다 50% 증가했습니다. 미세먼지는 연간 700만 명의 조기 사망을 야기하며, 온실가스는 지구 평균 온도를 1.1°C 상승시켰습니다."
        color="#888888"
        onClick={() => onOtherCrisis('대기오염')}
      />
    </group>
  )
}

export function Scene() {
  const [showTitle, setShowTitle] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTitle(false)
    }, 3000) // 3초 후 제목 숨김

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

    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', checkDeviceType)
      window.removeEventListener('orientationchange', checkDeviceType)
    }
  }, [])

  const handleAsphaltCrisis = () => {
    console.log('아스팔트 기후위기 세계로 이동!')
    alert('아스팔트 기후위기 메타버스로 이동합니다!')
  }

  const handleOtherCrisis = (type: string) => {
    console.log(`${type} 기후위기 - 추후 구현 예정`)
    alert(`${type} 관련 메타버스는 추후 구현 예정입니다.`)
  }

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000011' }}>
      <Canvas
        camera={{ 
          position: isMobile ? [0, 0, 10] : isTablet ? [0, 0, 9] : [0, 0, 8],
          fov: isMobile ? 60 : isTablet ? 55 : 50,
          near: 0.1,
          far: 1000
        }}
        gl={{
          antialias: !isMobile, // 모바일에서 성능 최적화
          alpha: false,
          powerPreference: isMobile ? 'low-power' : 'high-performance',
        }}
        dpr={isMobile ? [1, 1.5] : [1, 2]} // 모바일에서 픽셀 밀도 제한
        style={{ 
          touchAction: 'none', // 터치 스크롤 방지
          userSelect: 'none',
        }}
      >
        {/* 주변광 */}
        <ambientLight intensity={0.2} />
        
        {/* 태양광 (주광원) */}
        <directionalLight
          position={[10, 10, 5]}
          intensity={1.5}
          color="#ffffff"
          castShadow
        />
        
        {/* 보조광 */}
        <pointLight
          position={[-10, -10, -10]}
          intensity={0.5}
          color="#4444ff"
        />
        
        {/* 우주 배경 별들 */}
        <Stars />
        
        {/* 회전하는 지구와 핀들 */}
        <RotatingEarth 
          onAsphaltCrisis={handleAsphaltCrisis}
          onOtherCrisis={handleOtherCrisis}
        />
        
        {/* 카메라 컨트롤 */}
        <CameraControls />
      </Canvas>
      
      {/* UI 오버레이 */}
      {showTitle && (
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
          animation: 'titleFadeOut 1s ease-in-out 2s forwards', // 2초 후 1초간 페이드아웃
          padding: '0 1rem', // 모바일에서 여백 추가
        }}>
          <h1 style={{
            fontSize: isMobile ? 'clamp(2rem, 8vw, 3rem)' : isTablet ? 'clamp(2.5rem, 6vw, 3.5rem)' : '3rem',
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
            fontSize: isMobile ? 'clamp(0.9rem, 4vw, 1.1rem)' : isTablet ? 'clamp(1rem, 3vw, 1.3rem)' : '1.2rem',
            opacity: 0.8,
            animation: 'fadeIn 1.5s ease-in-out',
            lineHeight: 1.4,
          }}>
            지구를 둘러보며 기후위기의 현실을 체험하고<br />
            해결책을 함께 찾아보세요
          </p>
        </div>
      )}

      {/* 조작 안내 */}
      <div style={{
        position: 'absolute',
        bottom: isMobile ? '10px' : isTablet ? '15px' : '20px',
        left: isMobile ? '10px' : isTablet ? '15px' : '20px',
        color: 'white',
        fontFamily: 'Arial, sans-serif',
        fontSize: isMobile ? '12px' : isTablet ? '13px' : '14px',
        background: 'rgba(0, 0, 0, 0.5)',
        padding: isMobile ? '8px' : isTablet ? '9px' : '10px',
        borderRadius: '5px',
        backdropFilter: 'blur(10px)',
        maxWidth: isMobile ? '160px' : 'auto',
      }}>
        <div>{isMobile || isTablet ? '� 터치로 지구 회전' : '�🖱️ 마우스로 지구 회전'}</div>
        <div>{isMobile || isTablet ? '👌 핀치로 확대/축소' : '🔍 휠로 확대/축소'}</div>
        <div>🌍 {isMobile || isTablet ? '핀을 터치하여 탐험' : '지구 위 핀을 클릭하여 탐험 시작'}</div>
      </div>
    </div>
  )
}
