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



  return (
    <group>
      {/* 시각적 도시 모델 */}
      <CityModel {...props} />
      
      {/* 바닥 충돌체 (투명) */}
      <mesh ref={floorRef}>
        <boxGeometry args={[100, 2, 100]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  )
}


