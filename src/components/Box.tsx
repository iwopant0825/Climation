import React from 'react'
import { useBox } from '@react-three/cannon'

interface BoxProps {
  position: [number, number, number]
  color?: string
}

export function Box({ position, color = 'orange' }: BoxProps) {
  const [ref] = useBox(() => ({
    mass: 1,
    position,
    type: 'Dynamic',
  }))

  return (
    <mesh ref={ref} castShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
}
