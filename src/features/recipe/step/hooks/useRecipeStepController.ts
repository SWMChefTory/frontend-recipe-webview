import { useEffect, useMemo, useState } from 'react';
import { RecipeData } from '../../detail/types/recipe';
import { useCarousel } from './useCarousel';

export const useRecipeStepController = (recipeData: RecipeData) => {
  const {
    sliderRef,
    currentStep,
    youtubeKey,
    handleStepClick,
    slickSettings,
    goToNext,
    goToPrevious,
    goToStep,
  } = useCarousel(recipeData);

  const [seekTime, setSeekTime] = useState<{ stepIdx: number; seconds: number } | null>(null);
  const [seekKey, setSeekKey] = useState<number>(0);

  const totalSteps = useMemo(() => recipeData.recipe_steps.length, [recipeData]);

  const carouselControls = useMemo(
    () => ({
      goToNext,
      goToPrevious,
      goToStep: (step: number) => {
        const stepIndex = step - 1;
        if (stepIndex >= 0 && stepIndex < totalSteps) {
          goToStep(stepIndex);
        }
      },
      currentStep: currentStep + 1,
      totalSteps,
      seekTo: (seconds: number) => {
        const stepIdx = recipeData.recipe_steps.findIndex((step, idx) => {
          const isLast = idx === recipeData.recipe_steps.length - 1;
          return isLast
            ? seconds >= step.start_time
            : seconds >= step.start_time && seconds < recipeData.recipe_steps[idx + 1].start_time;
        });
        if (stepIdx !== -1) {
          handleStepClick(stepIdx);
          setSeekTime({ stepIdx, seconds });
          setSeekKey(prev => prev + 1);
        }
      },
    }),
    [currentStep, totalSteps, recipeData, goToNext, goToPrevious, goToStep, handleStepClick],
  );

  const currentStepData = useMemo(() => {
    if (seekTime && seekTime.stepIdx === currentStep) {
      return { ...recipeData.recipe_steps[currentStep], start_time: seekTime.seconds };
    }
    return recipeData.recipe_steps[currentStep];
  }, [recipeData, currentStep, seekTime]);

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
    youtubeKey: seekTime !== null ? seekKey : youtubeKey,
    currentStepData,
    carouselControls,
    handleStepClick,
    isLastStep,
  };
};
