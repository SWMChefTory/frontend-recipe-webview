import { RecipeData } from "recipe/detail/types/recipe";
import {useCarouselController} from "./useCarouselController";
import { useRef } from "react";


export const useStepController = (recipeData: RecipeData) => {
    const {
        sliderRef, //TODO : 반환
        currentStep,  //TODO : 반환
        slickSettings, // 반환
        carouselControls, //TODO : 길이만 반환
        timelineStarts,  
      } = useCarouselController(recipeData);
    
      // 유튜브 플레이어 관련 상태
      const ytRef = useRef<YT.Player | null>(null);
      //TODO : useEffect의 무한루프 막기 위해서 이거 있는 거 같은데, useEffect 제거해서 이거 없어도 될듯?
      //DONE : 삭제
      const stepEndIntervalRef = useRef<NodeJS.Timeout | null>(null);

      const totalSteps = carouselControls.totalSteps;
    
      const handleStepEnd = (step: number) => {
        if (stepEndIntervalRef.current) {
          clearInterval(stepEndIntervalRef.current);
        }
        //루프
        const interval = setInterval(() => {
          const player = ytRef.current;
          if (!player) return;
          let currentSeconds = 0;
          try {
            // getCurrentTime는 재생/일시정지와 무관하게 현재 시간을 반환
            // YouTube Player가 로드되었는지 확인
            if (typeof player.getCurrentTime === 'function') {
              currentSeconds = player.getCurrentTime();
            }
          } catch {
            return;
          }
    
          const startOfCurrent = timelineStarts[step] ?? 0;
          const startOfNext = timelineStarts[step + 1] ?? Number.POSITIVE_INFINITY;
    
          // 다음 스텝 시작 시각에 도달 또는 초과 시 현재 스텝 시작으로 시킹하여 루프 유지
          if (currentSeconds >= startOfNext) {
            try {
              player.seekTo(startOfCurrent, true);
            } catch {}
          }
        }, 500);
    
        stepEndIntervalRef.current = interval;
      };
    
      const handleRecipeByTimestamp = (seconds: number) => {
        const purposeStep = carouselControls.seekTo(seconds);
        if (!purposeStep) return;
        ytRef.current?.seekTo(seconds, true);
        handleStepEnd(purposeStep);
      };
    
      const handleRecipeByStep = (step: number) => {
        if (step < 0 || step > totalSteps) return;
        carouselControls.goToStep(step);
        ytRef.current?.seekTo(timelineStarts[step], true);
        handleStepEnd(step);
      };
      
      const handleRecipeToNext = () => {
        if (currentStep === totalSteps - 1) return;
        const nextStep = currentStep + 1;
        carouselControls.goToNext();
        ytRef.current?.seekTo(timelineStarts[nextStep], true);
        handleStepEnd(nextStep);
      };
    
      const handleRecipeToPrevious = () => {
        if (currentStep === 0) return;
        const prevStep = currentStep - 1;
        carouselControls.goToPrevious();
        ytRef.current?.seekTo(timelineStarts[prevStep], true);
        handleStepEnd(prevStep);
      };

      const handleSteps = {
        handleRecipeByStep,
        handleRecipeToNext,
        handleRecipeToPrevious,
        handleRecipeByTimestamp,
      }

      return {
        sliderRef,
        ytRef,
        currentStep,
        slickSettings,
        totalSteps,
        handleSteps,
      };
}