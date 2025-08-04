import React, { useRef, useState } from 'react'
import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface ClimatePinProps {
  position: [number, number, number]
  title: string
  description: string
  detailedInfo: string
  color: string
  onClick: () => void
}

export function ClimatePin({ position, title, description, detailedInfo, color, onClick }: ClimatePinProps) {
  const pinRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  const [isVisible, setIsVisible] = useState(true)

  // 카메라와의 각도를 계산해서 지구 뒤쪽에 있으면 가리기
  useFrame(({ camera }) => {
    if (pinRef.current) {
      const pinWorldPosition = new THREE.Vector3()
      pinRef.current.getWorldPosition(pinWorldPosition)
      
      // 핀에서 카메라까지의 방향 벡터
      const pinToCameraDirection = camera.position.clone().sub(pinWorldPosition).normalize()
      
      // 핀에서 지구 중심으로의 방향 벡터 (핀이 지구 표면에 있다고 가정)
      const pinToEarthDirection = new THREE.Vector3(0, 0, 0).sub(pinWorldPosition).normalize()
      
      // 두 벡터의 내적으로 각도 계산 (양수면 카메라가 핀의 앞쪽에 있음)
      const dotProduct = pinToCameraDirection.dot(pinToEarthDirection)
      setIsVisible(dotProduct < 0.2) // 카메라가 핀 앞쪽에 있을 때만 보이게
    }
  })

  const handleClick = () => {
    onClick()
  }

  return (
    <group
      ref={pinRef}
      position={position}
      onClick={handleClick}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
      }}
      onPointerOut={(e) => {
        e.stopPropagation()
        setHovered(false)
      }}
    >
      {/* 핀 본체 */}
      <mesh scale={hovered ? [1.4, 1.4, 1.4] : [1.2, 1.2, 1.2]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color}
          emissiveIntensity={hovered ? 0.4 : 0.2}
          transparent
          opacity={0.9}
        />
      </mesh>
      
      {/* 핀 글로우 이펙트 */}
      <mesh scale={[2.5, 2.5, 2.5]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshBasicMaterial 
          color={color}
          transparent
          opacity={hovered ? 0.3 : 0.15}
        />
      </mesh>

      {/* 기본 제목 (호버하지 않을 때만 표시, 지구 뒤쪽에 있으면 숨김) */}
      {!hovered && isVisible && (
        <Html
          position={[0, 0.4, 0]}
          center
          sprite
          style={{
            pointerEvents: 'none',
            transform: 'scale(0.7)',
            opacity: isVisible ? 1 : 0,
            transition: 'opacity 0.3s ease',
          }}
        >
          <div style={{
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            whiteSpace: 'nowrap',
            backdropFilter: 'blur(5px)',
            border: `1px solid ${color}`,
            fontWeight: 'bold',
          }}>
            {title}
          </div>
        </Html>
      )}

      {/* 호버시 상세 정보 팝업 */}
      {hovered && (
        <Html
          position={[0, 0.8, 0]}
          center
          sprite
          zIndexRange={[1000, 2000]}
          style={{
            pointerEvents: 'none',
            transform: 'scale(1)',
            zIndex: 9999,
          }}
        >
          <div style={{
            background: 'rgba(0, 0, 0, 0.95)',
            color: 'white',
            padding: '16px',
            borderRadius: '12px',
            fontSize: '14px',
            width: '280px',
            backdropFilter: 'blur(15px)',
            border: `2px solid ${color}`,
            boxShadow: `0 0 30px ${color}40, inset 0 0 20px rgba(255,255,255,0.1)`,
            animation: 'fadeIn 0.3s ease-in-out',
            wordWrap: 'break-word',
            whiteSpace: 'normal',
            position: 'relative',
            zIndex: 9999,
          }}>
            <div style={{ 
              fontWeight: 'bold', 
              marginBottom: '8px', 
              fontSize: '16px',
              color: color,
              textShadow: `0 0 10px ${color}50`
            }}>
              {title}
            </div>
            <div style={{ 
              fontSize: '13px', 
              opacity: 0.9, 
              marginBottom: '12px',
              lineHeight: '1.4'
            }}>
              {description}
            </div>
            <div style={{ 
              fontSize: '12px', 
              opacity: 0.8,
              lineHeight: '1.5',
              marginBottom: '10px',
              borderTop: `1px solid ${color}30`,
              paddingTop: '8px'
            }}>
              {detailedInfo}
            </div>
            <div style={{ 
              fontSize: '10px', 
              opacity: 0.6,
              textAlign: 'center',
              fontStyle: 'italic'
            }}>
              클릭하여 메타버스 탐험하기
            </div>
          </div>
        </Html>
      )}
    </group>
  )
}
