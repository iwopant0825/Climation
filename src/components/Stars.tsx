import React, { useRef, useMemo, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function Stars() {
  const starsRef = useRef<THREE.Points>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // 모바일 기기 감지
    const checkIsMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      const isTouchDevice = 'ontouchstart' in window
      const isSmallScreen = window.innerWidth <= 768
      setIsMobile(isMobileDevice || isTouchDevice || isSmallScreen)
    }
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])
  
  const [positions, colors] = useMemo(() => {
    // 모바일에서는 별 개수 줄이기 (성능 최적화)
    const starCount = isMobile ? 2500 : 5000
    const positions = new Float32Array(starCount * 3)
    const colors = new Float32Array(starCount * 3)
    
    for (let i = 0; i < starCount; i++) {
      // 별들을 구 형태로 배치
      const radius = Math.random() * 2000 + 1000
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = radius * Math.cos(phi)
      
      // 별들의 색상을 다양하게 - 더 밝고 화려하게
      const color = new THREE.Color()
      const hue = Math.random()
      const saturation = 0.7 + Math.random() * 0.3
      const lightness = 0.7 + Math.random() * 0.3
      color.setHSL(hue, saturation, lightness)
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
    }
    
    return [positions, colors]
  }, [isMobile])
  
  // 별들이 천천히 회전하고 반짝이도록
  useFrame((state, delta) => {
    if (starsRef.current) {
      // 모바일에서는 회전 속도 줄이기 (성능 최적화)
      const rotationSpeed = isMobile ? 0.0005 : 0.001
      starsRef.current.rotation.x += delta * rotationSpeed
      starsRef.current.rotation.y += delta * (rotationSpeed * 2)
      
      // 모바일에서는 반짝임 효과 간소화
      if (!isMobile) {
        const material = starsRef.current.material as THREE.PointsMaterial
        if (material) {
          material.opacity = 0.6 + Math.sin(state.clock.elapsedTime * 2) * 0.4
        }
      }
    }
  })
  
  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={3}
        sizeAttenuation={true}
        vertexColors={true}
        transparent={true}
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
