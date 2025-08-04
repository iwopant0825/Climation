import React, { useRef, useState, useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

export function Earth() {
  const earthRef = useRef<THREE.Group>(null)
  const [isMobile, setIsMobile] = useState(false)
  
  // 모바일에서는 낮은 품질의 모델 로드(GLB 자체가 최적화되었다고 가정)
  const { scene } = useGLTF('/Models/Earth/earth.glb')
  
  useEffect(() => {
    // 모바일 기기 감지
    const checkIsMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      const isTouchDevice = 'ontouchstart' in window
      const isSmallScreen = window.innerWidth <= 768
      setIsMobile(isMobileDevice || isTouchDevice || isSmallScreen)
    }
    
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    
    // 모바일 최적화 - 모델 품질 감소
    if (scene) {
      scene.traverse((object) => {
        if ((object as THREE.Mesh).isMesh) {
          const mesh = object as THREE.Mesh
          if (isMobile && mesh.material) {
            // 모바일에서 낮은 품질
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach(mat => {
                if (mat instanceof THREE.MeshStandardMaterial) {
                  mat.roughness = 0.8; // 러프니스 증가 (계산 단순화)
                  mat.metalness = 0.2; // 메탈 감소 (계산 단순화)
                  mat.envMapIntensity = 0.5; // 환경 맵 강도 감소
                }
              });
            } else if (mesh.material instanceof THREE.MeshStandardMaterial) {
              mesh.material.roughness = 0.8;
              mesh.material.metalness = 0.2;
              mesh.material.envMapIntensity = 0.5;
            }
          }
        }
      });
    }
    
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [isMobile, scene])

  return (
    <group ref={earthRef} scale={0.234} position={[0, 0, 0]}>
      <primitive object={scene} />
    </group>
  )
}

// GLTF 모델 프리로드
useGLTF.preload('/Models/Earth/earth.glb')
