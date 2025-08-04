# CLIMATION - 기후위기 인식 개선 메타버스

React Three Fiber를 사용한 기후위기 교육용 3D 웹 애플리케이션입니다.

## 🌍 프로젝트 목표

사람들에게 기후위기의 정보와 심각성을 알리고, 실천 가능한 해결책을 제시하는 교육용 메타버스 플랫폼

## ✨ 주요 기능

### 메인 홈 화면
- **3D 지구 모델**: 실시간 자전하는 지구 모델
- **우주 배경**: 별들이 반짝이는 우주 공간
- **기후위기 핀**: 지구 위 다양한 기후위기 지점 표시
- **인터랙티브 탐색**: 마우스로 지구 회전 및 확대/축소

### 기후위기 지점들
1. **아스팔트 열섬 현상** 🔴 - 도시 아스팔트로 인한 온도 상승
2. **산림 파괴** 🟠 - 열대우림 파괴와 생태계 변화  
3. **해수면 상승** 🔵 - 빙하 해빙과 해안 침수
4. **사막화** 🟡 - 토지 황폐화와 사막 확산
5. **대기 오염** ⚫ - 미세먼지와 온실가스 증가

### 계획된 기능
- 각 기후위기별 전용 메타버스 세계
- WASD + 점프 1인칭 탐험 모드
- 기후위기로 망가진 세상 시뮬레이션
- 관련 기술 및 해결책 소개
- 개인 실천 방안 제시
- 실천 행동의 긍정적 변화 시각화

## 🎮 조작법

- `마우스 드래그` - 지구 회전
- `마우스 휠` - 확대/축소
- `기후위기 핀 클릭` - 해당 메타버스로 이동 (개발 예정)

## 🚀 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 시작
npm start

# 프로덕션 빌드
npm run build
```

## 🛠 사용된 기술

- **React Three Fiber** - React에서 Three.js 사용
- **React Three Drei** - R3F용 유용한 헬퍼 컴포넌트들
- **Three.js** - 3D 그래픽 라이브러리
- **TypeScript** - 타입 안정성
- **GLTF 모델** - 3D 지구 모델

## 📁 프로젝트 구조

```
src/
├── components/
│   ├── Scene.tsx          # 메인 3D 씬
│   ├── Earth.tsx          # 지구 3D 모델
│   ├── Stars.tsx          # 우주 배경 별들
│   ├── ClimatePin.tsx     # 기후위기 위치 핀
│   └── CameraControls.tsx # 카메라 컨트롤
├── App.tsx               # 메인 App 컴포넌트
└── index.tsx             # 엔트리 포인트

public/
└── Models/
    └── Earth/
        └── earth.glb     # 지구 3D 모델 파일
```

## 🎯 현재 개발 상태

- ✅ 메인 홈 화면 (지구 모델 + 기후위기 핀)
- 🔄 아스팔트 열섬 현상 메타버스 (개발 중)
- ⏳ 기타 기후위기 메타버스들 (계획 중)

## 🌱 개발 계획

1. **아스팔트 문제 메타버스** - 도시 열섬 현상 체험
2. **다른 기후위기 메타버스들** - 순차적 개발
3. **교육 콘텐츠 추가** - 기술 소개 및 실천 방안
4. **사용자 인터랙션 강화** - 게임적 요소 추가

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
# Climation
