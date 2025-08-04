# R3F 메타버스 웹 애플리케이션

React Three Fiber를 사용한 3D 메타버스 웹 애플리케이션입니다.

## 기능

- **1인칭 시점**: 마우스로 시점 조작 가능
- **WASD 이동**: 키보드로 자유로운 이동
- **점프**: 스페이스바로 점프
- **물리 엔진**: Cannon.js를 사용한 리얼한 물리 시뮬레이션
- **3D 환경**: 건물, 나무, 박스 등 다양한 3D 객체들

## 조작법

- `W` - 앞으로 이동
- `S` - 뒤로 이동  
- `A` - 왼쪽으로 이동
- `D` - 오른쪽으로 이동
- `Space` - 점프
- `마우스` - 시점 조작 (화면 클릭 후 마우스 락 활성화)

## 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 시작
npm start
```

## 사용된 라이브러리

- **React Three Fiber** - React에서 Three.js 사용
- **React Three Drei** - R3F용 유용한 헬퍼 컴포넌트들
- **React Three Cannon** - 물리 엔진 (Cannon.js)
- **Three.js** - 3D 그래픽 라이브러리

## 프로젝트 구조

```
src/
├── components/
│   ├── Scene.tsx              # 메인 3D 씬
│   ├── FirstPersonPlayer.tsx  # 1인칭 플레이어 컨트롤러
│   ├── Ground.tsx            # 바닥
│   ├── Box.tsx              # 박스 객체
│   ├── Building.tsx         # 건물 객체
│   └── Tree.tsx             # 나무 객체
├── App.tsx                   # 메인 App 컴포넌트
└── index.tsx                 # 엔트리 포인트
```

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
# Climation
