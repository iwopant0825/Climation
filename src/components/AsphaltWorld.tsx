import React, { useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/cannon'
import { Environment, Sky } from '@react-three/drei'
import { Player } from './Player'
import { CityWithPhysics } from './CityWithPhysics'
import { VirtualJoystick, JumpButton } from './VirtualJoystick'
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

  // 포인터 락 상태 감지
  React.useEffect(() => {
    const handlePointerLockChange = () => {
      setIsLocked(document.pointerLockElement !== null)
    }
    
    document.addEventListener('pointerlockchange', handlePointerLockChange)
    
    return () => {
      document.removeEventListener('pointerlockchange', handlePointerLockChange)
    }
  }, [])

  return (
    <>
      {/* 오버레이 제거로 더 밝게 */}

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

      {/* 온도 표시 - 반응형 디자인 */}
      <div style={{
        position: 'absolute',
        bottom: isMobile ? 'calc(140px + env(safe-area-inset-bottom))' : '20px', // 모바일에서 가상 조이스틱 공간 확보
        left: isMobile ? '50%' : '20px',
        transform: isMobile ? 'translateX(-50%)' : 'none',
        background: 'linear-gradient(135deg, rgba(255, 69, 0, 0.8) 0%, rgba(255, 140, 0, 0.9) 100%)',
        color: 'white',
        padding: isMobile ? '8px 14px' : '10px 18px',
        borderRadius: '40px',
        zIndex: 1000,
        fontSize: isMobile ? '13px' : '15px',
        fontWeight: 'bold',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 6px 24px rgba(255, 69, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        textShadow: '0 0 15px rgba(0, 0, 0, 0.3)',
        letterSpacing: '0.5px',
        animation: 'tempPulse 2s ease-in-out infinite',
        textAlign: 'center' as const,
      }}>
        {isMobile ? '🌡️ 38°C +5°C ↑' : '도심 온도: 38°C '}<span style={{color: '#ffff99', textShadow: '0 0 10px rgba(255, 255, 153, 0.8)'}}>{!isMobile && '+5°C ↑'}</span>
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
            {isMobile ? '화면을 터치하여 1인칭 모드 진입' : '화면을 클릭하여 1인칭 모드로 진입하세요'}
          </div>
          <div style={{ 
            fontSize: isMobile ? '12px' : '14px', 
            color: 'rgba(255, 255, 255, 0.8)',
            lineHeight: '1.4'
          }}>
            {isMobile ? (
              <>
                <span style={{color: '#74b9ff'}}>가상패드</span>: 이동 | 
                <span style={{color: '#fd79a8'}}> 점프버튼</span>: 점프 | 
                <span style={{color: '#fdcb6e'}}> 드래그</span>: 시점
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
        performance={{ min: 0.5 }}
        camera={{
          position: [0, 5, 10],
          fov: isMobile ? 85 : 75, // 모바일에서 더 넓은 시야
          near: 0.1,
          far: isMobile ? 500 : 1000, // 모바일에서 렌더 거리 단축
        }}
      >
        <Physics
          gravity={[0, -30, 0]}
          defaultContactMaterial={{
            friction: 0.4,
            restitution: 0.1,
          }}
        >
                    {/* 망가진 도시 느낌의 조명 설정 */}
          <ambientLight intensity={0.2} color="#ffddbb" />
          
          {/* 메인 태양 조명 - 망가진 느낌 */}
          <directionalLight
            position={[20, 15, 20]}
            intensity={0.8}
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
            color="#ffbb88"
          />
          
          {/* 오염된 대기 느낌의 조명 */}
          <pointLight
            position={[0, 5, 0]}
            intensity={0.5}
            color="#dd7744"
            distance={60}
            decay={2}
          />
          
          {/* 어두운 지면 조명 */}
          <hemisphereLight
            args={["#996644", "#442211", 0.3]}
          />
          
          {/* 망가진 도시 느낌의 보조 조명 */}
          <directionalLight
            position={[-15, 8, -15]}
            intensity={0.3}
            color="#cc8866"
          />
          
          {/* 어둡고 오염된 하늘 */}
          <Sky
            distance={450000}
            sunPosition={[0, 0.2, 1]}
            inclination={0.8}
            azimuth={0.25}
            turbidity={25}
            rayleigh={1.5}
            mieCoefficient={0.01}
            mieDirectionalG={0.85}
          />

          {/* 도시 모델 - 그림자 강화 */}
          <group ref={worldRef}>
            {/* 강화된 바닥 그림자 받기 */}
            <mesh 
              position={[0, 0, 0]} 
              rotation={[-Math.PI / 2, 0, 0]} 
              receiveShadow
            >
              <planeGeometry args={[200, 200]} />
              <meshLambertMaterial 
                color="#664422" 
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
            
            {/* 오염된 공기 파티클 */}
            <PollutionParticles />
          </group>

          {/* 플레이어 */}
          <Player 
            position={[0, 3, 0]} 
            onPositionChange={handlePlayerPositionChange}
            isMobile={isMobile}
            virtualJoystickInput={joystickInput}
            jumpPressed={isJumping}
          />

          {/* 환경 - 뜨겁고 오염된 분위기 */}
          <Environment preset="city" />
          
          {/* 전체적인 열기 효과를 위한 파티클 */}
          <HeatParticles />
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
    </>
  )
}

// 지옥불 같은 열기 파티클 - 최적화된 버전
function HeatWaves() {
  const particlesRef = useRef<THREE.Points>(null)
  
  const particles = React.useMemo(() => {
    const count = 600 // 1200 -> 600으로 감소
    const positions = new Float32Array(count * 3)
    const velocities = new Float32Array(count * 3)
    
    for (let i = 0; i < count; i++) {
      // 바닥과 건물 근처에서 집중적으로 시작
      positions[i * 3] = (Math.random() - 0.5) * 80 // 90 -> 80으로 범위 감소
      positions[i * 3 + 1] = Math.random() * 2
      positions[i * 3 + 2] = (Math.random() - 0.5) * 80
      
      // 불규칙한 상승 속도
      velocities[i * 3] = (Math.random() - 0.5) * 0.6
      velocities[i * 3 + 1] = Math.random() * 1.0 + 0.2
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.6
    }
    
    return { positions, velocities }
  }, [])

  React.useEffect(() => {
    let animationId: number
    const animate = () => {
      if (particlesRef.current) {
        const positions = particlesRef.current.geometry.attributes.position.array as Float32Array
        const time = Date.now() * 0.0008 // 속도 조금 감소
        
        for (let i = 0; i < positions.length; i += 3) {
          // 더 효율적인 상승
          positions[i + 1] += 0.04
          
          // 최적화된 움직임 계산
          positions[i] += Math.sin(time + i * 0.05) * 0.015
          positions[i + 2] += Math.cos(time + i * 0.05) * 0.015
          
          // 재생성
          if (positions[i + 1] > 20) { // 25 -> 20으로 감소
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

// 독성 스모그 파티클 - 최적화된 버전
function PollutionParticles() {
  const particlesRef = useRef<THREE.Points>(null)
  
  const particles = React.useMemo(() => {
    const count = 400 // 800 -> 400으로 감소
    const positions = new Float32Array(count * 3)
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 120 // 150 -> 120으로 감소
      positions[i * 3 + 1] = Math.random() * 30 // 35 -> 30으로 감소
      positions[i * 3 + 2] = (Math.random() - 0.5) * 120
    }
    
    return positions
  }, [])

  React.useEffect(() => {
    let animationId: number
    const animate = () => {
      if (particlesRef.current) {
        particlesRef.current.rotation.y += 0.0008 // 0.001 -> 0.0008로 감소
        const positions = particlesRef.current.geometry.attributes.position.array as Float32Array
        const time = Date.now() * 0.0001 // 0.0002 -> 0.0001로 감소
        
        for (let i = 0; i < positions.length; i += 3) {
          // 최적화된 스모그 움직임
          positions[i] += Math.sin(time * 2 + i * 0.008) * 0.006
          positions[i + 1] += 0.006
          positions[i + 2] += Math.cos(time * 2 + i * 0.008) * 0.006
          
          // 순환
          if (positions[i + 1] > 30) { // 35 -> 30으로 감소
            positions[i + 1] = 0
            positions[i] = (Math.random() - 0.5) * 120
            positions[i + 2] = (Math.random() - 0.5) * 120
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
          args={[particles, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.6} // 1.0 -> 0.6으로 더 작게
        color="#332211"
        transparent
        opacity={0.4} // 0.6 -> 0.4로 더 투명하게
        blending={THREE.NormalBlending}
      />
    </points>
  )
}

// 강렬한 열기 파티클 - 최적화된 메인 효과
function HeatParticles() {
  const particlesRef = useRef<THREE.Points>(null)
  
  const particles = React.useMemo(() => {
    const count = 1000 // 2000 -> 1000으로 감소
    const positions = new Float32Array(count * 3)
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 150 // 200 -> 150으로 감소
      positions[i * 3 + 1] = Math.random() * 35 // 40 -> 35로 감소
      positions[i * 3 + 2] = (Math.random() - 0.5) * 150
    }
    
    return positions
  }, [])

  React.useEffect(() => {
    let animationId: number
    const animate = () => {
      if (particlesRef.current) {
        particlesRef.current.rotation.y += 0.002
        const positions = particlesRef.current.geometry.attributes.position.array as Float32Array
        const time = Date.now() * 0.0008 // 0.001 -> 0.0008로 감소
        
        for (let i = 1; i < positions.length; i += 3) {
          // 최적화된 상승과 회전
          positions[i] += 0.025 + Math.sin(time + i * 0.08) * 0.008
          
          // 재생성
          if (positions[i] > 35) { // 40 -> 35로 감소
            positions[i] = 0
            positions[i - 1] = (Math.random() - 0.5) * 150
            positions[i + 1] = (Math.random() - 0.5) * 150
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
          args={[particles, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.18} // 0.2 -> 0.18로 감소
        color="#ff3300"
        transparent
        opacity={0.6} // 0.7 -> 0.6으로 감소
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
