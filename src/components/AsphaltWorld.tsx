import React, { useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/cannon'
import { Environment, Sky } from '@react-three/drei'
import { Player } from './Player'
import { CityWithPhysics } from './CityWithPhysics'
import * as THREE from 'three'

interface AsphaltWorldProps {
  onBackToEarth: () => void
}

export function AsphaltWorld({ onBackToEarth }: AsphaltWorldProps) {
  const worldRef = useRef<THREE.Group>(null)
  const [isLocked, setIsLocked] = React.useState(false)

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
      {/* 뒤로가기 버튼 - 세련된 디자인 */}
      <button
        onClick={onBackToEarth}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          zIndex: 1000,
          padding: '10px 18px',
          fontSize: '14px',
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
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)'
          e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 255, 136, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 255, 136, 0.3) 0%, rgba(0, 200, 100, 0.4) 100%)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)'
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 255, 136, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 255, 136, 0.2) 0%, rgba(0, 200, 100, 0.3) 100%)'
        }}
      >
        지구로 돌아가기
      </button>

      {/* 정보 패널 - 세련된 디자인 */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(20, 20, 40, 0.6) 100%)',
        color: 'white',
        padding: '18px',
        borderRadius: '15px',
        maxWidth: '280px',
        zIndex: 1000,
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 69, 0, 0.3)',
        boxShadow: '0 6px 24px rgba(255, 69, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      }}>
        <h3 style={{ 
          margin: '0 0 12px 0', 
          color: '#ff6b47',
          fontSize: '16px',
          fontWeight: 'bold',
          textShadow: '0 0 15px rgba(255, 107, 71, 0.6)',
          letterSpacing: '0.5px'
        }}>
          아스팔트 열섬 현상
        </h3>
        <p style={{ 
          margin: '0 0 12px 0', 
          fontSize: '13px',
          lineHeight: '1.5',
          color: 'rgba(255, 255, 255, 0.9)'
        }}>
          도시의 아스팔트와 콘크리트가 태양열을 흡수하여 주변보다 온도가 높아지는 현상입니다.
        </p>
        <div style={{ 
          fontSize: '12px', 
          color: '#00ff88',
          padding: '8px',
          background: 'rgba(0, 255, 136, 0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(0, 255, 136, 0.2)',
          textShadow: '0 0 10px rgba(0, 255, 136, 0.3)'
        }}>
          해결책: 녹지 확대, 쿨루프, 투수성 포장재 사용
        </div>
      </div>

      {/* 온도 표시 - 세련된 디자인 */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        background: 'linear-gradient(135deg, rgba(255, 69, 0, 0.8) 0%, rgba(255, 140, 0, 0.9) 100%)',
        color: 'white',
        padding: '10px 18px',
        borderRadius: '40px',
        zIndex: 1000,
        fontSize: '15px',
        fontWeight: 'bold',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 6px 24px rgba(255, 69, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        textShadow: '0 0 15px rgba(0, 0, 0, 0.3)',
        letterSpacing: '0.5px',
        animation: 'tempPulse 2s ease-in-out infinite'
      }}>
        도심 온도: 38°C <span style={{color: '#ffff99', textShadow: '0 0 10px rgba(255, 255, 153, 0.8)'}}>+5°C ↑</span>
      </div>

      {/* 클릭 안내 UI - 세련된 디자인 */}
      {!isLocked && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: 'white',
          fontSize: '16px',
          fontWeight: 'bold',
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(20, 20, 40, 0.6) 100%)',
          padding: '20px 30px',
          borderRadius: '20px',
          zIndex: 1000,
          pointerEvents: 'none',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 6px 24px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          textShadow: '0 0 20px rgba(255, 255, 255, 0.8)',
          animation: 'instructionPulse 2s ease-in-out infinite'
        }}>
          <div style={{
            color: '#00ff88',
            fontSize: '18px',
            marginBottom: '12px',
            textShadow: '0 0 15px rgba(0, 255, 136, 0.8)'
          }}>
            화면을 클릭하여 1인칭 모드로 진입하세요
          </div>
          <div style={{ 
            fontSize: '14px', 
            color: 'rgba(255, 255, 255, 0.8)',
            lineHeight: '1.4'
          }}>
            <span style={{color: '#74b9ff'}}>WASD</span>: 이동 | 
            <span style={{color: '#fd79a8'}}> 스페이스</span>: 점프 | 
            <span style={{color: '#fdcb6e'}}> 마우스</span>: 시점 이동
          </div>
        </div>
      )}

      {/* 3D Canvas */}
      <Canvas
        style={{ width: '100vw', height: '100vh' }}
        shadows
        camera={{
          position: [0, 5, 10],
          fov: 75,
          near: 0.1,
          far: 1000,
        }}
      >
        <Physics
          gravity={[0, -30, 0]}
          defaultContactMaterial={{
            friction: 0.4,
            restitution: 0.1,
          }}
        >
          {/* 조명 설정 */}
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[50, 100, 50]}
            intensity={1.2}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-far={200}
            shadow-camera-left={-50}
            shadow-camera-right={50}
            shadow-camera-top={50}
            shadow-camera-bottom={-50}
            color="#ffaa44"
          />
          
          {/* 하늘 */}
          <Sky
            distance={450000}
            sunPosition={[0, 1, 0]}
            inclination={0}
            azimuth={0.25}
            turbidity={10}
            rayleigh={0.5}
          />

          {/* 도시 모델 */}
          <group ref={worldRef}>
            <CityWithPhysics
              position={[0, 0, 0]}
              scale={[1, 1, 1]}
            />
          </group>

          {/* 플레이어 */}
          <Player position={[0, 3, 0]} />

          {/* 환경 */}
          <Environment preset="city" />
          
          {/* 열기 효과를 위한 파티클 */}
          <HeatParticles />
        </Physics>
      </Canvas>
    </>
  )
}

// 열기 효과 파티클 컴포넌트
function HeatParticles() {
  const particlesRef = useRef<THREE.Points>(null)
  
  const particles = React.useMemo(() => {
    const count = 1000
    const positions = new Float32Array(count * 3)
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100
      positions[i * 3 + 1] = Math.random() * 20
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100
    }
    
    return positions
  }, [])

  React.useEffect(() => {
    const animate = () => {
      if (particlesRef.current) {
        particlesRef.current.rotation.y += 0.001
        const positions = particlesRef.current.geometry.attributes.position.array as Float32Array
        
        for (let i = 1; i < positions.length; i += 3) {
          positions[i] += 0.01
          if (positions[i] > 20) {
            positions[i] = 0
          }
        }
        
        particlesRef.current.geometry.attributes.position.needsUpdate = true
      }
      requestAnimationFrame(animate)
    }
    animate()
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
        size={0.1}
        color="#ff6644"
        transparent
        opacity={0.3}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
