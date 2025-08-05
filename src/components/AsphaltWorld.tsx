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

  // 플레이어 위치 변경 핸들러
  const handlePlayerPositionChange = React.useCallback((position: [number, number, number]) => {
    const [x, , z] = position
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

      {/* 정보 패널 - 반응형 디자인 */}
      <div 
        className={isMobile ? 'info-panel-mobile' : isTablet ? 'info-panel-tablet' : ''}
        style={{
        position: 'absolute',
        top: isMobile ? 'calc(10px + env(safe-area-inset-top))' : '20px',
        right: isMobile ? '10px' : '20px',
        left: isMobile ? '10px' : 'auto',
        background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(20, 20, 40, 0.6) 100%)',
        color: 'white',
        padding: isMobile ? '12px' : '18px',
        borderRadius: '15px',
        maxWidth: isMobile ? 'none' : isTablet ? '320px' : '280px',
        zIndex: 1000,
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 69, 0, 0.3)',
        boxShadow: '0 6px 24px rgba(255, 69, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      }}>
        <h3 style={{ 
          margin: '0 0 12px 0', 
          color: '#ff6b47',
          fontSize: isMobile ? '14px' : '16px',
          fontWeight: 'bold',
          textShadow: '0 0 15px rgba(255, 107, 71, 0.6)',
          letterSpacing: '0.5px'
        }}>
          열섬 현상
        </h3>
        <p style={{ 
          margin: '0 0 12px 0', 
          fontSize: isMobile ? '12px' : '13px',
          lineHeight: '1.5',
          color: 'rgba(255, 255, 255, 0.9)'
        }}>
          {isMobile 
            ? '도시가 주변보다 뜨거워지는 현상입니다.'
            : '도시 지역이 주변 농촌보다 높은 온도를 보이는 현상으로, 아스팔트, 콘크리트, 건물 등이 태양열을 흡수하여 발생합니다.'
          }
        </p>
        <div style={{ 
          fontSize: isMobile ? '11px' : '12px', 
          color: '#00ff88',
          padding: '8px',
          background: 'rgba(0, 255, 136, 0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(0, 255, 136, 0.2)',
          textShadow: '0 0 10px rgba(0, 255, 136, 0.3)'
        }}>
          {isMobile 
            ? '해결책: 녹지, 쿨루프, 투수성 포장재'
            : '해결책: 녹지 확대, 쿨루프, 투수성 포장재, 건물 외벽 녹화'
          }
        </div>
      </div>

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
            {/* 온도 표시 바 (38°C = 76% 정도) */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              width: '100%',
              height: '76%', // 38°C 기준 (50°C 만점으로 가정)
              background: 'linear-gradient(to top, #ff4444 0%, #ff6b35 40%, #ffa500 80%, #ffff00 100%)',
              borderRadius: '4px 4px 0 0', // 상단만 둥글게
              animation: 'heatPulse 2s ease-in-out infinite',
              boxShadow: 'inset 0 0 10px rgba(255, 255, 255, 0.3)'
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
          
          {/* 온도계 구부 (막대와 연결) */}
          <div style={{
            width: isMobile ? '20px' : '24px',
            height: isMobile ? '20px' : '24px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #ff4444 0%, #ff6b35 100%)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            marginTop: '-2px', // 막대와 겹치도록
            boxShadow: '0 0 15px rgba(255, 68, 68, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.3)',
            animation: 'tempPulse 2s ease-in-out infinite',
            zIndex: 1
          }} />
        </div>
        
        {/* 온도 수치 */}
        <div style={{
          fontSize: isMobile ? '16px' : '20px',
          fontWeight: 'bold',
          color: '#ff6b35',
          textShadow: '0 0 10px rgba(255, 107, 53, 0.8)',
          marginBottom: '4px'
        }}>
          38°C
        </div>
        
        {/* 상승 표시 */}
        <div style={{
          fontSize: isMobile ? '10px' : '12px',
          color: '#ffff99',
          fontWeight: 'bold',
          textShadow: '0 0 8px rgba(255, 255, 153, 0.8)',
          display: 'flex',
          alignItems: 'center',
          gap: '2px'
        }}>
          <span style={{ fontSize: isMobile ? '12px' : '14px' }}>↑</span>
          +5°C
        </div>
      </div>

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
