import React from 'react'
import { useBox } from '@react-three/cannon'
import { Model as CityModel } from './CityModel'

export function CityWithPhysics(props: any) {
  // 바닥 충돌체 (보이지 않음)
  const [floorRef] = useBox(() => ({
    type: 'Static',
    position: [0, -1, 0],
    args: [100, 2, 100], // 넓은 바닥
  }))

  // 건물들을 위한 충돌체들 (대략적인 위치와 크기)
  const buildings = [
    { position: [10, 5, 10], size: [5, 10, 5] },
    { position: [-10, 5, 10], size: [5, 10, 5] },
    { position: [10, 5, -10], size: [5, 10, 5] },
    { position: [-10, 5, -10], size: [5, 10, 5] },
    { position: [0, 5, 20], size: [8, 10, 8] },
    { position: [0, 5, -20], size: [8, 10, 8] },
    { position: [20, 5, 0], size: [6, 10, 6] },
    { position: [-20, 5, 0], size: [6, 10, 6] },
  ]

  return (
    <group>
      {/* 시각적 도시 모델 */}
      <CityModel {...props} />
      
      {/* 바닥 충돌체 (투명) */}
      <mesh ref={floorRef}>
        <boxGeometry args={[100, 2, 100]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      
      {/* 건물 충돌체들 (투명) */}
      {buildings.map((building, index) => (
        <BuildingCollider 
          key={index}
          position={building.position}
          size={building.size}
        />
      ))}
    </group>
  )
}

function BuildingCollider({ position, size }: { position: number[], size: number[] }) {
  const [ref] = useBox(() => ({
    type: 'Static',
    position: position as [number, number, number],
    args: size as [number, number, number],
  }))

  return (
    <mesh ref={ref}>
      <boxGeometry args={size as [number, number, number]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  )
}
