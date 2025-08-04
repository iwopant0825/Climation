import React from 'react'
import { useBox } from '@react-three/cannon'

interface BuildingProps {
  position: [number, number, number]
  size: [number, number, number]
  color?: string
}

export function Building({ position, size, color = 'gray' }: BuildingProps) {
  const [ref] = useBox(() => ({
    mass: 0, // 정적 객체
    position,
    args: size,
    type: 'Static',
  }))

  return (
    <mesh ref={ref} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
}
