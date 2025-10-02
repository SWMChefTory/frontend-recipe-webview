import { useState } from 'react';
import { RecipeData } from 'recipe/detail/types/recipe';

interface UseRecipeStepNavigationProps {
  recipeData: RecipeData;
  ytRef: React.RefObject<YT.Player | null>;
  onTimeUpdate?: () => void; // 시간 업데이트 콜백
}

interface StepInfo {
  stepIndex: number;
  detailIndex: number;
  subtitle: string | null;
}

export const useRecipeStepNavigation = ({
  recipeData,
  ytRef,
  onTimeUpdate,
}: UseRecipeStepNavigationProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [currentDetailIndex, setCurrentDetailIndex] = useState(0);

  // Helper function to get global step number (sequential across all details)
  const getGlobalStepNumber = (stepIndex: number, detailIndex: number) => {
    let globalNumber = 1;
    for (let i = 0; i < stepIndex; i++) {
      globalNumber += recipeData.recipe_steps[i]?.details.length || 0;
    }
    return globalNumber + detailIndex;
  };

  // Helper function to get current detail index within the current step
  const getCurrentDetailIndex = () => {
    return currentDetailIndex;
  };

  // Helper function to get next step and detail info
  const getNextStepInfo = (): StepInfo | null => {
    const currentDetailIndex = getCurrentDetailIndex();
    const currentStepDetails = recipeData.recipe_steps[currentStep]?.details || [];

    // If there's another detail in current step
    if (currentDetailIndex + 1 < currentStepDetails.length) {
      return {
        stepIndex: currentStep,
        detailIndex: currentDetailIndex + 1,
        subtitle: null,
      };
    }

    // If there's a next step
    if (currentStep + 1 < recipeData.recipe_steps.length) {
      return {
        stepIndex: currentStep + 1,
        detailIndex: 0,
        subtitle: recipeData.recipe_steps[currentStep + 1]?.subtitle || null,
      };
    }

    // No next step - recipe end
    return null;
  };

  // Navigation functions
  const goToNextStep = () => {
    const nextStepInfo = getNextStepInfo();
    if (nextStepInfo) {
      setCurrentStep(nextStepInfo.stepIndex);
      setCurrentDetailIndex(nextStepInfo.detailIndex);
      // Seek to the start time of the current detail
      const nextStep = recipeData.recipe_steps[nextStepInfo.stepIndex];
      const nextDetail = nextStep?.details[nextStepInfo.detailIndex];
      if (nextDetail && ytRef.current) {
        ytRef.current.seekTo(nextDetail.start, true);
        // 즉시 시간 업데이트
        setTimeout(() => {
          onTimeUpdate?.();
        }, 100);
      }
    }
  };

  const goToPreviousStep = () => {
    const currentDetailIdx = getCurrentDetailIndex();

    // If we're not on the first detail of current step, go to previous detail
    if (currentDetailIdx > 0) {
      setCurrentDetailIndex(currentDetailIdx - 1);
      // Seek to the start time of the previous detail
      const currentStepData = recipeData.recipe_steps[currentStep];
      const prevDetail = currentStepData?.details[currentDetailIdx - 1];
      if (prevDetail && ytRef.current) {
        ytRef.current.seekTo(prevDetail.start, true);
        // 즉시 시간 업데이트
        setTimeout(() => {
          onTimeUpdate?.();
        }, 100);
      }
    } else if (currentStep > 0) {
      // Go to the last detail of the previous step
      const prevStep = recipeData.recipe_steps[currentStep - 1];
      const prevStepDetailsLength = prevStep?.details.length || 0;
      setCurrentStep(currentStep - 1);
      setCurrentDetailIndex(prevStepDetailsLength - 1);

      // Seek to the start time of the last detail of the previous step
      const prevDetail = prevStep?.details[prevStepDetailsLength - 1];
      if (prevDetail && ytRef.current) {
        ytRef.current.seekTo(prevDetail.start, true);
        // 즉시 시간 업데이트
        setTimeout(() => {
          onTimeUpdate?.();
        }, 100);
      }
    }
  };

  const goToStep = (stepNumber: number) => {
    if (stepNumber >= 1 && stepNumber <= recipeData.recipe_steps.length) {
      const targetStep = stepNumber - 1;
      setCurrentStep(targetStep);
      setCurrentDetailIndex(0); // Always go to first detail of the target step
      const step = recipeData.recipe_steps[targetStep];
      const firstDetail = step?.details[0];
      if (firstDetail && ytRef.current) {
        ytRef.current.seekTo(firstDetail.start, true);
        // 즉시 시간 업데이트
        setTimeout(() => {
          onTimeUpdate?.();
        }, 100);
      }
    }
  };

  // Touch/click handler for navigation
  const handleContainerClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const containerWidth = rect.width;

    // Left third (0 to 1/3)
    if (clickX < containerWidth / 3) {
      goToPreviousStep();
    }
    // Right third (2/3 to 1)
    else if (clickX > (containerWidth * 2) / 3) {
      goToNextStep();
    }
    // Middle third - do nothing
  };

  // Get current step display info
  const getCurrentStepDisplay = () => {
    const currentDetailIndex = getCurrentDetailIndex();
    const currentStepData = recipeData.recipe_steps[currentStep];

    return {
      globalStepNumber: currentDetailIndex + 1, // Each step starts numbering from 1
      subtitle: currentStepData?.subtitle || '',
      detailText: currentStepData?.details[currentDetailIndex]?.text || '',
      alphabetPrefix: String.fromCharCode(65 + currentStep),
    };
  };

  // Get next step display info
  const getNextStepDisplay = () => {
    const nextStepInfo = getNextStepInfo();

    if (nextStepInfo) {
      const nextStepData = recipeData.recipe_steps[nextStepInfo.stepIndex];
      return {
        globalStepNumber: nextStepInfo.detailIndex + 1, // Each step starts numbering from 1
        subtitle: nextStepInfo.subtitle,
        detailText: nextStepData?.details[nextStepInfo.detailIndex]?.text || '',
        alphabetPrefix: String.fromCharCode(65 + nextStepInfo.stepIndex),
        isRecipeEnd: false,
      };
    }

    return {
      globalStepNumber: 0,
      subtitle: null,
      detailText: '레시피 끝',
      alphabetPrefix: '',
      isRecipeEnd: true,
    };
  };

  return {
    currentStep,
    currentDetailIndex,
    setCurrentStep,
    setCurrentDetailIndex,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    handleContainerClick,
    getCurrentStepDisplay,
    getNextStepDisplay,
    getGlobalStepNumber,
  };
};
