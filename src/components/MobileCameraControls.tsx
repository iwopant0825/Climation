import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'

interface MobileCameraControlsProps {
  isMobile?: boolean
  isLocked?: boolean
  onCameraMove?: (rotation: { x: number; y: number }) => void
}

export function MobileCameraControls({ 
  isMobile = false, 
  isLocked = false,
  onCameraMove 
}: MobileCameraControlsProps) {
  const { camera, gl } = useThree()
  const previousTouch = useRef<{ x: number; y: number } | null>(null)
  const cameraRotation = useRef({ x: 0, y: 0 })
  const isDragging = useRef(false)
  const activeTouchId = useRef<number | null>(null) // 활성 터치 ID 추적

  // useFrame을 사용해서 매 프레임마다 카메라 회전 적용
  useFrame(() => {
    if (isMobile && (cameraRotation.current.x !== 0 || cameraRotation.current.y !== 0)) {
      camera.rotation.order = 'YXZ'
      camera.rotation.y = cameraRotation.current.y
      camera.rotation.x = cameraRotation.current.x
    }
  })

  useEffect(() => {
    if (!isMobile || !gl.domElement) return

    const canvas = gl.domElement

    const handleTouchStart = (event: TouchEvent) => {
      // 이미 터치가 활성화되어 있으면 무시
      if (activeTouchId.current !== null) return
      
      const touch = event.touches[0]
      if (!touch) return
      
      // 조이스틱 영역 체크 (왼쪽 하단)
      const joystickArea = {
        left: 0,
        top: window.innerHeight - 200, // 하단 200px
        right: 200, // 왼쪽 200px
        bottom: window.innerHeight
      }
      
      // 페인트 버튼 영역 체크 (오른쪽 하단)
      const paintButtonArea = {
        left: window.innerWidth - 120,
        top: window.innerHeight - 200,
        right: window.innerWidth,
        bottom: window.innerHeight
      }
      
      // 조이스틱이나 페인트 버튼 영역 내의 터치는 무시
      if ((touch.clientX >= joystickArea.left && touch.clientX <= joystickArea.right &&
           touch.clientY >= joystickArea.top && touch.clientY <= joystickArea.bottom) ||
          (touch.clientX >= paintButtonArea.left && touch.clientX <= paintButtonArea.right &&
           touch.clientY >= paintButtonArea.top && touch.clientY <= paintButtonArea.bottom)) {
        return
      }
      
      activeTouchId.current = touch.identifier
      previousTouch.current = { x: touch.clientX, y: touch.clientY }
      isDragging.current = true
    }

    const handleTouchMove = (event: TouchEvent) => {
      if (!previousTouch.current || !isDragging.current || activeTouchId.current === null) return
      
      // 활성 터치 ID와 일치하는 터치 찾기
      let activeTouch = null
      for (let i = 0; i < event.touches.length; i++) {
        if (event.touches[i].identifier === activeTouchId.current) {
          activeTouch = event.touches[i]
          break
        }
      }
      
      if (!activeTouch) return
      
      // 조이스틱이나 페인트 버튼 영역으로 터치가 이동한 경우 시점 조작 중단
      const joystickArea = {
        left: 0,
        top: window.innerHeight - 200,
        right: 200,
        bottom: window.innerHeight
      }
      
      const paintButtonArea = {
        left: window.innerWidth - 120,
        top: window.innerHeight - 200,
        right: window.innerWidth,
        bottom: window.innerHeight
      }
      
      if ((activeTouch.clientX >= joystickArea.left && activeTouch.clientX <= joystickArea.right &&
           activeTouch.clientY >= joystickArea.top && activeTouch.clientY <= joystickArea.bottom) ||
          (activeTouch.clientX >= paintButtonArea.left && activeTouch.clientX <= paintButtonArea.right &&
           activeTouch.clientY >= paintButtonArea.top && activeTouch.clientY <= paintButtonArea.bottom)) {
        isDragging.current = false
        activeTouchId.current = null
        return
      }
      
      const deltaX = activeTouch.clientX - previousTouch.current.x
      const deltaY = activeTouch.clientY - previousTouch.current.y
      
      // 모바일 터치 감도 (더 부드럽게)
      const sensitivity = 0.006
      
      cameraRotation.current.y -= deltaX * sensitivity
      cameraRotation.current.x -= deltaY * sensitivity
      
      // 수직 회전 제한
      cameraRotation.current.x = Math.max(
        -Math.PI / 2,
        Math.min(Math.PI / 2, cameraRotation.current.x)
      )
      
      // 부모 컴포넌트에 카메라 회전 정보 전달
      onCameraMove?.(cameraRotation.current)
      
      previousTouch.current = { x: activeTouch.clientX, y: activeTouch.clientY }
    }

    const handleTouchEnd = (event: TouchEvent) => {
      if (activeTouchId.current === null) return
      
      // 활성 터치가 종료되었는지 확인
      let activeTouchEnded = true
      for (let i = 0; i < event.touches.length; i++) {
        if (event.touches[i].identifier === activeTouchId.current) {
          activeTouchEnded = false
          break
        }
      }
      
      if (activeTouchEnded) {
        previousTouch.current = null
        isDragging.current = false
        activeTouchId.current = null
      }
    }

    // Canvas에 직접 터치 이벤트 리스너 추가
    canvas.addEventListener('touchstart', handleTouchStart, { passive: true })
    canvas.addEventListener('touchmove', handleTouchMove, { passive: true })
    canvas.addEventListener('touchend', handleTouchEnd, { passive: true })
    canvas.addEventListener('touchcancel', handleTouchEnd, { passive: true })

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart)
      canvas.removeEventListener('touchmove', handleTouchMove)
      canvas.removeEventListener('touchend', handleTouchEnd)
      canvas.removeEventListener('touchcancel', handleTouchEnd)
    }
  }, [isMobile, camera, gl.domElement, onCameraMove])

  // 데스크톱용 마우스 조작
  useEffect(() => {
    if (isMobile || !gl.domElement) return

    const handleMouseMove = (event: MouseEvent) => {
      if (!isLocked) return

      const sensitivity = 0.002
      
      cameraRotation.current.y -= event.movementX * sensitivity
      cameraRotation.current.x -= event.movementY * sensitivity
      
      // 수직 회전 제한
      cameraRotation.current.x = Math.max(
        -Math.PI / 2,
        Math.min(Math.PI / 2, cameraRotation.current.x)
      )
      
      // 카메라 회전 적용
      camera.rotation.order = 'YXZ'
      camera.rotation.y = cameraRotation.current.y
      camera.rotation.x = cameraRotation.current.x
    }

    document.addEventListener('mousemove', handleMouseMove)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
    }
  }, [isMobile, isLocked, camera, gl.domElement])

  return null
}
