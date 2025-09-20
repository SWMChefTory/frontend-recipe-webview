import { useRef, useState } from "react";

// 스텝 초기화 훅
export const useStepInit = ( onInit: () => void) => {
  const [isInitialized, setIsInitialized] = useState(false);

  const isSliderInitialized = useRef(false);
  const isYtInitialized = useRef(false);

  const handleYtInitialized = () => {
    isYtInitialized.current = true;
    if (isSliderInitialized && isYtInitialized) {
      setIsInitialized(true);
      onInit();
    }
  };

  const handleSliderInitialized = () => {
    isSliderInitialized.current = true;
    if (isSliderInitialized && isYtInitialized) {
      setIsInitialized(true);
      onInit();
    }
  };

  return {
    isInitialized,
    handleYtInitialized,
    handleSliderInitialized,
  }
}