import React, { useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/cannon'
import { Environment, Sky } from '@react-three/drei'
import { Player } from './Player'
import { CityWithPhysics } from './CityWithPhysics'
import { MaterialIcon } from './MaterialIcon'
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
      {/* 뒤로가기 버튼 */}
      <button
        onClick={onBackToEarth}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          zIndex: 1000,
          padding: '12px 20px',
          fontSize: '16px',
          fontWeight: 'bold',
          color: 'white',
          background: 'rgba(255, 69, 0, 0.8)',
          border: 'none',
          borderRadius: '25px',
          cursor: 'pointer',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.3s ease',
        }}
      >
        <MaterialIcon icon="public" size={16} color="white" /> 지구로 돌아가기
      </button>

      {/* 정보 패널 */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '15px',
        borderRadius: '10px',
        maxWidth: '300px',
        zIndex: 1000,
        backdropFilter: 'blur(10px)',
      }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#ff4500' }}><MaterialIcon icon="local_fire_department" size={18} color="#ff4500" /> 아스팔트 열섬 현상</h3>
        <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
          도시의 아스팔트와 콘크리트가 태양열을 흡수하여 주변보다 온도가 높아지는 현상입니다.
        </p>
        <div style={{ fontSize: '12px', color: '#ccc' }}>
          <MaterialIcon icon="lightbulb" size={16} color="#ffd700" /> 해결책: 녹지 확대, 쿨루프, 투수성 포장재 사용
        </div>
      </div>

      {/* 온도 표시 */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        background: 'rgba(255, 0, 0, 0.8)',
        color: 'white',
        padding: '10px 15px',
        borderRadius: '20px',
        zIndex: 1000,
        fontSize: '18px',
        fontWeight: 'bold',
      }}>
        <MaterialIcon icon="device_thermostat" size={16} color="#ff4444" /> 도심 온도: 38°C (+5°C ↑)
      </div>

      {/* 클릭 안내 UI */}
      {!isLocked && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: 'white',
          fontSize: '18px',
          fontWeight: 'bold',
          textAlign: 'center',
          background: 'rgba(0, 0, 0, 0.7)',
          padding: '20px',
          borderRadius: '10px',
          zIndex: 1000,
          pointerEvents: 'none',
        }}>
          화면을 클릭하여 1인칭 모드로 진입하세요<br />
          <div style={{ fontSize: '14px', marginTop: '10px' }}>
            WASD: 이동 | 스페이스: 점프 | 마우스: 시점 이동
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
