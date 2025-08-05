import React, { useRef, useEffect, useState, useCallback } from 'react'

interface VirtualJoystickProps {
  onMove: (x: number, y: number) => void
  size?: number
  maxDistance?: number
}

export function VirtualJoystick({ onMove, size = 120, maxDistance = 50 }: VirtualJoystickProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const knobRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const handleStart = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return
    
    setIsDragging(true)
    const rect = containerRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    const deltaX = clientX - centerX
    const deltaY = clientY - centerY
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    
    if (distance <= maxDistance) {
      setPosition({ x: deltaX, y: deltaY })
      onMove(deltaX / maxDistance, -deltaY / maxDistance)
    } else {
      const angle = Math.atan2(deltaY, deltaX)
      const limitedX = Math.cos(angle) * maxDistance
      const limitedY = Math.sin(angle) * maxDistance
      setPosition({ x: limitedX, y: limitedY })
      onMove(limitedX / maxDistance, -limitedY / maxDistance)
    }
  }, [maxDistance, onMove])

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging || !containerRef.current) return
    
    const rect = containerRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    const deltaX = clientX - centerX
    const deltaY = clientY - centerY
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    
    if (distance <= maxDistance) {
      setPosition({ x: deltaX, y: deltaY })
      onMove(deltaX / maxDistance, -deltaY / maxDistance)
    } else {
      const angle = Math.atan2(deltaY, deltaX)
      const limitedX = Math.cos(angle) * maxDistance
      const limitedY = Math.sin(angle) * maxDistance
      setPosition({ x: limitedX, y: limitedY })
      onMove(limitedX / maxDistance, -limitedY / maxDistance)
    }
  }, [isDragging, maxDistance, onMove])

  const handleEnd = useCallback(() => {
    setIsDragging(false)
    setPosition({ x: 0, y: 0 })
    onMove(0, 0)
  }, [onMove])

  // 터치 이벤트
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    const touch = e.touches[0]
    handleStart(touch.clientX, touch.clientY)
  }, [handleStart])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    const touch = e.touches[0]
    handleMove(touch.clientX, touch.clientY)
  }, [handleMove])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    handleEnd()
  }, [handleEnd])

  // 마우스 이벤트 (데스크톱 테스트용)
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    handleStart(e.clientX, e.clientY)
  }, [handleStart])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY)
    }

    const handleMouseUp = () => {
      handleEnd()
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, handleMove, handleEnd])

  return (
    <div
      ref={containerRef}
      className="virtual-joystick"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      style={{
        position: 'relative',
        width: size,
        height: size,
        background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
        borderRadius: '50%',
        border: '2px solid rgba(255, 255, 255, 0.3)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.1)',
        userSelect: 'none',
        touchAction: 'none',
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
    >
      <div
        ref={knobRef}
        style={{
          position: 'absolute',
          width: size * 0.4,
          height: size * 0.4,
          background: 'radial-gradient(circle, rgba(0, 255, 136, 0.8) 0%, rgba(0, 200, 100, 0.6) 100%)',
          borderRadius: '50%',
          border: '2px solid rgba(255, 255, 255, 0.5)',
          boxShadow: '0 2px 10px rgba(0, 255, 136, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.3)',
          left: '50%',
          top: '50%',
          transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
          transition: isDragging ? 'none' : 'transform 0.2s ease-out',
          pointerEvents: 'none'
        }}
      />
      
      {/* 방향 표시자 */}
      <div style={{
        position: 'absolute',
        top: '8px',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '12px',
        color: 'rgba(255, 255, 255, 0.6)',
        fontWeight: 'bold'
      }}>
        ↑
      </div>
      <div style={{
        position: 'absolute',
        bottom: '8px',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '12px',
        color: 'rgba(255, 255, 255, 0.6)',
        fontWeight: 'bold'
      }}>
        ↓
      </div>
      <div style={{
        position: 'absolute',
        left: '8px',
        top: '50%',
        transform: 'translateY(-50%)',
        fontSize: '12px',
        color: 'rgba(255, 255, 255, 0.6)',
        fontWeight: 'bold'
      }}>
        ←
      </div>
      <div style={{
        position: 'absolute',
        right: '8px',
        top: '50%',
        transform: 'translateY(-50%)',
        fontSize: '12px',
        color: 'rgba(255, 255, 255, 0.6)',
        fontWeight: 'bold'
      }}>
        →
      </div>
    </div>
  )
}

interface JumpButtonProps {
  onJump: () => void
  size?: number
}

export function JumpButton({ onJump, size = 80 }: JumpButtonProps) {
  const [isPressed, setIsPressed] = useState(false)

  const handleStart = useCallback(() => {
    setIsPressed(true)
    onJump()
  }, [onJump])

  const handleEnd = useCallback(() => {
    setIsPressed(false)
  }, [])

  return (
    <div
      className="jump-button"
      onTouchStart={handleStart}
      onTouchEnd={handleEnd}
      onMouseDown={handleStart}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: isPressed 
          ? 'radial-gradient(circle, rgba(255, 215, 0, 0.9) 0%, rgba(255, 165, 0, 0.7) 100%)'
          : 'radial-gradient(circle, rgba(255, 215, 0, 0.7) 0%, rgba(255, 165, 0, 0.5) 100%)',
        border: '3px solid rgba(255, 255, 255, 0.6)',
        backdropFilter: 'blur(10px)',
        boxShadow: isPressed
          ? '0 2px 8px rgba(255, 215, 0, 0.5), inset 0 2px 4px rgba(0, 0, 0, 0.2)'
          : '0 4px 16px rgba(255, 215, 0, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        touchAction: 'none',
        cursor: 'pointer',
        transform: isPressed ? 'scale(0.95)' : 'scale(1)',
        transition: 'all 0.1s ease'
      }}
    >
      <span style={{
        fontSize: size * 0.3,
        fontWeight: 'bold',
        color: 'white',
        textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)'
      }}>
        ↑
      </span>
    </div>
  )
}
