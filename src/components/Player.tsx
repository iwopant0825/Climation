import React, { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useSphere } from '@react-three/cannon'
import { Vector3 } from 'three'

interface PlayerProps {
  position: [number, number, number]
}

export function Player({ position }: PlayerProps) {
  const { camera } = useThree()
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
  
  // 키보드 입력 상태
  const keys = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
  })

  // 키보드 이벤트 리스너
  React.useEffect(() => {
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
  React.useEffect(() => {
    const unsubscribeVelocity = api.velocity.subscribe((v) => (velocity.current = v))
    const unsubscribePosition = api.position.subscribe((p) => (pos.current = p))
    
    return () => {
      unsubscribeVelocity()
      unsubscribePosition()
    }
  }, [api])

  useFrame(() => {
    const [x, y, z] = pos.current
    const [vx, vy, vz] = velocity.current

    // 카메라를 플레이어 위치로 이동
    camera.position.set(x, y + 1.5, z + 5)
    camera.lookAt(x, y, z)

    const frontVector = new Vector3(0, 0, -1)
    const sideVector = new Vector3(-1, 0, 0)
    const direction = new Vector3()

    // 카메라 방향 기준으로 이동 방향 계산
    if (keys.current.forward) direction.add(frontVector)
    if (keys.current.backward) direction.sub(frontVector)
    if (keys.current.left) direction.add(sideVector)
    if (keys.current.right) direction.sub(sideVector)

    direction.normalize()
    direction.multiplyScalar(5)

    // 수평 이동
    api.velocity.set(direction.x, vy, direction.z)

    // 점프 (바닥에 있을 때만)
    if (keys.current.jump && Math.abs(vy) < 0.1) {
      api.velocity.set(vx, 10, vz)
    }
  })

  return (
    <mesh ref={ref} castShadow>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial color="blue" />
    </mesh>
  )
}
