import { useEffect, useRef } from "react";

// 스텝 초기화 훅
export const useStepInit = ( onInit: () => void) => {
  const isSliderInitialized = useRef(false);
  const isYtInitialized = useRef(false);
  const isFirst = useRef(true);

  function disableInteraction() {
    document.body.style.pointerEvents = 'none';
    document.body.style.userSelect = 'none';
    document.body.style.touchAction = 'none';
  }

  function enableInteraction() {
    document.body.style.pointerEvents = 'auto';
    document.body.style.userSelect = 'auto';
    document.body.style.touchAction = 'auto';
  }

  useEffect(() => {
    return () => {
      enableInteraction();
    }
  },[]);

  if (isFirst.current) {
    disableInteraction();
    isFirst.current = false;
  }

  const handleYtInitialized = () => {
    isYtInitialized.current = true;
    if (isSliderInitialized && isYtInitialized) {
      onInit();
      enableInteraction();
    }
  };


  const handleSliderInitialized = () => {
    isSliderInitialized.current = true;
    if (isSliderInitialized && isYtInitialized) {
      onInit();
      enableInteraction();
    }
  };

  return {
    handleYtInitialized,
    handleSliderInitialized,
  }
}