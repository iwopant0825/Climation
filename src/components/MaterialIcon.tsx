import React from 'react'

interface MaterialIconProps {
  icon: string
  size?: number | string
  color?: string
  filled?: boolean
  className?: string
  style?: React.CSSProperties
}

export const MaterialIcon: React.FC<MaterialIconProps> = ({
  icon,
  size = 24,
  color,
  filled = false,
  className = '',
  style = {}
}) => {
  return (
    <span 
      className={`material-symbols-outlined ${className}`}
      style={{
        fontSize: typeof size === 'number' ? `${size}px` : size,
        color: color,
        fontVariationSettings: filled ? "'FILL' 1" : "'FILL' 0",
        userSelect: 'none',
        display: 'inline-block',
        ...style
      }}
    >
      {icon}
    </span>
  )
}
