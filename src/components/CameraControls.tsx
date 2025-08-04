import React, { useState, useEffect } from 'react'
import { OrbitControls } from '@react-three/drei'

export function CameraControls() {
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

  return (
    <OrbitControls
      enablePan={false}
      enableZoom={true}
      enableRotate={true}
      zoomSpeed={isMobile ? 1.5 : isTablet ? 1.2 : 0.8}
      rotateSpeed={isMobile ? 0.8 : isTablet ? 0.6 : 0.5}
      minDistance={isMobile ? 6 : isTablet ? 5 : 3}
      maxDistance={isMobile ? 20 : isTablet ? 18 : 15}
      autoRotate={false}
      target={[0, 0, 0]}
      enableDamping={true}
      dampingFactor={isMobile ? 0.08 : isTablet ? 0.06 : 0.05}
      // 터치 제스처 설정
      touches={{
        ONE: 0, // 한 손가락으로 회전
        TWO: 1, // 두 손가락으로 줌
      }}
      mouseButtons={{
        LEFT: 0, // 마우스 좌클릭으로 회전
        MIDDLE: 1, // 마우스 휠로 줌
        RIGHT: undefined, // 우클릭 비활성화
      }}
    />
  )
}
