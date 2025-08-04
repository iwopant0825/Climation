import React from 'react'
import { OrbitControls } from '@react-three/drei'

export function CameraControls() {
  return (
    <OrbitControls
      enablePan={false}
      enableZoom={true}
      enableRotate={true}
      zoomSpeed={0.8}
      rotateSpeed={0.5}
      minDistance={3}
      maxDistance={15}
      autoRotate={false}
      target={[0, 0, 0]}
      enableDamping={true}
      dampingFactor={0.05}
    />
  )
}
