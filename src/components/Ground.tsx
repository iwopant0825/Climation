import React from 'react'
import { usePlane } from '@react-three/cannon'

export function Ground() {
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, -1, 0],
    type: 'Static',
  }))

  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial color="green" />
    </mesh>
  )
}
