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
      if (event.touches.length !== 1) return
      
      const touch = event.touches[0]
      previousTouch.current = { x: touch.clientX, y: touch.clientY }
      isDragging.current = true
    }

    const handleTouchMove = (event: TouchEvent) => {
      if (!previousTouch.current || event.touches.length !== 1 || !isDragging.current) return
      
      const touch = event.touches[0]
      
      const deltaX = touch.clientX - previousTouch.current.x
      const deltaY = touch.clientY - previousTouch.current.y
      
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
      
      previousTouch.current = { x: touch.clientX, y: touch.clientY }
    }

    const handleTouchEnd = (event: TouchEvent) => {
      previousTouch.current = null
      isDragging.current = false
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
