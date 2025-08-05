import React, { useRef, useEffect } from 'react'
import { useBox } from '@react-three/cannon'
import { Model as CityModel } from './CityModel'
import * as THREE from 'three'

export function CityWithPhysics(props: any) {
  const cityRef = useRef<THREE.Group>(null)
  
  // 바닥 충돌체 (보이지 않음)
  const [floorRef] = useBox(() => ({
    type: 'Static',
    position: [0, -1, 0],
    args: [100, 2, 100], // 넓은 바닥
  }))

  // 모든 mesh에 그림자 설정 적용
  useEffect(() => {
    if (cityRef.current) {
      cityRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true
          child.receiveShadow = true
          // 원래 색상 유지 (어둡게 하지 않음)
        }
      })
    }
  }, [])

  return (
    <group>
      {/* 시각적 도시 모델 - 그림자 강화 */}
      <group ref={cityRef}>
        <CityModel {...props} />
      </group>
      
      {/* 바닥 충돌체 (투명) */}
      <mesh ref={floorRef}>
        <boxGeometry args={[100, 2, 100]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  )
}


