import React, { useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/cannon'
import { Environment, Sky } from '@react-three/drei'
import { Player } from './Player'
import { CityWithPhysics } from './CityWithPhysics'
import { VirtualJoystick, JumpButton } from './VirtualJoystick'
import { MobileCameraControls } from './MobileCameraControls'
import * as THREE from 'three'

interface AsphaltWorldProps {
  onBackToEarth: () => void
}

export function AsphaltWorld({ onBackToEarth }: AsphaltWorldProps) {
  const worldRef = useRef<THREE.Group>(null)
  const [isLocked, setIsLocked] = React.useState(false)
  const [showBoundaryWarning, setShowBoundaryWarning] = React.useState(false)
  const [isMobile, setIsMobile] = React.useState(false)
  const [isTablet, setIsTablet] = React.useState(false)
  
  // 가상 조이스틱 상태
  const [joystickInput, setJoystickInput] = React.useState({ x: 0, y: 0 })
  const [isJumping, setIsJumping] = React.useState(false)
  
  // 교육 팝업 상태
  const [showEducationPopup, setShowEducationPopup] = React.useState(true)
  const [selectedTechnology, setSelectedTechnology] = React.useState<string | null>(null)
  
  // 차열페인트 상호작용 상태
  const [isInteractionMode, setIsInteractionMode] = React.useState(false)
  const [paintedAreas, setPaintedAreas] = React.useState<Array<{x: number, z: number, radius: number}>>([])
  const [showInteractionHint, setShowInteractionHint] = React.useState(false)
  const [playerPosition, setPlayerPosition] = React.useState<[number, number, number]>([0, 2, 0])

  // 온도계 시스템 상태
  const [cityTemperature, setCityTemperature] = React.useState(45) // 초기 온도 45°C
  const [targetTemperature, setTargetTemperature] = React.useState(45)
  const [temperatureChange, setTemperatureChange] = React.useState(0) // 온도 변화량
  const [showTemperatureAnimation, setShowTemperatureAnimation] = React.useState(false)
  const [animatedTemperature, setAnimatedTemperature] = React.useState(45)
  const normalTemperature = 25 // 목표 정상 온도

  // 기기 타입 감지
  React.useEffect(() => {
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

  // F키 상호작용 핸들링
  React.useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // event.code를 사용하여 키보드 언어에 상관없이 물리적 F키 인식
      if (event.code === 'KeyF' && isLocked && !showEducationPopup && selectedTechnology === 'heatpaint') {
        // 현재 플레이어 위치에 차열페인트 적용
        const newPaintArea = { 
          x: Math.round(playerPosition[0]), 
          z: Math.round(playerPosition[2]), 
          radius: 2 
        }
        
        // 중복 위치 확인 후 추가
        const isDuplicate = paintedAreas.some(area => 
          Math.abs(area.x - newPaintArea.x) < 1.5 && Math.abs(area.z - newPaintArea.z) < 1.5
        )
        
        if (!isDuplicate) {
          setPaintedAreas(prev => [...prev, newPaintArea])
          setShowInteractionHint(true)
          setTimeout(() => setShowInteractionHint(false), 2000)
          
          // 온도 감소 효과 (1-3도 랜덤 감소)
          const tempDecrease = Math.floor(Math.random() * 3) + 1 // 1-3도 랜덤
          const newTemperature = Math.max(normalTemperature, targetTemperature - tempDecrease)
          
          setTemperatureChange(-tempDecrease)
          setTargetTemperature(newTemperature)
          setShowTemperatureAnimation(true)
          
          // 애니메이션 후 숨기기
          setTimeout(() => setShowTemperatureAnimation(false), 3000)
        }
      }
    }

    if (!isMobile) {
      document.addEventListener('keydown', handleKeyPress)
    }

    return () => {
      if (!isMobile) {
        document.removeEventListener('keydown', handleKeyPress)
      }
    }
  }, [isLocked, showEducationPopup, isMobile, selectedTechnology, playerPosition, paintedAreas, targetTemperature, normalTemperature])

  // 차열페인트 체험 모드 활성화
  React.useEffect(() => {
    if (selectedTechnology === 'heatpaint' && !showEducationPopup) {
      setIsInteractionMode(true)
      // 모바일에서는 자동으로 힌트 표시
      if (isMobile) {
        setShowInteractionHint(true)
        setTimeout(() => setShowInteractionHint(false), 5000)
      }
    }
  }, [selectedTechnology, showEducationPopup, isMobile])

  // 온도 애니메이션 효과
  React.useEffect(() => {
    if (targetTemperature !== cityTemperature) {
      const animationDuration = 2000 // 2초
      const startTime = Date.now()
      const startTemp = cityTemperature
      const tempDiff = targetTemperature - startTemp
      
      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / animationDuration, 1)
        
        // 이징 함수 (easeOutCubic)
        const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
        const easedProgress = easeOutCubic(progress)
        
        const currentTemp = startTemp + (tempDiff * easedProgress)
        setAnimatedTemperature(Math.round(currentTemp * 10) / 10) // 소수점 1자리
        setCityTemperature(currentTemp)
        
        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          setCityTemperature(targetTemperature)
          setAnimatedTemperature(targetTemperature)
        }
      }
      
      requestAnimationFrame(animate)
    }
  }, [targetTemperature, cityTemperature])

  // 플레이어 위치 변경 핸들러
  const handlePlayerPositionChange = React.useCallback((position: [number, number, number]) => {
    const [x, , z] = position
    setPlayerPosition(position) // 플레이어 위치 상태 업데이트
    
    const mapBoundary = 35 // 경고 표시용 경계 (실제 경계보다 작게)
    
    if (Math.abs(x) > mapBoundary || Math.abs(z) > mapBoundary) {
      setShowBoundaryWarning(true)
      setTimeout(() => setShowBoundaryWarning(false), 3000) // 3초 후 사라짐
    }
  }, [])

  // 포인터 락 상태 감지 및 모바일 터치 모드 처리
  React.useEffect(() => {
    const handlePointerLockChange = () => {
      setIsLocked(document.pointerLockElement !== null)
    }
    
    document.addEventListener('pointerlockchange', handlePointerLockChange)
    
    // 모바일에서는 첫 터치 시 즉시 락 모드로 전환
    if (isMobile && !isLocked) {
      const enableMobileMode = () => {
        setIsLocked(true)
      }
      
      // 약간의 지연을 두고 모바일 모드 활성화
      const timer = setTimeout(enableMobileMode, 100)
      
      return () => {
        clearTimeout(timer)
        document.removeEventListener('pointerlockchange', handlePointerLockChange)
      }
    }
    
    return () => {
      document.removeEventListener('pointerlockchange', handlePointerLockChange)
    }
  }, [isMobile, isLocked])

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      minHeight: '100dvh',
      maxHeight: isMobile ? '100dvh' : '100vh',
      overflow: 'hidden',
      background: 'transparent'
    }}>
      {/* 뒤로가기 버튼 - 반응형 디자인 */}
      <button
        onClick={onBackToEarth}
        className={isMobile ? 'back-button-mobile' : isTablet ? 'tablet-button' : ''}
        style={{
          position: 'absolute',
          top: isMobile ? 'calc(10px + env(safe-area-inset-top))' : '20px',
          left: isMobile ? '10px' : '20px',
          zIndex: 1000,
          padding: isMobile ? '8px 12px' : '10px 18px',
          fontSize: isMobile ? '12px' : '14px',
          fontWeight: 'bold',
          color: '#ffffff',
          background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.2) 0%, rgba(0, 200, 100, 0.3) 100%)',
          border: '2px solid rgba(0, 255, 136, 0.4)',
          borderRadius: '40px',
          cursor: 'pointer',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 6px 24px rgba(0, 255, 136, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
          letterSpacing: '0.5px',
          textShadow: '0 0 10px rgba(0, 255, 136, 0.5)',
          minHeight: isMobile ? '44px' : 'auto', // 터치 친화적 크기
        }}
        onMouseEnter={(e) => {
          if (!isMobile) {
            e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)'
            e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 255, 136, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 255, 136, 0.3) 0%, rgba(0, 200, 100, 0.4) 100%)'
          }
        }}
        onMouseLeave={(e) => {
          if (!isMobile) {
            e.currentTarget.style.transform = 'translateY(0) scale(1)'
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 255, 136, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 255, 136, 0.2) 0%, rgba(0, 200, 100, 0.3) 100%)'
          }
        }}
      >
        {isMobile ? '뒤로' : '지구로 돌아가기'}
      </button>

      {/* 정보 버튼 - 교육 팝업 다시 열기 */}
      <button
        onClick={() => setShowEducationPopup(true)}
        style={{
          position: 'absolute',
          top: isMobile ? 'calc(10px + env(safe-area-inset-top))' : '20px',
          right: isMobile ? '10px' : '100px', // 뒤로가기 버튼 옆에 배치
          zIndex: 1000,
          padding: isMobile ? '8px 12px' : '10px 18px',
          fontSize: isMobile ? '12px' : '14px',
          fontWeight: 'bold',
          color: '#ffffff',
          background: 'linear-gradient(135deg, rgba(255, 107, 71, 0.3) 0%, rgba(255, 138, 80, 0.4) 100%)',
          border: '2px solid rgba(255, 107, 71, 0.5)',
          borderRadius: '40px',
          cursor: 'pointer',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(255, 107, 71, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
          letterSpacing: '0.5px',
          textShadow: '0 0 10px rgba(255, 107, 71, 0.5)',
          minHeight: isMobile ? '44px' : 'auto', // 터치 친화적 크기
        }}
        onMouseEnter={(e) => {
          if (!isMobile) {
            e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)'
            e.currentTarget.style.boxShadow = '0 12px 40px rgba(255, 107, 71, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 107, 71, 0.4) 0%, rgba(255, 138, 80, 0.5) 100%)'
          }
        }}
        onMouseLeave={(e) => {
          if (!isMobile) {
            e.currentTarget.style.transform = 'translateY(0) scale(1)'
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(255, 107, 71, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 107, 71, 0.3) 0%, rgba(255, 138, 80, 0.4) 100%)'
          }
        }}
      >
        {isMobile ? '정보' : '열섬현상 정보'}
      </button>

      {/* 교육 팝업 - 열섬현상 설명 */}
      {showEducationPopup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.8)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: isMobile ? '20px' : '40px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(20, 20, 40, 0.95) 0%, rgba(40, 20, 20, 0.95) 100%)',
            borderRadius: '20px',
            padding: isMobile ? '20px' : '30px',
            maxWidth: isMobile ? '100%' : '800px',
            maxHeight: '90vh',
            overflow: 'auto',
            backdropFilter: 'blur(20px)',
            border: '2px solid rgba(255, 69, 0, 0.4)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
            color: 'white'
          }}>
            {/* 제목 */}
            <h1 style={{
              fontSize: isMobile ? '24px' : '32px',
              fontWeight: 'bold',
              color: '#ff6b47',
              textAlign: 'center',
              margin: '0 0 20px 0',
              textShadow: '0 0 20px rgba(255, 107, 71, 0.8)'
            }}>
              도시 열섬 현상
            </h1>

            {/* 현상 설명 */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              padding: isMobile ? '15px' : '20px',
              borderRadius: '15px',
              marginBottom: '20px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <h3 style={{ color: '#ffaa44', marginBottom: '10px', fontSize: isMobile ? '16px' : '18px' }}>
                현상 정의
              </h3>
              <p style={{ 
                lineHeight: '1.6', 
                fontSize: isMobile ? '14px' : '16px',
                color: 'rgba(255, 255, 255, 0.9)'
              }}>
                도시 열섬 현상은 <strong style={{color: '#ff6b47'}}>도시 지역이 주변 농촌보다 2-8°C 높은 온도</strong>를 보이는 현상입니다. 
                아스팔트, 콘크리트, 건물 등이 태양열을 흡수하여 발생하며, 특히 여름 밤에 가장 두드러집니다.
              </p>
            </div>

            {/* 원인 */}
            <div style={{
              background: 'rgba(255, 69, 0, 0.1)',
              padding: isMobile ? '15px' : '20px',
              borderRadius: '15px',
              marginBottom: '20px',
              border: '1px solid rgba(255, 69, 0, 0.3)'
            }}>
              <h3 style={{ color: '#ff6b47', marginBottom: '10px', fontSize: isMobile ? '16px' : '18px' }}>
                주요 원인
              </h3>
              <ul style={{ 
                paddingLeft: '20px', 
                lineHeight: '1.6',
                fontSize: isMobile ? '14px' : '16px',
                color: 'rgba(255, 255, 255, 0.9)'
              }}>
                <li><strong>지표면 변화:</strong> 녹지가 아스팔트와 콘크리트로 대체</li>
                <li><strong>건물 밀집:</strong> 빌딩들이 태양광 반사 면적 증가 (계곡 효과)</li>
                <li><strong>녹지 부족:</strong> 증발산을 통한 자연 냉각 효과 감소</li>
                <li><strong>인공 열 발생:</strong> 에어컨, 자동차, 공장 등의 열 방출</li>
                <li><strong>대기 오염:</strong> 스모그가 열 순환을 방해</li>
              </ul>
            </div>

            {/* 해결 기술들 */}
            <div style={{
              background: 'rgba(0, 255, 136, 0.1)',
              padding: isMobile ? '15px' : '20px',
              borderRadius: '15px',
              marginBottom: '20px',
              border: '1px solid rgba(0, 255, 136, 0.3)'
            }}>
              <h3 style={{ color: '#00ff88', marginBottom: '15px', fontSize: isMobile ? '16px' : '18px' }}>
                혁신적인 해결 기술들
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {/* 쿨루프 기술 - 개발중 */}
                <div style={{
                  background: 'rgba(100, 100, 100, 0.3)',
                  padding: '15px',
                  borderRadius: '10px',
                  border: '1px solid rgba(150, 150, 150, 0.3)',
                  opacity: 0.6,
                  position: 'relative'
                }}>
                  <h4 style={{ color: '#aaaaaa', marginBottom: '8px', fontSize: isMobile ? '14px' : '16px' }}>
                    쿨루프 (Cool Roof) 🔒
                  </h4>
                  <p style={{ fontSize: isMobile ? '12px' : '14px', color: 'rgba(170, 170, 170, 0.8)', lineHeight: '1.4' }}>
                    태양광의 75% 이상을 반사하는 특수 소재로 건물 온도를 크게 낮춤
                  </p>
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    right: '15px',
                    transform: 'translateY(-50%)',
                    background: 'rgba(255, 200, 0, 0.8)',
                    color: '#000',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '10px',
                    fontWeight: 'bold'
                  }}>
                    개발중
                  </div>
                </div>

                {/* 차열페인트 - 체험 가능 */}
                <div 
                  onClick={() => setSelectedTechnology('heatpaint')}
                  style={{
                    background: selectedTechnology === 'heatpaint' 
                      ? 'rgba(0, 255, 136, 0.2)' 
                      : 'rgba(255, 255, 255, 0.05)',
                    padding: '15px',
                    borderRadius: '10px',
                    border: selectedTechnology === 'heatpaint' 
                      ? '2px solid rgba(0, 255, 136, 0.8)' 
                      : '1px solid rgba(255, 255, 255, 0.1)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    position: 'relative'
                  }}
                >
                  <h4 style={{ 
                    color: selectedTechnology === 'heatpaint' ? '#00ff88' : '#88ddff', 
                    marginBottom: '8px', 
                    fontSize: isMobile ? '14px' : '16px' 
                  }}>
                    차열페인트 ⭐
                  </h4>
                  <p style={{ 
                    fontSize: isMobile ? '12px' : '14px', 
                    color: 'rgba(255, 255, 255, 0.9)', 
                    lineHeight: '1.4',
                    marginBottom: '8px'
                  }}>
                    특수 반사 안료가 태양열을 반사하여 표면온도를 크게 낮추는 혁신적인 페인트입니다. 
                    기존 아스팔트 대비 <strong style={{color: '#00ff88'}}>최대 15°C 낮은 표면온도</strong>를 유지하며, 
                    도시 열섬현상 완화에 탁월한 효과를 보입니다.
                  </p>
                  <div style={{
                    background: 'rgba(0, 255, 136, 0.2)',
                    padding: '8px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#00ff88',
                    fontWeight: 'bold'
                  }}>
                    🌡️ 주요 효과: 표면온도 15°C 감소 | 태양열 반사 80% | 에너지 절약 25%
                  </div>
                  {selectedTechnology === 'heatpaint' && (
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      background: 'rgba(0, 255, 136, 0.8)',
                      color: '#000',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '10px',
                      fontWeight: 'bold'
                    }}>
                      선택됨
                    </div>
                  )}
                </div>

                {/* 수직 정원 - 개발중 */}
                <div style={{
                  background: 'rgba(100, 100, 100, 0.3)',
                  padding: '15px',
                  borderRadius: '10px',
                  border: '1px solid rgba(150, 150, 150, 0.3)',
                  opacity: 0.6,
                  position: 'relative'
                }}>
                  <h4 style={{ color: '#aaaaaa', marginBottom: '8px', fontSize: isMobile ? '14px' : '16px' }}>
                    수직 정원 & 그린루프 🔒
                  </h4>
                  <p style={{ fontSize: isMobile ? '12px' : '14px', color: 'rgba(170, 170, 170, 0.8)', lineHeight: '1.4' }}>
                    건물 벽면과 옥상 녹화로 자연 단열재 역할 및 공기 정화
                  </p>
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    right: '15px',
                    transform: 'translateY(-50%)',
                    background: 'rgba(255, 200, 0, 0.8)',
                    color: '#000',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '10px',
                    fontWeight: 'bold'
                  }}>
                    개발중
                  </div>
                </div>

                {/* 스마트 냉각 시스템 - 개발중 */}
                <div style={{
                  background: 'rgba(100, 100, 100, 0.3)',
                  padding: '15px',
                  borderRadius: '10px',
                  border: '1px solid rgba(150, 150, 150, 0.3)',
                  opacity: 0.6,
                  position: 'relative'
                }}>
                  <h4 style={{ color: '#aaaaaa', marginBottom: '8px', fontSize: isMobile ? '14px' : '16px' }}>
                    스마트 냉각 시스템 🔒
                  </h4>
                  <p style={{ fontSize: isMobile ? '12px' : '14px', color: 'rgba(170, 170, 170, 0.8)', lineHeight: '1.4' }}>
                    AI 기반 물 분사, 지하수 활용한 자동 냉각 시스템
                  </p>
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    right: '15px',
                    transform: 'translateY(-50%)',
                    background: 'rgba(255, 200, 0, 0.8)',
                    color: '#000',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '10px',
                    fontWeight: 'bold'
                  }}>
                    개발중
                  </div>
                </div>
              </div>
            </div>

            {/* 탐험 시작 버튼 */}
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              {selectedTechnology === 'heatpaint' ? (
                <button
                  onClick={() => setShowEducationPopup(false)}
                  style={{
                    background: 'linear-gradient(135deg, #00ff88 0%, #00cc66 100%)',
                    color: '#000',
                    border: 'none',
                    padding: isMobile ? '15px 30px' : '18px 40px',
                    borderRadius: '50px',
                    fontSize: isMobile ? '16px' : '18px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: '0 8px 25px rgba(0, 255, 136, 0.4)',
                    transition: 'all 0.3s ease',
                    textShadow: '0 0 10px rgba(255, 255, 255, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    if (!isMobile) {
                      e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)'
                      e.currentTarget.style.boxShadow = '0 12px 35px rgba(0, 255, 136, 0.6)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isMobile) {
                      e.currentTarget.style.transform = 'translateY(0) scale(1)'
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 255, 136, 0.4)'
                    }
                  }}
                >
                  차열페인트 체험 시작
                </button>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: isMobile ? '14px' : '16px',
                    marginBottom: '10px'
                  }}>
                    체험할 기술을 선택해주세요
                  </div>
                  <button
                    disabled
                    style={{
                      background: 'rgba(100, 100, 100, 0.5)',
                      color: 'rgba(255, 255, 255, 0.4)',
                      border: 'none',
                      padding: isMobile ? '15px 30px' : '18px 40px',
                      borderRadius: '50px',
                      fontSize: isMobile ? '16px' : '18px',
                      fontWeight: 'bold',
                      cursor: 'not-allowed'
                    }}
                  >
                    체험 시작
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 온도계 UI - 화면 왼쪽 가운데 */}
      <div style={{
        position: 'fixed',
        left: isMobile ? '15px' : '25px',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: 'rgba(0, 0, 0, 0.7)',
        padding: isMobile ? '15px 8px' : '20px 12px',
        borderRadius: '20px',
        backdropFilter: 'blur(15px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
      }}>
        {/* 온도계 제목 */}
        <div style={{
          fontSize: isMobile ? '10px' : '12px',
          color: 'rgba(255, 255, 255, 0.8)',
          marginBottom: '8px',
          fontWeight: 'bold',
          letterSpacing: '0.5px'
        }}>
          도심 온도
        </div>
        
        {/* 온도계 본체 */}
        <div style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '10px'
        }}>
          {/* 온도계 막대 */}
          <div style={{
            position: 'relative',
            width: isMobile ? '12px' : '16px',
            height: isMobile ? '120px' : '150px',
            background: 'linear-gradient(to top, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
            borderRadius: '8px 8px 0 0', // 상단만 둥글게
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderBottom: 'none', // 하단 경계 제거
            overflow: 'hidden',
            zIndex: 2
          }}>
            {/* 온도 표시 바 - 동적 계산 */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              width: '100%',
              height: `${Math.max(10, Math.min(100, ((animatedTemperature - 15) / (50 - 15)) * 100))}%`, // 15-50°C 범위로 정규화
              background: animatedTemperature > 35 
                ? 'linear-gradient(to top, #ff4444 0%, #ff6b35 40%, #ffa500 80%, #ffff00 100%)'
                : animatedTemperature > 30
                ? 'linear-gradient(to top, #ff6b35 0%, #ffa500 50%, #ffff00 100%)'
                : 'linear-gradient(to top, #00ff88 0%, #44ff44 50%, #88ff00 100%)', // 정상 온도 시 녹색
              borderRadius: '4px 4px 0 0',
              animation: animatedTemperature > normalTemperature ? 'heatPulse 2s ease-in-out infinite' : 'none',
              boxShadow: 'inset 0 0 10px rgba(255, 255, 255, 0.3)',
              transition: 'all 0.5s ease-out'
            }} />
            
            {/* 온도계 눈금 */}
            {[0, 25, 50, 75, 100].map((position, index) => (
              <div key={index} style={{
                position: 'absolute',
                right: '-8px',
                bottom: `${position}%`,
                width: '4px',
                height: '1px',
                background: 'rgba(255, 255, 255, 0.6)',
                fontSize: isMobile ? '8px' : '9px',
                color: 'rgba(255, 255, 255, 0.6)',
              }} />
            ))}
          </div>
          
          {/* 온도계 구부 (막대와 연결) - 동적 색상 */}
          <div style={{
            width: isMobile ? '20px' : '24px',
            height: isMobile ? '20px' : '24px',
            borderRadius: '50%',
            background: animatedTemperature > 35 
              ? 'linear-gradient(135deg, #ff4444 0%, #ff6b35 100%)'
              : animatedTemperature > 30
              ? 'linear-gradient(135deg, #ff6b35 0%, #ffa500 100%)'
              : 'linear-gradient(135deg, #00ff88 0%, #44ff44 100%)', // 정상 온도 시 녹색
            border: '2px solid rgba(255, 255, 255, 0.3)',
            marginTop: '-2px',
            boxShadow: animatedTemperature > normalTemperature 
              ? '0 0 15px rgba(255, 68, 68, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.3)'
              : '0 0 15px rgba(0, 255, 136, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.3)',
            animation: animatedTemperature > normalTemperature ? 'tempPulse 2s ease-in-out infinite' : 'none',
            zIndex: 1,
            transition: 'all 0.5s ease-out'
          }} />
        </div>
        
        {/* 온도 수치 - 동적 업데이트 */}
        <div style={{
          fontSize: isMobile ? '16px' : '20px',
          fontWeight: 'bold',
          color: animatedTemperature > normalTemperature ? '#ff6b35' : '#00ff88',
          textShadow: animatedTemperature > normalTemperature 
            ? '0 0 10px rgba(255, 107, 53, 0.8)' 
            : '0 0 10px rgba(0, 255, 136, 0.8)',
          marginBottom: '4px',
          transition: 'all 0.5s ease-out'
        }}>
          {Math.round(animatedTemperature)}°C
        </div>
        
        {/* 온도 변화 표시 - 동적 */}
        <div style={{
          fontSize: isMobile ? '10px' : '12px',
          color: temperatureChange < 0 ? '#00ff88' : '#ffff99', // 감소시 녹색, 증가시 노란색
          fontWeight: 'bold',
          textShadow: temperatureChange < 0 
            ? '0 0 8px rgba(0, 255, 136, 0.8)' 
            : '0 0 8px rgba(255, 255, 153, 0.8)',
          display: 'flex',
          alignItems: 'center',
          gap: '2px',
          opacity: showTemperatureAnimation ? 1 : 0.7,
          transform: showTemperatureAnimation ? 'scale(1.1)' : 'scale(1)',
          transition: 'all 0.3s ease-out'
        }}>
          <span style={{ fontSize: isMobile ? '12px' : '14px' }}>
            {temperatureChange < 0 ? '↓' : '↑'}
          </span>
          {temperatureChange < 0 ? temperatureChange : `+${temperatureChange}`}°C
        </div>
        
        {/* 목표 달성 메시지 */}
        {animatedTemperature <= normalTemperature && (
          <div style={{
            fontSize: isMobile ? '8px' : '10px',
            color: '#00ff88',
            fontWeight: 'bold',
            textAlign: 'center',
            marginTop: '5px',
            textShadow: '0 0 8px rgba(0, 255, 136, 0.8)',
            animation: 'pulse 2s ease-in-out infinite'
          }}>
            🎉 정상 온도 달성!
          </div>
        )}
        
        {/* 플로팅 온도 변화 애니메이션 */}
        {showTemperatureAnimation && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '120%',
            transform: 'translateY(-50%)',
            fontSize: isMobile ? '14px' : '16px',
            fontWeight: 'bold',
            color: temperatureChange < 0 ? '#00ff88' : '#ff6b35',
            textShadow: temperatureChange < 0 
              ? '0 0 10px rgba(0, 255, 136, 1)' 
              : '0 0 10px rgba(255, 107, 53, 1)',
            animation: 'floatUp 3s ease-out forwards',
            zIndex: 1002,
            pointerEvents: 'none'
          }}>
            {temperatureChange < 0 ? temperatureChange : `+${temperatureChange}`}°C
          </div>
        )}
      </div>

      {/* 목표 온도 달성 시 전체 화면 축하 메시지 */}
      {animatedTemperature <= normalTemperature && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 255, 136, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          pointerEvents: 'none',
          animation: 'successPulse 3s ease-in-out infinite'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.95) 0%, rgba(0, 200, 100, 0.9) 100%)',
            color: 'white',
            padding: isMobile ? '20px' : '30px',
            borderRadius: '20px',
            textAlign: 'center',
            fontSize: isMobile ? '18px' : '24px',
            fontWeight: 'bold',
            textShadow: '0 0 15px rgba(255, 255, 255, 0.8)',
            boxShadow: '0 15px 50px rgba(0, 255, 136, 0.6)',
            border: '3px solid rgba(255, 255, 255, 0.5)',
            backdropFilter: 'blur(20px)',
            maxWidth: isMobile ? '85%' : '500px'
          }}>
            🎉🌡️ 미션 완료! 🌡️🎉<br/>
            <span style={{ fontSize: isMobile ? '14px' : '18px', color: '#e6ffe6' }}>
              도시 온도를 정상 수준({normalTemperature}°C)까지 낮췄습니다!
            </span><br/>
            <span style={{ fontSize: isMobile ? '12px' : '16px', color: '#ccffcc' }}>
              차열페인트로 열섬현상을 완화시켰어요! 🏆
            </span>
          </div>
        </div>
      )}

      {/* 경계 경고 UI - 반응형 */}
      {showBoundaryWarning && (
        <div 
          className={isMobile ? 'boundary-warning-mobile' : ''}
          style={{
          position: 'fixed',
          top: isMobile ? 'auto' : '50%',
          bottom: isMobile ? 'calc(160px + env(safe-area-inset-bottom))' : 'auto',
          left: isMobile ? '10px' : '50%',
          right: isMobile ? '10px' : 'auto',
          transform: isMobile ? 'none' : 'translate(-50%, -50%)',
          color: '#ff4444',
          fontSize: isMobile ? '16px' : '20px',
          fontWeight: 'bold',
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(255, 0, 0, 0.8) 0%, rgba(255, 100, 0, 0.7) 100%)',
          padding: isMobile ? '15px 20px' : '20px 30px',
          borderRadius: '15px',
          zIndex: 1001,
          backdropFilter: 'blur(20px)',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 8px 32px rgba(255, 0, 0, 0.5)',
          textShadow: '0 0 10px rgba(255, 255, 255, 0.8)',
          animation: 'pulse 1s ease-in-out infinite'
        }}>
          ⚠️ {isMobile ? '맵 경계 도달!' : '맵 경계에 도달했습니다!'} ⚠️<br/>
          <span style={{ fontSize: isMobile ? '14px' : '16px', color: '#ffcccc' }}>
            {isMobile ? '곧 시작점으로 이동' : '곧 시작점으로 돌아갑니다.'}
          </span>
        </div>
      )}

      {/* 클릭/터치 안내 UI - 반응형 디자인 */}
      {!isLocked && (
        <>
          <div style={{
            position: 'fixed',
            top: isMobile ? '40%' : '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'white',
            fontSize: isMobile ? '14px' : '16px',
            fontWeight: 'bold',
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(20, 20, 40, 0.6) 100%)',
            padding: isMobile ? '16px 24px' : '20px 30px',
            borderRadius: '20px',
            zIndex: 1000,
            pointerEvents: 'none',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 6px 24px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            textShadow: '0 0 20px rgba(255, 255, 255, 0.8)',
            animation: 'instructionPulse 2s ease-in-out infinite',
            maxWidth: isMobile ? '90%' : 'auto'
          }}>
            <div style={{
              color: '#00ff88',
              fontSize: isMobile ? '16px' : '18px',
              marginBottom: '12px',
              textShadow: '0 0 15px rgba(0, 255, 136, 0.8)'
            }}>
              {isMobile ? '🎮 1인칭 모드 활성화됨!' : '화면을 클릭하여 1인칭 모드로 진입하세요'}
            </div>
            <div style={{ 
              fontSize: isMobile ? '12px' : '14px', 
              color: 'rgba(255, 255, 255, 0.8)',
              lineHeight: '1.4'
            }}>
              {isMobile ? (
                <>
                  <span style={{color: '#74b9ff'}}>👆 화면 드래그</span>: 시점 조작<br/>
                  <span style={{color: '#fd79a8'}}>🕹️ 가상패드</span>: 이동 | 
                  <span style={{color: '#fdcb6e'}}> 🔘 버튼</span>: 점프
                </>
              ) : (
                <>
                  <span style={{color: '#74b9ff'}}>WASD</span>: 이동 | 
                  <span style={{color: '#fd79a8'}}> 스페이스</span>: 점프 | 
                  <span style={{color: '#fdcb6e'}}> 마우스</span>: 시점 이동
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* 3D Canvas - 반응형 최적화 */}
      <Canvas
        style={{ width: '100vw', height: '100vh' }}
        shadows={!isMobile ? {
          type: THREE.PCFSoftShadowMap,
        } : false} // 모바일에서 그림자 비활성화
        gl={{
          outputColorSpace: THREE.LinearSRGBColorSpace,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.6,
          antialias: !isMobile, // 모바일에서 안티앨리어싱 비활성화
          powerPreference: isMobile ? "low-power" : "high-performance"
        }}
        dpr={isMobile ? [1, 1.5] : [1, 2]} // 모바일에서 해상도 조정
        performance={{ min: isMobile ? 0.3 : 0.5 }} // 모바일에서 더 적극적인 성능 조정
        camera={{
          position: [0, 5, 10],
          fov: isMobile ? 85 : 75, // 모바일에서 더 넓은 시야
          near: 0.1,
          far: isMobile ? 300 : 1000, // 모바일에서 렌더 거리 더 단축
        }}
        onCreated={({ gl }) => {
          // 데스크톱에서만 클릭 이벤트 처리  
          if (!isMobile) {
            gl.domElement.addEventListener('click', () => {
              if (!isLocked) {
                gl.domElement.requestPointerLock()
              }
            })
            
            // Pointer Lock 상태 변경 감지
            const handlePointerLockChange = () => {
              const locked = document.pointerLockElement === gl.domElement
              setIsLocked(locked)
            }
            
            document.addEventListener('pointerlockchange', handlePointerLockChange)
          }
        }}
      >
        <Physics
          gravity={[0, -30, 0]}
          defaultContactMaterial={{
            friction: 0.4,
            restitution: 0.1,
          }}
          stepSize={isMobile ? 1/30 : 1/60} // 모바일에서 물리 계산 빈도 감소
          maxSubSteps={isMobile ? 3 : 5} // 모바일에서 반복 계산 감소
        >
                    {/* 뿌옇고 탁한 스모그 조명 설정 - 열섬 현상용 */}
          <ambientLight intensity={0.3} color="#ddd8aa" />
          
          {/* 스모그에 가려진 약한 태양 조명 */}
          <directionalLight
            position={[50, 50, 50]}
            intensity={0.9}
            castShadow
            shadow-mapSize-width={4096}
            shadow-mapSize-height={4096}
            shadow-camera-far={300}
            shadow-camera-left={-80}
            shadow-camera-right={80}
            shadow-camera-top={80}
            shadow-camera-bottom={-80}
            shadow-bias={-0.001}
            shadow-normalBias={0.02}
            shadow-radius={1}
            color="#ddcc88"
          />
          
          {/* 뿌연 대기 중의 산란광 */}
          <pointLight
            position={[0, 20, 0]}
            intensity={0.4}
            color="#ccaa77"
            distance={100}
            decay={1}
          />
          
          {/* 탁하고 뿌연 하늘 조명 */}
          <hemisphereLight
            args={["#bbaa88", "#ddcc99", 0.4]}
          />
          
          {/* 추가 확산된 조명 */}
          <directionalLight
            position={[30, 40, 30]}
            intensity={0.3}
            color="#ccbb77"
          />
          
          {/* 뿌옇고 탁한 스모그 하늘 - 열섬 현상 효과 */}
          <Sky
            distance={450000}
            sunPosition={[1, 0.4, 0]}
            inclination={0.4}
            azimuth={0.25}
            turbidity={25}
            rayleigh={1.2}
            mieCoefficient={0.03}
            mieDirectionalG={0.95}
          />

          {/* 도시 모델 - 그림자 강화 */}
          <group ref={worldRef}>
            {/* 밝은 아스팔트 바닥 */}
            <mesh 
              position={[0, 0, 0]} 
              rotation={[-Math.PI / 2, 0, 0]} 
              receiveShadow
            >
              <planeGeometry args={[200, 200]} />
              <meshLambertMaterial 
                color="#888888" 
                transparent 
                opacity={0.9}
              />
            </mesh>
            
            <group>
              <CityWithPhysics
                position={[0, 0, 0]}
                scale={[1, 1, 1]}
              />
            </group>
            
            {/* 뜨거운 아스팔트에서 올라오는 열기 파티클 */}
            <HeatWaves />
            
            {/* 차열페인트가 칠해진 영역들 */}
            {paintedAreas.map((area, index) => (
              <group key={index}>
                {/* 메인 페인트 영역 - 네모 모양 */}
                <mesh 
                  position={[area.x, 0.02, area.z]} 
                  rotation={[-Math.PI / 2, 0, 0]}
                >
                  <planeGeometry args={[area.radius * 2, area.radius * 2]} />
                  <meshStandardMaterial 
                    color="#ffffff" 
                    transparent 
                    opacity={0.95}
                    emissive="#f0f8ff"
                    emissiveIntensity={0.3}
                    roughness={0.1}
                    metalness={0.1}
                  />
                </mesh>
                
                {/* 발광 효과를 위한 추가 레이어 - 네모 모양 */}
                <mesh 
                  position={[area.x, 0.03, area.z]} 
                  rotation={[-Math.PI / 2, 0, 0]}
                >
                  <planeGeometry args={[area.radius * 2.4, area.radius * 2.4]} />
                  <meshBasicMaterial 
                    color="#f8f8ff" 
                    transparent 
                    opacity={0.2}
                  />
                </mesh>
              </group>
            ))}
          </group>

          {/* 플레이어 */}
          <Player 
            position={[0, 3, 0]} 
            onPositionChange={handlePlayerPositionChange}
            isMobile={isMobile}
            virtualJoystickInput={joystickInput}
            jumpPressed={isJumping}
          />

          {/* 모바일 카메라 컨트롤 */}
          <MobileCameraControls isMobile={isMobile} isLocked={isLocked} />

          {/* 환경 - 뜨겁고 오염된 분위기 */}
          <Environment preset="city" />
        </Physics>
      </Canvas>

      {/* 상호작용 힌트 UI */}
      {showInteractionHint && (
        <div style={{
          position: 'fixed',
          top: isMobile ? 'calc(100px + env(safe-area-inset-top))' : '120px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.9) 0%, rgba(0, 200, 100, 0.8) 100%)',
          color: 'white',
          padding: isMobile ? '12px 20px' : '15px 25px',
          borderRadius: '15px',
          fontSize: isMobile ? '14px' : '16px',
          fontWeight: 'bold',
          textAlign: 'center',
          zIndex: 1002,
          backdropFilter: 'blur(15px)',
          border: '2px solid rgba(255, 255, 255, 0.4)',
          boxShadow: '0 8px 32px rgba(0, 255, 136, 0.6)',
          textShadow: '0 0 10px rgba(255, 255, 255, 0.8)',
          animation: 'fadeIn 0.5s ease-in-out',
          maxWidth: isMobile ? '85%' : '400px'
        }}>
          🎨 차열페인트를 칠했습니다! 🎨<br/>
          <span style={{ fontSize: isMobile ? '11px' : '13px', color: '#e6ffe6' }}>
            🌡️ 도시 온도가 {Math.abs(temperatureChange)}°C 감소했습니다!
          </span><br/>
          <span style={{ fontSize: isMobile ? '10px' : '12px', color: '#ccffcc' }}>
            {isMobile ? '🎨 버튼으로 더 칠하기' : 'F키를 눌러 더 많은 곳에 칠하세요'}
          </span>
        </div>
      )}

      {/* 차열페인트 체험 안내 UI - 체험 모드일 때만 표시 */}
      {isInteractionMode && isLocked && !showEducationPopup && (
        <div style={{
          position: 'fixed',
          bottom: isMobile ? 'calc(180px + env(safe-area-inset-bottom))' : '100px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0, 0, 0, 0.8)',
          color: '#00ff88',
          padding: isMobile ? '10px 15px' : '12px 20px',
          borderRadius: '10px',
          fontSize: isMobile ? '12px' : '14px',
          fontWeight: 'bold',
          textAlign: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(0, 255, 136, 0.5)',
          boxShadow: '0 4px 20px rgba(0, 255, 136, 0.3)',
          maxWidth: isMobile ? '85%' : '300px'
        }}>
          🎨 {isMobile ? '바닥을 터치하여 차열페인트 칠하기' : 'F키를 눌러 바닥에 차열페인트를 칠하세요'}
          <br/>
          <small style={{ color: '#88ffaa', fontSize: '10px' }}>
            칠해진 영역: {paintedAreas.length}개
          </small>
        </div>
      )}

      {/* 디버그 정보 - 개발용 (필요시 주석 해제) */}
      {false && isInteractionMode && (
        <div style={{
          position: 'fixed',
          top: '10px',
          left: '10px',
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '10px',
          borderRadius: '5px',
          fontSize: '12px',
          zIndex: 1001,
          fontFamily: 'monospace'
        }}>
          <div>플레이어 위치: {playerPosition[0].toFixed(1)}, {playerPosition[1].toFixed(1)}, {playerPosition[2].toFixed(1)}</div>
          <div>페인트 영역 수: {paintedAreas.length}</div>
          <div>선택된 기술: {selectedTechnology}</div>
          <div>체험 모드: {isInteractionMode ? 'ON' : 'OFF'}</div>
          <div>잠금 상태: {isLocked ? 'ON' : 'OFF'}</div>
          {paintedAreas.map((area, i) => (
            <div key={i}>영역 {i}: ({area.x}, {area.z})</div>
          ))}
        </div>
      )}

      {/* 모바일 가상 조이스틱 UI */}
      {isMobile && isLocked && (
        <>
          {/* 가상 조이스틱 */}
          <div style={{
            position: 'fixed',
            bottom: 'calc(20px + env(safe-area-inset-bottom))',
            left: '20px',
            zIndex: 1000,
            pointerEvents: 'auto'
          }}>
            <VirtualJoystick
              onMove={(x, y) => setJoystickInput({ x, y })}
              size={120}
              maxDistance={50}
            />
          </div>

          {/* 점프 버튼 */}
          <div style={{
            position: 'fixed',
            bottom: 'calc(20px + env(safe-area-inset-bottom))',
            right: '20px',
            zIndex: 1000,
            pointerEvents: 'auto'
          }}>
            <JumpButton
              onJump={() => {
                setIsJumping(true)
                setTimeout(() => setIsJumping(false), 200) // 200ms 후 해제
              }}
              size={80}
            />
          </div>

          {/* 차열페인트 버튼 - 체험 모드일 때만 표시 */}
          {isInteractionMode && (
            <div style={{
              position: 'fixed',
              bottom: 'calc(120px + env(safe-area-inset-bottom))',
              right: '20px',
              zIndex: 1000,
              pointerEvents: 'auto'
            }}>
              <div
                onTouchStart={(e) => {
                  e.preventDefault()
                  // 모바일에서 차열페인트 칠하기
                  const newPaintArea = { 
                    x: Math.round(playerPosition[0]), 
                    z: Math.round(playerPosition[2]), 
                    radius: 2 
                  }
                  
                  const isDuplicate = paintedAreas.some(area => 
                    Math.abs(area.x - newPaintArea.x) < 1.5 && Math.abs(area.z - newPaintArea.z) < 1.5
                  )
                  
                  if (!isDuplicate) {
                    setPaintedAreas(prev => [...prev, newPaintArea])
                    setShowInteractionHint(true)
                    setTimeout(() => setShowInteractionHint(false), 2000)
                    
                    // 온도 감소 효과 (모바일에서도 동일하게 적용)
                    const tempDecrease = Math.floor(Math.random() * 3) + 1 // 1-3도 랜덤
                    const newTemperature = Math.max(normalTemperature, targetTemperature - tempDecrease)
                    
                    setTemperatureChange(-tempDecrease)
                    setTargetTemperature(newTemperature)
                    setShowTemperatureAnimation(true)
                    
                    // 애니메이션 후 숨기기
                    setTimeout(() => setShowTemperatureAnimation(false), 3000)
                  } else {
                    // 중복 위치일 때 힌트 표시
                    setShowInteractionHint(true)
                    setTimeout(() => setShowInteractionHint(false), 1000)
                  }
                }}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(77, 166, 255, 0.9) 0%, rgba(38, 143, 255, 0.7) 100%)',
                  border: '3px solid rgba(255, 255, 255, 0.6)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 4px 16px rgba(77, 166, 255, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.3)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  userSelect: 'none',
                  touchAction: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.1s ease'
                }}
              >
                <span style={{
                  fontSize: 20,
                  fontWeight: 'bold',
                  color: 'white',
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
                  marginBottom: '2px'
                }}>
                  🎨
                </span>
                <span style={{
                  fontSize: 8,
                  fontWeight: 'bold',
                  color: 'white',
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
                  textAlign: 'center',
                  lineHeight: '1'
                }}>
                  온도↓
                </span>
              </div>
            </div>
          )}

          {/* 추가 모바일 안내 - 처음에만 잠깐 표시 */}
          {!isLocked && (
            <div style={{
              position: 'fixed',
              bottom: 'calc(160px + env(safe-area-inset-bottom))',
              left: '50%',
              transform: 'translateX(-50%)',
              color: 'white',
              fontSize: '12px',
              textAlign: 'center',
              background: 'rgba(0, 0, 0, 0.8)',
              padding: '8px 12px',
              borderRadius: '20px',
              zIndex: 999,
              maxWidth: '80%',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}>
              📱 좌측: 이동 | 우측: 점프
            </div>
          )}
        </>
      )}
    </div>
  )
}

// 지옥불 같은 열기 파티클 - 최적화된 버전
function HeatWaves() {
  const particlesRef = useRef<THREE.Points>(null)
  
  const particles = React.useMemo(() => {
    const count = 600
    const positions = new Float32Array(count * 3)
    const velocities = new Float32Array(count * 3)
    
    for (let i = 0; i < count; i++) {
      // 바닥과 건물 근처에서 집중적으로 시작
      positions[i * 3] = (Math.random() - 0.5) * 80
      positions[i * 3 + 1] = Math.random() * 1 // 더 낮은 시작점
      positions[i * 3 + 2] = (Math.random() - 0.5) * 80
      
      // 자연스러운 불규칙한 상승 속도
      velocities[i * 3] = (Math.random() - 0.5) * 0.3
      velocities[i * 3 + 1] = Math.random() * 0.8 + 0.1 // 더 다양한 상승속도
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.3
    }
    
    return { positions, velocities }
  }, [])

  React.useEffect(() => {
    let animationId: number
    const animate = () => {
      if (particlesRef.current) {
        const positions = particlesRef.current.geometry.attributes.position.array as Float32Array
        const time = Date.now() * 0.001
        
        for (let i = 0; i < positions.length; i += 3) {
          // 자연스러운 불규칙한 상승 - 각 파티클마다 다른 속도
          const particleIndex = i / 3
          const baseSpeed = 0.02 + Math.sin(time * 0.5 + particleIndex * 0.1) * 0.015
          positions[i + 1] += baseSpeed
          
          // 자연스러운 좌우 흔들림 - 열기의 자연스러운 움직임
          const wiggleX = Math.sin(time * 2 + particleIndex * 0.3) * 0.02
          const wiggleZ = Math.cos(time * 1.5 + particleIndex * 0.2) * 0.015
          positions[i] += wiggleX
          positions[i + 2] += wiggleZ
          
          // 높이에 따른 점진적 투명도 감소 효과를 위한 재생성
          const maxHeight = 15 + Math.sin(particleIndex * 0.1) * 5 // 다양한 최대 높이
          if (positions[i + 1] > maxHeight) {
            positions[i + 1] = 0
            positions[i] = (Math.random() - 0.5) * 80
            positions[i + 2] = (Math.random() - 0.5) * 80
          }
        }
        
        particlesRef.current.geometry.attributes.position.needsUpdate = true
      }
      animationId = requestAnimationFrame(animate)
    }
    animate()
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [])

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particles.positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.35}
        color="#ff1100"
        transparent
        opacity={0.7}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

// CSS 애니메이션을 위한 스타일 추가
const style = document.createElement('style')
if (!document.head.querySelector('#temperature-animations')) {
  style.id = 'temperature-animations'
  style.textContent = `
    @keyframes floatUp {
      0% {
        opacity: 1;
        transform: translateY(-50%) translateX(0);
      }
      50% {
        opacity: 0.8;
        transform: translateY(-80%) translateX(20px);
      }
      100% {
        opacity: 0;
        transform: translateY(-120%) translateX(40px);
      }
    }
    
    @keyframes heatPulse {
      0%, 100% {
        box-shadow: inset 0 0 10px rgba(255, 255, 255, 0.3);
      }
      50% {
        box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.5), 0 0 15px rgba(255, 68, 68, 0.8);
      }
    }
    
    @keyframes tempPulse {
      0%, 100% {
        transform: scale(1);
        box-shadow: 0 0 15px rgba(255, 68, 68, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.3);
      }
      50% {
        transform: scale(1.05);
        box-shadow: 0 0 25px rgba(255, 68, 68, 0.9), inset 0 2px 4px rgba(255, 255, 255, 0.3);
      }
    }
    
    @keyframes pulse {
      0%, 100% {
        opacity: 0.7;
        transform: scale(1);
      }
      50% {
        opacity: 1;
        transform: scale(1.05);
      }
    }
    
    @keyframes successPulse {
      0%, 100% {
        background: rgba(0, 255, 136, 0.05);
      }
      50% {
        background: rgba(0, 255, 136, 0.15);
      }
    }
  `
  document.head.appendChild(style)
}
