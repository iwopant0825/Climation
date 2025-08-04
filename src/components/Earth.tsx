import React, { useRef, useState, useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

export function Earth() {
  const earthRef = useRef<THREE.Group>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  
  // 디바이스별 모델 최적화를 위한 설정
  const { scene } = useGLTF('/Models/Earth/earth.glb')
  
  useEffect(() => {
    // 디바이스 타입 감지
    const checkDeviceType = () => {
      const width = window.innerWidth
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      const isTouchDevice = 'ontouchstart' in window
      
      setIsMobile((isMobileDevice || isTouchDevice) && width <= 768)
      setIsTablet((isMobileDevice || isTouchDevice) && width > 768 && width <= 1024)
    }
    
    checkDeviceType()
    window.addEventListener('resize', checkDeviceType)
    window.addEventListener('orientationchange', checkDeviceType)
    
    // 디바이스별 모델 품질 최적화
    if (scene) {
      scene.traverse((object) => {
        if ((object as THREE.Mesh).isMesh) {
          const mesh = object as THREE.Mesh
          
          // 모바일과 태블릿에 따른 최적화 수준 조정
          if (mesh.material) {
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach(mat => {
                if (mat instanceof THREE.MeshStandardMaterial) {
                  if (isMobile) {
                    // 모바일 - 가장 낮은 품질
                    mat.roughness = 0.9
                    mat.metalness = 0.1
                    mat.envMapIntensity = 0.3
                    mat.flatShading = true // 플랫 셰이딩으로 렌더링 단순화
                    if (mat.map) mat.map.minFilter = THREE.NearestFilter // 텍스처 필터링 단순화
                  } else if (isTablet) {
                    // 태블릿 - 중간 품질
                    mat.roughness = 0.7
                    mat.metalness = 0.3
                    mat.envMapIntensity = 0.5
                  } else {
                    // 데스크톱 - 높은 품질
                    mat.roughness = 0.5
                    mat.metalness = 0.5
                    mat.envMapIntensity = 0.8
                  }
                }
              });
            } else if (mesh.material instanceof THREE.MeshStandardMaterial) {
              const mat = mesh.material
              if (isMobile) {
                // 모바일 - 가장 낮은 품질
                mat.roughness = 0.9
                mat.metalness = 0.1
                mat.envMapIntensity = 0.3
                mat.flatShading = true
                if (mat.map) mat.map.minFilter = THREE.NearestFilter
              } else if (isTablet) {
                // 태블릿 - 중간 품질
                mat.roughness = 0.7
                mat.metalness = 0.3
                mat.envMapIntensity = 0.5
              } else {
                // 데스크톱 - 높은 품질
                mat.roughness = 0.5
                mat.metalness = 0.5
                mat.envMapIntensity = 0.8
              }
            }
          }
        }
      });
    }
    
    return () => {
      window.removeEventListener('resize', checkDeviceType)
      window.removeEventListener('orientationchange', checkDeviceType)
    }
  }, [isMobile, isTablet, scene])

  return (
    <group 
      ref={earthRef} 
      scale={isMobile ? 0.2 : isTablet ? 0.22 : 0.234} 
      position={[0, 0, 0]}
    >
      <primitive object={scene} />
    </group>
  )
}

// GLTF 모델 프리로드
useGLTF.preload('/Models/Earth/earth.glb')
