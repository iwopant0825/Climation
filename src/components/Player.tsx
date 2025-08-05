import React, { useRef, useEffect, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useCylinder } from '@react-three/cannon'
import { Vector3, Euler } from 'three'
import * as THREE from 'three'

interface PlayerProps {
  position?: [number, number, number]
  onPositionChange?: (position: [number, number, number]) => void
  isMobile?: boolean
  virtualJoystickInput?: { x: number, y: number }
  jumpPressed?: boolean
}

export function Player({ 
  position = [0, 2, 0], 
  onPositionChange, 
  isMobile = false,
  virtualJoystickInput = { x: 0, y: 0 },
  jumpPressed = false 
}: PlayerProps) {
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
      // 지면 감지 개선: Y축 속도가 거의 0이고 아래쪽으로 떨어지지 않을 때
      setIsOnGround(Math.abs(v[1]) < 0.5 && v[1] > -1)
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
    
    // 맵 경계 체크 (맵 크기를 40x40으로 가정)
    const mapBoundary = 40
    if (Math.abs(x) > mapBoundary || Math.abs(z) > mapBoundary) {
      // 시작점으로 텔레포트
      api.position.set(0, 5, 0)
      api.velocity.set(0, 0, 0)
      return
    }
    
    // 카메라 방향 업데이트
    const euler = new Euler(cameraRotation.current.x, cameraRotation.current.y, 0, 'YXZ')
    cameraDirection.current.set(0, 0, -1).applyEuler(euler)
    
    // 카메라 위치 설정 (1인칭)
    camera.position.set(x, y + 0.4, z) // 눈 높이
    camera.setRotationFromEuler(euler)
    
    // 이동 방향 계산 (키보드 + 가상 조이스틱)
    const moveDirection = new Vector3()
    const forward = new Vector3(0, 0, -1).applyQuaternion(camera.quaternion)
    const right = new Vector3(1, 0, 0).applyQuaternion(camera.quaternion)
    
    forward.y = 0 // 수평 이동만
    right.y = 0
    forward.normalize()
    right.normalize()
    
    // 키보드 입력 처리
    if (keys.current.forward) moveDirection.add(forward)
    if (keys.current.backward) moveDirection.sub(forward)
    if (keys.current.right) moveDirection.add(right)
    if (keys.current.left) moveDirection.sub(right)
    
    // 가상 조이스틱 입력 처리 (모바일)
    if (isMobile && (Math.abs(virtualJoystickInput.x) > 0.1 || Math.abs(virtualJoystickInput.y) > 0.1)) {
      const joystickForward = forward.clone().multiplyScalar(virtualJoystickInput.y)
      const joystickRight = right.clone().multiplyScalar(virtualJoystickInput.x)
      moveDirection.add(joystickForward).add(joystickRight)
    }
    
    // 이동 속도 적용
    const moveSpeed = isOnGround ? (isMobile ? 45 : 55) : 3 // 모바일에서 약간 느리게
    moveDirection.multiplyScalar(moveSpeed)
    
    // 수평 이동 적용 - 공중에서는 현재 속도에 추가하는 방식
    if (isOnGround) {
      // 지면에서는 직접 속도 설정
      api.velocity.set(moveDirection.x, vy, moveDirection.z)
    } else {
      // 공중에서는 이동 입력이 있을 때만 아주 작은 조작력 추가
      if (moveDirection.length() > 0) {
        const airControl = 0.02 // 공중 조작력을 더욱 줄임
        const maxAirSpeed = 12 // 공중에서 최대 수평 속도를 더 제한
        
        const newVx = vx + moveDirection.x * airControl
        const newVz = vz + moveDirection.z * airControl
        
        // 수평 속도 제한
        const horizontalSpeed = Math.sqrt(newVx * newVx + newVz * newVz)
        if (horizontalSpeed > maxAirSpeed) {
          const ratio = maxAirSpeed / horizontalSpeed
          api.velocity.set(newVx * ratio, vy, newVz * ratio)
        } else {
          api.velocity.set(newVx, vy, newVz)
        }
      } else {
        // 이동 입력이 없으면 공기 저항 적용으로 속도 감소
        const airResistance = 0.98
        api.velocity.set(vx * airResistance, vy, vz * airResistance)
      }
    }
    
    // 점프 (지면에 있을 때만) - 키보드 또는 모바일 버튼
    if ((keys.current.jump || (isMobile && jumpPressed)) && isOnGround) {
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
