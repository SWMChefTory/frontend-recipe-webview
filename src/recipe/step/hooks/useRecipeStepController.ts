import { useEffect, useMemo, useState } from 'react';
import { RecipeData } from '../../detail/types/recipe';
import { useCarousel } from './useCarousel';

export const useRecipeStepController = (recipeData: RecipeData) => {
  const {
    sliderRef,
    currentStep,
    handleStepClick,
    slickSettings,
    goToNext,
    goToPrevious,
    goToStep,
  } = useCarousel();

  const [seekTime, setSeekTime] = useState<{ stepIdx: number; seconds: number } | null>(null);

  // 상세 단계(디테일) 기준으로 평탄화된 타임라인 구성
  const flattenedDetails = useMemo(
    () =>
      recipeData.recipe_steps.flatMap((step, stepIdx) =>
        step.details.map((detail, detailIdx) => ({
          stepIdx,
          detailIdx,
          text: detail.text,
          start: detail.start,
          subtitle: step.subtitle,
        })),
      ),
    [recipeData],
  );

  //TODO : 비싼 연산 아닌데 useMemo를 쓴 이유는?
  const timelineStarts = useMemo(() => flattenedDetails.map(d => d.start), [flattenedDetails]);

  const totalSteps = useMemo(() => flattenedDetails.length, [flattenedDetails]);

  const carouselControls = useMemo(
    () => ({
      goToNext,
      goToPrevious,
      goToStep: (step: number) => {
        const flattenedIndex = step - 1;
        if (flattenedIndex >= 0 && flattenedIndex < totalSteps) {
          goToStep(flattenedIndex);
        }
      },
      currentStep: currentStep + 1,
      totalSteps,
      seekTo: (seconds: number) => {
        // 상세 단계 기준으로 seconds가 속하는 인덱스 찾기
        if (timelineStarts.length === 0) return;
        let idx = timelineStarts.findIndex((start, i) => {
          const next = timelineStarts[i + 1] ?? Number.POSITIVE_INFINITY;
          return seconds >= start && seconds < next;
        });
        if (idx === -1) {
          // seconds가 모든 시작 시간보다 작거나 마지막 이후일 때 경계 처리
          if (seconds < timelineStarts[0]) idx = 0;
          else idx = timelineStarts.length - 1;
        }
        handleStepClick(idx);
      },
    }),
    [currentStep, totalSteps, timelineStarts, goToNext, goToPrevious, goToStep, handleStepClick],
  );

  const currentStepData = useMemo(() => {
    const fallbackStart = timelineStarts[currentStep] ?? 0;
    if (seekTime && seekTime.stepIdx === currentStep) {
      return { start_time: seekTime.seconds } as { start_time: number };
    }
    return { start_time: fallbackStart } as { start_time: number };
  }, [currentStep, seekTime, timelineStarts]);

  const isLastStep = useMemo(() => currentStep === totalSteps - 1, [currentStep, totalSteps]);

  useEffect(() => {
    if (seekTime && seekTime.stepIdx === currentStep) {
      const timer = setTimeout(() => setSeekTime(null), 500);
      return () => clearTimeout(timer);
    }

    return undefined;
  }, [seekTime, currentStep]);

  return {
    sliderRef,
    currentStep,
    slickSettings,
    currentStepData,
    carouselControls,
    handleStepClick,
    isLastStep,
    timelineStarts,
  };
};
