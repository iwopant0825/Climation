import { useRef, useEffect } from 'react'
import { useThree } from '@react-three/fiber'

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

  useEffect(() => {
    if (!isMobile) return

    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) return
      
      // 가상 조이스틱이나 버튼 영역은 제외
      const target = event.target as HTMLElement
      if (target && (
        target.closest('.virtual-joystick') || 
        target.closest('.jump-button') ||
        target.closest('button') ||
        target.closest('.back-button-mobile')
      )) {
        return
      }
      
      event.preventDefault()
      const touch = event.touches[0]
      previousTouch.current = { x: touch.clientX, y: touch.clientY }
      isDragging.current = true
      
      console.log('Touch start:', previousTouch.current) // 디버그용
    }

    const handleTouchMove = (event: TouchEvent) => {
      if (!previousTouch.current || event.touches.length !== 1 || !isDragging.current) return
      
      // 가상 조이스틱이나 버튼 영역은 제외
      const target = event.target as HTMLElement
      if (target && (
        target.closest('.virtual-joystick') || 
        target.closest('.jump-button') ||
        target.closest('button')
      )) {
        return
      }
      
      event.preventDefault()
      const touch = event.touches[0]
      
      const deltaX = touch.clientX - previousTouch.current.x
      const deltaY = touch.clientY - previousTouch.current.y
      
      // 모바일 터치 감도 (더 민감하게)
      const sensitivity = 0.012
      
      cameraRotation.current.y -= deltaX * sensitivity
      cameraRotation.current.x -= deltaY * sensitivity
      
      // 수직 회전 제한
      cameraRotation.current.x = Math.max(
        -Math.PI / 2,
        Math.min(Math.PI / 2, cameraRotation.current.x)
      )
      
      // 카메라 회전 적용
      camera.rotation.order = 'YXZ'
      camera.rotation.y = cameraRotation.current.y
      camera.rotation.x = cameraRotation.current.x
      
      // 부모 컴포넌트에 카메라 회전 정보 전달
      onCameraMove?.(cameraRotation.current)
      
      previousTouch.current = { x: touch.clientX, y: touch.clientY }
      
      console.log('Camera moving - deltaX:', deltaX, 'deltaY:', deltaY, 'rotation:', cameraRotation.current) // 더 자세한 디버그
    }

    const handleTouchEnd = (event: TouchEvent) => {
      event.preventDefault()
      previousTouch.current = null
      isDragging.current = false
    }

    // 전체 문서에 터치 이벤트 리스너 추가 (Canvas 외부에서도 작동)
    document.addEventListener('touchstart', handleTouchStart, { passive: false })
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd, { passive: false })
    document.addEventListener('touchcancel', handleTouchEnd, { passive: false })

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
      document.removeEventListener('touchcancel', handleTouchEnd)
    }
  }, [isMobile, camera, onCameraMove]) // gl.domElement 의존성 제거

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
