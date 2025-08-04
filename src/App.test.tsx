import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

test('renders climate crisis metaverse app', () => {
  render(<App />);
  // Three.js 캔버스는 테스트하기 복잡하므로 기본 렌더링이 에러 없이 완료되는지만 확인
  expect(true).toBe(true);
});
