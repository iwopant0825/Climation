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
          열섬 현상
        </h3>
        <p style={{ 
          margin: '0 0 12px 0', 
          fontSize: '13px',
          lineHeight: '1.5',
          color: 'rgba(255, 255, 255, 0.9)'
        }}>
          도시 지역이 주변 농촌보다 높은 온도를 보이는 현상으로, 아스팔트, 콘크리트, 건물 등이 태양열을 흡수하여 발생합니다.
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
          해결책: 녹지 확대, 쿨루프, 투수성 포장재, 건물 외벽 녹화
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
          {/* 조명 설정 - 디스토피아 분위기 */}
          <ambientLight intensity={0.08} color="#ff2200" />
          
          {/* 메인 붉은 태양 */}
          <directionalLight
            position={[20, 15, 20]}
            intensity={0.6}
            castShadow
            shadow-mapSize-width={4096}
            shadow-mapSize-height={4096}
            shadow-camera-far={400}
            shadow-camera-left={-100}
            shadow-camera-right={100}
            shadow-camera-top={100}
            shadow-camera-bottom={-100}
            shadow-bias={-0.0005}
            color="#ff1100"
          />
          
          {/* 강렬한 오렌지 지옥불 조명 */}
          <pointLight
            position={[0, 3, 0]}
            intensity={1.2}
            color="#ff4400"
            distance={60}
            decay={2}
          />
          
          {/* 어두운 지면 조명 */}
          <hemisphereLight
            args={["#881100", "#220000", 0.1]}
          />
          
          {/* 측면에서 오는 붉은 조명 */}
          <directionalLight
            position={[-30, 10, -30]}
            intensity={0.4}
            color="#cc2200"
          />
          
          {/* 스포트라이트 효과 */}
          <spotLight
            position={[0, 50, 0]}
            angle={Math.PI / 3}
            penumbra={0.5}
            intensity={0.8}
            color="#ff3300"
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          
          {/* 하늘 - 완전히 망가진 디스토피아 느낌 */}
          <Sky
            distance={450000}
            sunPosition={[0, -0.3, 0]}
            inclination={1.5}
            azimuth={1.2}
            turbidity={80}
            rayleigh={0.02}
            mieCoefficient={0.05}
            mieDirectionalG={0.99}
          />

          {/* 도시 모델 - 망가진 느낌으로 수정 */}
          <group ref={worldRef}>
            <group>
              <CityWithPhysics
                position={[0, 0, 0]}
                scale={[1, 1, 1]}
              />
              
              {/* 지옥같은 열기 안개 층들 */}
              <mesh position={[0, 5, 0]} scale={[120, 8, 120]}>
                <boxGeometry args={[1, 1, 1]} />
                <meshBasicMaterial 
                  color="#ff2200"
                  transparent
                  opacity={0.25}
                  blending={THREE.AdditiveBlending}
                />
              </mesh>
              
              {/* 중간 높이 독성 안개 */}
              <mesh position={[0, 12, 0]} scale={[100, 12, 100]}>
                <boxGeometry args={[1, 1, 1]} />
                <meshBasicMaterial 
                  color="#cc1100"
                  transparent
                  opacity={0.18}
                  blending={THREE.AdditiveBlending}
                />
              </mesh>
              
              {/* 상층 어두운 스모그 */}
              <mesh position={[0, 20, 0]} scale={[80, 15, 80]}>
                <boxGeometry args={[1, 1, 1]} />
                <meshBasicMaterial 
                  color="#440000"
                  transparent
                  opacity={0.3}
                  blending={THREE.AdditiveBlending}
                />
              </mesh>
            </group>
            
            {/* 뜨거운 아스팔트에서 올라오는 열기 파티클 */}
            <HeatWaves />
            
            {/* 오염된 공기 파티클 */}
            <PollutionParticles />
          </group>

          {/* 플레이어 */}
          <Player position={[0, 3, 0]} />

          {/* 환경 - 뜨겁고 오염된 분위기 */}
          <Environment preset="city" />
          
          {/* 전체적인 열기 효과를 위한 파티클 */}
          <HeatParticles />
        </Physics>
      </Canvas>
    </>
  )
}

// 지옥불 같은 열기 파티클
function HeatWaves() {
  const particlesRef = useRef<THREE.Points>(null)
  
  const particles = React.useMemo(() => {
    const count = 1200
    const positions = new Float32Array(count * 3)
    const velocities = new Float32Array(count * 3)
    
    for (let i = 0; i < count; i++) {
      // 바닥과 건물 근처에서 집중적으로 시작
      positions[i * 3] = (Math.random() - 0.5) * 90
      positions[i * 3 + 1] = Math.random() * 3
      positions[i * 3 + 2] = (Math.random() - 0.5) * 90
      
      // 불규칙한 상승 속도
      velocities[i * 3] = (Math.random() - 0.5) * 0.8
      velocities[i * 3 + 1] = Math.random() * 1.2 + 0.3
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.8
    }
    
    return { positions, velocities }
  }, [])

  React.useEffect(() => {
    const animate = () => {
      if (particlesRef.current) {
        const positions = particlesRef.current.geometry.attributes.position.array as Float32Array
        const time = Date.now() * 0.001
        
        for (let i = 0; i < positions.length; i += 3) {
          // 더 역동적인 상승
          positions[i + 1] += 0.05
          
          // 격렬한 좌우 움직임
          positions[i] += Math.sin(time * 2 + i * 0.1) * 0.02
          positions[i + 2] += Math.cos(time * 1.5 + i * 0.1) * 0.02
          
          // 높이에 따른 확산
          const height = positions[i + 1]
          if (height > 5) {
            const spread = (height - 5) * 0.01
            positions[i] += (Math.random() - 0.5) * spread
            positions[i + 2] += (Math.random() - 0.5) * spread
          }
          
          // 재생성
          if (positions[i + 1] > 25) {
            positions[i + 1] = 0
            positions[i] = (Math.random() - 0.5) * 90
            positions[i + 2] = (Math.random() - 0.5) * 90
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
          args={[particles.positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.4}
        color="#ff1100"
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

// 독성 스모그 파티클
function PollutionParticles() {
  const particlesRef = useRef<THREE.Points>(null)
  
  const particles = React.useMemo(() => {
    const count = 800
    const positions = new Float32Array(count * 3)
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 150
      positions[i * 3 + 1] = Math.random() * 35
      positions[i * 3 + 2] = (Math.random() - 0.5) * 150
    }
    
    return positions
  }, [])

  React.useEffect(() => {
    const animate = () => {
      if (particlesRef.current) {
        particlesRef.current.rotation.y += 0.001
        const positions = particlesRef.current.geometry.attributes.position.array as Float32Array
        const time = Date.now() * 0.0002
        
        for (let i = 0; i < positions.length; i += 3) {
          // 불규칙한 스모그 움직임
          positions[i] += Math.sin(time * 3 + i * 0.01) * 0.008
          positions[i + 1] += 0.008 + Math.sin(time * 2 + i * 0.02) * 0.003
          positions[i + 2] += Math.cos(time * 2.5 + i * 0.01) * 0.008
          
          // 순환
          if (positions[i + 1] > 35) {
            positions[i + 1] = 0
            positions[i] = (Math.random() - 0.5) * 150
            positions[i + 2] = (Math.random() - 0.5) * 150
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
        size={1.2}
        color="#332211"
        transparent
        opacity={0.7}
        blending={THREE.NormalBlending}
      />
    </points>
  )
}

// 강렬한 열기 파티클 - 메인 효과
function HeatParticles() {
  const particlesRef = useRef<THREE.Points>(null)
  
  const particles = React.useMemo(() => {
    const count = 2000
    const positions = new Float32Array(count * 3)
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 200
      positions[i * 3 + 1] = Math.random() * 40
      positions[i * 3 + 2] = (Math.random() - 0.5) * 200
    }
    
    return positions
  }, [])

  React.useEffect(() => {
    const animate = () => {
      if (particlesRef.current) {
        particlesRef.current.rotation.y += 0.003
        const positions = particlesRef.current.geometry.attributes.position.array as Float32Array
        const time = Date.now() * 0.001
        
        for (let i = 1; i < positions.length; i += 3) {
          // 빠른 상승과 회전
          positions[i] += 0.03 + Math.sin(time + i * 0.1) * 0.01
          
          // 재생성
          if (positions[i] > 40) {
            positions[i] = 0
            positions[i - 1] = (Math.random() - 0.5) * 200
            positions[i + 1] = (Math.random() - 0.5) * 200
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
        size={0.2}
        color="#ff3300"
        transparent
        opacity={0.7}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
