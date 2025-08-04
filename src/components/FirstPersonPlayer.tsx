import React, { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useSphere } from '@react-three/cannon'
import { Vector3 } from 'three'
import { PointerLockControls } from '@react-three/drei'

interface FirstPersonPlayerProps {
  position: [number, number, number]
}

export function FirstPersonPlayer({ position }: FirstPersonPlayerProps) {
  const { camera, gl } = useThree()
  const [ref, api] = useSphere(() => ({
    mass: 1,
    type: 'Dynamic',
    position,
    material: {
      friction: 0.1,
      restitution: 0.1,
    },
  }))

  const velocity = useRef([0, 0, 0])
  const pos = useRef([0, 0, 0])
  const controlsRef = useRef<any>(null)
  
  // 키보드 입력 상태
  const keys = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
  })

  // 키보드 이벤트 리스너
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyW':
          keys.current.forward = true
          break
        case 'KeyS':
          keys.current.backward = true
          break
        case 'KeyA':
          keys.current.left = true
          break
        case 'KeyD':
          keys.current.right = true
          break
        case 'Space':
          keys.current.jump = true
          event.preventDefault()
          break
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyW':
          keys.current.forward = false
          break
        case 'KeyS':
          keys.current.backward = false
          break
        case 'KeyA':
          keys.current.left = false
          break
        case 'KeyD':
          keys.current.right = false
          break
        case 'Space':
          keys.current.jump = false
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  // 위치와 속도 업데이트
  useEffect(() => {
    const unsubscribeVelocity = api.velocity.subscribe((v) => (velocity.current = v))
    const unsubscribePosition = api.position.subscribe((p) => (pos.current = p))
    
    return () => {
      unsubscribeVelocity()
      unsubscribePosition()
    }
  }, [api])

  useFrame(() => {
    if (!controlsRef.current) return

    const [x, y, z] = pos.current
    const [, vy] = velocity.current

    // 카메라를 플레이어 위치로 이동 (1인칭 시점)
    camera.position.set(x, y + 0.5, z)

    // 카메라 방향 벡터 계산
    const direction = new Vector3()
    camera.getWorldDirection(direction)
    
    const sideVector = new Vector3()
    sideVector.crossVectors(camera.up, direction)

    const movement = new Vector3()

    // 이동 방향 계산
    if (keys.current.forward) movement.add(direction)
    if (keys.current.backward) movement.sub(direction)
    if (keys.current.left) movement.add(sideVector)
    if (keys.current.right) movement.sub(sideVector)

    // Y축 이동 제거 (수평 이동만)
    movement.y = 0
    movement.normalize()
    movement.multiplyScalar(8)

    // 수평 이동 적용
    api.velocity.set(movement.x, vy, movement.z)

    // 점프 (바닥에 있을 때만)
    if (keys.current.jump && Math.abs(vy) < 0.1) {
      api.velocity.set(movement.x, 12, movement.z)
    }
  })

  return (
    <>
      <PointerLockControls 
        ref={controlsRef}
        camera={camera}
        domElement={gl.domElement}
      />
      <mesh ref={ref} castShadow visible={false}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="blue" />
      </mesh>
    </>
  )
}
