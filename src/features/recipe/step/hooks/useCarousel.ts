import { useCallback, useEffect, useRef, useState } from 'react';
import Slider from 'react-slick';
import { RecipeData } from '../../detail/types';

interface SlickSettings {
  [key: string]: unknown;
}

// 훅 반환 타입
interface UseCarouselResult {
  sliderRef: React.RefObject<Slider>;
  currentStep: number;
  youtubeKey: number;
  handleStepClick: (stepIndex: number) => void;
  goToNext: () => void;
  goToPrevious: () => void;
  goToStep: (stepIndex: number) => void;
  slickSettings: SlickSettings;
}

/**
 * react-slick을 사용한 캐러셀 기능을 담당하는 커스텀 훅
 * @param recipeData - 레시피 데이터
 * @returns 캐러셀 상태와 핸들러들
 */
export const useCarousel = (recipeData: RecipeData | null): UseCarouselResult => {
  const sliderRef = useRef<Slider>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [youtubeKey, setYoutubeKey] = useState<number>(0);

  // 단계 변경 시 YouTube iframe 강제 새로고침
  useEffect(() => {
    if (recipeData) {
      setYoutubeKey(prev => prev + 1);
    }
  }, [currentStep, recipeData]);

  const handleStepClick = useCallback((stepIndex: number): void => {
    setCurrentStep(stepIndex);
    if (sliderRef.current) {
      sliderRef.current.slickGoTo(stepIndex);
    }
  }, []);

  const goToNext = useCallback(() => {
    if (sliderRef.current) {
      sliderRef.current.slickNext();
    }
  }, []);

  const goToPrevious = useCallback(() => {
    if (sliderRef.current) {
      sliderRef.current.slickPrev();
    }
  }, []);

  const goToStep = useCallback((stepIndex: number) => {
    setCurrentStep(stepIndex);
    if (sliderRef.current) {
      sliderRef.current.slickGoTo(stepIndex);
    }
  }, []);

  const handleSlideChange = useCallback((index: number): void => {
    setCurrentStep(index);
  }, []);

  // Slick 설정
  const slickSettings: SlickSettings = {
    dots: false,
    infinite: false,
    speed: 300,
    slidesToShow: 1,
    slidesToScroll: 1,
    centerMode: true,
    centerPadding: '80px', // 기본값 증가
    swipeToSlide: true,
    touchThreshold: 10, // 터치 민감도 조정
    afterChange: handleSlideChange,
    arrows: false, // 화살표 버튼 비활성화 (명시적)
    adaptiveHeight: false, // 높이 적응 비활성화
    draggable: true,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          centerPadding: '70px', // 태블릿에서도 충분한 미리보기
        },
      },
      {
        breakpoint: 480,
        settings: {
          centerPadding: '60px', // 모바일에서도 양 옆 미리보기가 잘 보이도록 증가
        },
      },
      {
        breakpoint: 360,
        settings: {
          centerPadding: '50px', // 작은 모바일 화면에서도 미리보기 유지
        },
      },
    ],
  };

  return {
    sliderRef,
    currentStep,
    youtubeKey,
    handleStepClick,
    slickSettings,
    goToNext,
    goToPrevious,
    goToStep,
  };
};
