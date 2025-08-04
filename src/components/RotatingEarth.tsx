import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Earth } from './Earth';
import { ClimatePin } from './ClimatePin';

interface RotatingEarthProps {
  onAsphaltCrisis: () => void;
  onOtherCrisis: (type: string) => void;
}

const RotatingEarth: React.FC<RotatingEarthProps> = ({ onAsphaltCrisis, onOtherCrisis }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  
  useEffect(() => {
    // 디바이스 타입 감지
    const checkDeviceType = () => {
      const width = window.innerWidth;
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isTouchDevice = 'ontouchstart' in window;
      
      setIsMobile((isMobileDevice || isTouchDevice) && width <= 768);
      setIsTablet((isMobileDevice || isTouchDevice) && width > 768 && width <= 1024);
    }
    
    checkDeviceType();
    window.addEventListener('resize', checkDeviceType);
    window.addEventListener('orientationchange', checkDeviceType);
    
    return () => {
      window.removeEventListener('resize', checkDeviceType);
      window.removeEventListener('orientationchange', checkDeviceType);
    }
  }, []);
  
  useFrame((state, delta) => {
    if (groupRef.current) {
      // 디바이스 유형에 따른 회전 속도 조정
      let rotationSpeed;
      
      if (isMobile) {
        // 모바일 - 배터리 최적화, 과열 방지를 위해 느린 속도
        rotationSpeed = 0.05;
      } else if (isTablet) {
        // 태블릿 - 중간 속도
        rotationSpeed = 0.075;
      } else {
        // 데스크톱 - 기본 속도
        rotationSpeed = 0.1;
      }
      
      groupRef.current.rotation.y += delta * rotationSpeed;
    }
  });

  return (
    <group ref={groupRef}>
      <Earth />
      
      {/* 기후위기 핀들 - 지구와 함께 회전 */}
      <ClimatePin
        position={[1.5, 0.8, 1.2]}
        title="아스팔트 열섬 현상"
        description="도시 아스팔트로 인한 온도 상승"
        detailedInfo="도시의 아스팔트와 콘크리트는 태양열을 흡수하여 주변보다 2-5°C 높은 온도를 만듭니다. 이는 에너지 소비 증가, 대기질 악화, 열사병 위험 증가 등을 야기합니다."
        color="#ff4444"
        onClick={onAsphaltCrisis}
      />
      
      <ClimatePin
        position={[-1.2, 1.4, 0.8]}
        title="산림 파괴"
        description="열대우림 파괴와 생태계 변화"
        detailedInfo="매년 축구장 27개 크기의 숲이 사라집니다. 산림은 지구 산소의 30%를 생산하고 탄소를 흡수하는 역할을 하며, 파괴 시 생물다양성 감소와 기후변화가 가속화됩니다."
        color="#ff8800"
        onClick={() => onOtherCrisis('산림파괴')}
      />
      
      <ClimatePin
        position={[0.5, -1.6, 1.0]}
        title="해수면 상승"
        description="빙하 해빙과 해안 침수"
        detailedInfo="지구 온난화로 빙하가 녹으면서 해수면이 연간 3.3mm씩 상승하고 있습니다. 2100년까지 최대 2m 상승 예상되며, 전 세계 해안 도시들이 침수 위험에 처해있습니다."
        color="#0088ff"
        onClick={() => onOtherCrisis('해수면상승')}
      />
      
      <ClimatePin
        position={[-1.8, -0.2, 0.6]}
        title="사막화"
        description="토지 황폐화와 사막 확산"
        detailedInfo="매년 한반도 크기의 비옥한 토지가 사막으로 변하고 있습니다. 과도한 방목, 삼림벌채, 기후변화가 주요 원인이며, 식량 생산 감소와 환경 난민 증가를 야기합니다."
        color="#ffaa00"
        onClick={() => onOtherCrisis('사막화')}
      />
      
      <ClimatePin
        position={[0.8, 0.2, -1.8]}
        title="대기 오염"
        description="미세먼지와 온실가스 증가"
        detailedInfo="화석연료 사용으로 CO2 농도가 산업혁명 이전보다 50% 증가했습니다. 미세먼지는 연간 700만 명의 조기 사망을 야기하며, 온실가스는 지구 평균 온도를 1.1°C 상승시켰습니다."
        color="#888888"
        onClick={() => onOtherCrisis('대기오염')}
      />
    </group>
  );
};

export default RotatingEarth;
