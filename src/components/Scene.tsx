import React from 'react'
import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/cannon'
import { Sky } from '@react-three/drei'
import { FirstPersonPlayer } from './FirstPersonPlayer'
import { Ground } from './Ground'
import { Box } from './Box'
import { Building } from './Building'
import { Tree } from './Tree'

export function Scene() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas
        shadows
        camera={{ position: [0, 5, 10], fov: 60 }}
        gl={{ antialias: true }}
      >
        {/* 조명 */}
        <ambientLight intensity={0.3} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        
        {/* 스카이박스 */}
        <Sky sunPosition={[100, 20, 100]} />
        
        {/* 물리 엔진 */}
        <Physics gravity={[0, -30, 0]}>
          <FirstPersonPlayer position={[0, 2, 0]} />
          <Ground />
          
          {/* 몇 개의 박스들 */}
          <Box position={[3, 2, 0]} color="red" />
          <Box position={[-3, 2, 0]} color="blue" />
          <Box position={[0, 2, 3]} color="yellow" />
          <Box position={[0, 2, -3]} color="purple" />
          <Box position={[5, 2, 5]} color="cyan" />
          <Box position={[-5, 2, -5]} color="magenta" />
          
          {/* 건물들 */}
          <Building position={[10, 2.5, 0]} size={[3, 5, 3]} color="lightblue" />
          <Building position={[-10, 1.5, 0]} size={[4, 3, 4]} color="lightcoral" />
          <Building position={[0, 3, 10]} size={[2, 6, 2]} color="lightyellow" />
          <Building position={[0, 2, -10]} size={[5, 4, 3]} color="lightgreen" />
          
          {/* 나무들 */}
          <Tree position={[7, 0, 7]} />
          <Tree position={[-7, 0, 7]} />
          <Tree position={[7, 0, -7]} />
          <Tree position={[-7, 0, -7]} />
          <Tree position={[15, 0, 15]} />
          <Tree position={[-15, 0, -15]} />
        </Physics>
        
        {/* 디버그용 카메라 컨트롤 (개발 중에만 사용) */}
        {/* <OrbitControls /> */}
      </Canvas>
      
      {/* UI 오버레이 */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        color: 'white',
        fontFamily: 'Arial',
        fontSize: '14px',
        background: 'rgba(0, 0, 0, 0.5)',
        padding: '10px',
        borderRadius: '5px'
      }}>
        <div>🎮 R3F 메타버스</div>
        <div>WASD - 이동</div>
        <div>Space - 점프</div>
        <div>마우스 - 시점 조작</div>
        <div>클릭하여 마우스 락 시작</div>
      </div>
    </div>
  )
}
