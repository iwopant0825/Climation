import React, { useRef, useEffect, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useCylinder } from '@react-three/cannon'
import { Vector3, Euler } from 'three'
import * as THREE from 'three'

interface PlayerProps {
  position?: [number, number, number]
  onPositionChange?: (position: [number, number, number]) => void
}

export function Player({ position = [0, 2, 0], onPositionChange }: PlayerProps) {
  const { camera, gl } = useThree()
  const [ref, api] = useCylinder(() => ({
    mass: 1,
    type: 'Dynamic',
    position,
    args: [0.4, 0.4, 1.8, 8], // 상단반지름, 하단반지름, 높이, 세그먼트
    material: {
      friction: 0.1,
      restitution: 0.1,
    },
    fixedRotation: true, // 플레이어가 넘어지지 않도록
  }))

  const velocity = useRef<[number, number, number]>([0, 0, 0])
  const pos = useRef<[number, number, number]>(position)
  const cameraDirection = useRef<THREE.Vector3>(new THREE.Vector3())
  const [isOnGround, setIsOnGround] = useState(false)
  
  // 마우스 감도 및 카메라 각도
  const mouseSensitivity = 0.002
  const cameraRotation = useRef({ x: 0, y: 0 })
  const isLocked = useRef(false)
  
  // 키보드 입력 상태
  const keys = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
  })

  // 포인터 락 설정
  useEffect(() => {
    const canvas = gl.domElement
    
    const handlePointerLockChange = () => {
      isLocked.current = document.pointerLockElement === canvas
    }
    
    const handleClick = () => {
      if (!isLocked.current) {
        canvas.requestPointerLock()
      }
    }
    
    const handleMouseMove = (event: MouseEvent) => {
      if (!isLocked.current) return
      
      cameraRotation.current.y -= event.movementX * mouseSensitivity
      cameraRotation.current.x -= event.movementY * mouseSensitivity
      
      // 상하 각도 제한
      cameraRotation.current.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, cameraRotation.current.x))
    }
    
    document.addEventListener('pointerlockchange', handlePointerLockChange)
    canvas.addEventListener('click', handleClick)
    document.addEventListener('mousemove', handleMouseMove)
    
    return () => {
      document.removeEventListener('pointerlockchange', handlePointerLockChange)
      canvas.removeEventListener('click', handleClick)
      document.removeEventListener('mousemove', handleMouseMove)
    }
  }, [gl])

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

  // 위치와 속도 업데이트 구독
  useEffect(() => {
    const unsubscribeVelocity = api.velocity.subscribe((v) => {
      velocity.current = v
      setIsOnGround(Math.abs(v[1]) < 0.1) // Y축 속도가 거의 0이면 지면에 있음
    })
    const unsubscribePosition = api.position.subscribe((p) => {
      pos.current = p
      onPositionChange?.(p)
    })
    
    return () => {
      unsubscribeVelocity()
      unsubscribePosition()
    }
  }, [api, onPositionChange])

  useFrame(() => {
    const [x, y, z] = pos.current
    const [vx, vy, vz] = velocity.current
    
    // 카메라 방향 업데이트
    const euler = new Euler(cameraRotation.current.x, cameraRotation.current.y, 0, 'YXZ')
    cameraDirection.current.set(0, 0, -1).applyEuler(euler)
    
    // 카메라 위치 설정 (1인칭)
    camera.position.set(x, y + 0.4, z) // 눈 높이 (1.2 -> 0.8로 더 낮춤)
    camera.setRotationFromEuler(euler)
    
    // 이동 방향 계산
    const moveDirection = new Vector3()
    const forward = new Vector3(0, 0, -1).applyQuaternion(camera.quaternion)
    const right = new Vector3(1, 0, 0).applyQuaternion(camera.quaternion)
    
    forward.y = 0 // 수평 이동만
    right.y = 0
    forward.normalize()
    right.normalize()
    
    if (keys.current.forward) moveDirection.add(forward)
    if (keys.current.backward) moveDirection.sub(forward)
    if (keys.current.right) moveDirection.add(right)
    if (keys.current.left) moveDirection.sub(right)
    
    // 이동 속도 적용 (5 -> 12로 증가)
    const moveSpeed = 50
    moveDirection.multiplyScalar(moveSpeed)
    
    // 수평 이동 적용
    api.velocity.set(moveDirection.x, vy, moveDirection.z)
    
    // 점프 (지면에 있을 때만)
    if (keys.current.jump && isOnGround) {
      api.velocity.set(vx, 8, vz)
    }
  })

  return (
    <>
      {/* 플레이어 충돌체 (보이지 않음) */}
      <mesh ref={ref}>
        <cylinderGeometry args={[0.4, 0.4, 1.8, 8]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </>
  )
}
