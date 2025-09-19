import { useCallback, useState } from 'react';

interface UseTransitionResult {
  transitioning: boolean;
  fadeIn: boolean;
  smoothTransition: (callback: () => void) => void;
}

/**
 * 지연 함수 (async/await 사용)
 */
const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * 부드러운 화면 전환을 관리하는 커스텀 훅
 * @returns 전환 상태와 전환 함수
 */
export const useTransition = (): UseTransitionResult => {
  const [transitioning, setTransitioning] = useState<boolean>(false);
  const [fadeIn, setFadeIn] = useState<boolean>(true);

  const smoothTransition = useCallback((callback: () => void): void => {
    const handleTransition = async (): Promise<void> => {
      setFadeIn(false);
      setTransitioning(true);

      await delay(150);
      callback();
      setTransitioning(false);
      await delay(50);
      setFadeIn(true);
    };

    handleTransition();
  }, []);

  return {
    transitioning,
    fadeIn,
    smoothTransition,
  };
};
