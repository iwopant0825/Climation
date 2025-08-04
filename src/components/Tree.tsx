import React from 'react'
import { useCylinder, useBox } from '@react-three/cannon'

interface TreeProps {
  position: [number, number, number]
}

export function Tree({ position }: TreeProps) {
  // 나무 기둥
  const [trunkRef] = useCylinder(() => ({
    mass: 0,
    position: [position[0], position[1] + 1, position[2]],
    args: [0.2, 0.2, 2, 8],
    type: 'Static',
  }))

  // 나무 잎
  const [leavesRef] = useBox(() => ({
    mass: 0,
    position: [position[0], position[1] + 3, position[2]],
    args: [2, 2, 2],
    type: 'Static',
  }))

  return (
    <>
      {/* 나무 기둥 */}
      <mesh ref={trunkRef} castShadow>
        <cylinderGeometry args={[0.2, 0.2, 2, 8]} />
        <meshStandardMaterial color="brown" />
      </mesh>
      
      {/* 나무 잎 */}
      <mesh ref={leavesRef} castShadow>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="green" />
      </mesh>
    </>
  )
}
