import { useRef, useEffect } from 'react'
import { useThree } from '@react-three/fiber'

interface MobileCameraControlsProps {
  isMobile?: boolean
  isLocked?: boolean
}

export function MobileCameraControls({ isMobile = false, isLocked = false }: MobileCameraControlsProps) {
  const { camera, gl } = useThree()
  const previousTouch = useRef<{ x: number; y: number } | null>(null)
  const cameraRotation = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (!isMobile || !gl.domElement) return

    const handleTouchStart = (event: TouchEvent) => {
      if (!isLocked || event.touches.length !== 1) return
      
      event.preventDefault()
      const touch = event.touches[0]
      previousTouch.current = { x: touch.clientX, y: touch.clientY }
    }

    const handleTouchMove = (event: TouchEvent) => {
      if (!isLocked || !previousTouch.current || event.touches.length !== 1) return
      
      event.preventDefault()
      const touch = event.touches[0]
      
      const deltaX = touch.clientX - previousTouch.current.x
      const deltaY = touch.clientY - previousTouch.current.y
      
      // 감도 조정 (모바일에서 더 민감하게)
      const sensitivity = 0.003
      
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
      
      previousTouch.current = { x: touch.clientX, y: touch.clientY }
    }

    const handleTouchEnd = (event: TouchEvent) => {
      if (!isLocked) return
      
      event.preventDefault()
      previousTouch.current = null
    }

    // 터치 이벤트 리스너 추가
    gl.domElement.addEventListener('touchstart', handleTouchStart, { passive: false })
    gl.domElement.addEventListener('touchmove', handleTouchMove, { passive: false })
    gl.domElement.addEventListener('touchend', handleTouchEnd, { passive: false })

    return () => {
      gl.domElement.removeEventListener('touchstart', handleTouchStart)
      gl.domElement.removeEventListener('touchmove', handleTouchMove)
      gl.domElement.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isMobile, isLocked, camera, gl.domElement])

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
