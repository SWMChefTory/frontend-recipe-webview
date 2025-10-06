import { useState } from 'react';
import { RecipeData } from 'recipe/detail/types/recipe';

interface UseRecipeStepNavigationProps {
  recipeData: RecipeData;
  ytRef: React.RefObject<YT.Player | null>;
  onTimeUpdate?: () => void;
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

  const getGlobalStepNumber = (stepIndex: number, detailIndex: number) => {
    let globalNumber = 1;
    for (let i = 0; i < stepIndex; i++) {
      globalNumber += recipeData.recipe_steps[i]?.details.length || 0;
    }
    return globalNumber + detailIndex;
  };

  const getCurrentDetailIndex = () => {
    return currentDetailIndex;
  };

  const getNextStepInfo = (): StepInfo | null => {
    const currentDetailIndex = getCurrentDetailIndex();
    const currentStepDetails = recipeData.recipe_steps[currentStep]?.details || [];

    if (currentDetailIndex + 1 < currentStepDetails.length) {
      return {
        stepIndex: currentStep,
        detailIndex: currentDetailIndex + 1,
        subtitle: null,
      };
    }

    if (currentStep + 1 < recipeData.recipe_steps.length) {
      return {
        stepIndex: currentStep + 1,
        detailIndex: 0,
        subtitle: recipeData.recipe_steps[currentStep + 1]?.subtitle || null,
      };
    }

    return null;
  };

  const goToNextStep = () => {
    const nextStepInfo = getNextStepInfo();
    if (nextStepInfo) {
      setCurrentStep(nextStepInfo.stepIndex);
      setCurrentDetailIndex(nextStepInfo.detailIndex);
      const nextStep = recipeData.recipe_steps[nextStepInfo.stepIndex];
      const nextDetail = nextStep?.details[nextStepInfo.detailIndex];
      if (nextDetail && ytRef.current) {
        ytRef.current.seekTo(nextDetail.start, true);
        setTimeout(() => {
          onTimeUpdate?.();
        }, 100);
      }
    }
  };

  const goToPreviousStep = () => {
    const currentDetailIdx = getCurrentDetailIndex();

    if (currentDetailIdx > 0) {
      setCurrentDetailIndex(currentDetailIdx - 1);
      const currentStepData = recipeData.recipe_steps[currentStep];
      const prevDetail = currentStepData?.details[currentDetailIdx - 1];
      if (prevDetail && ytRef.current) {
        ytRef.current.seekTo(prevDetail.start, true);
        setTimeout(() => {
          onTimeUpdate?.();
        }, 100);
      }
    } else if (currentStep > 0) {
      const prevStep = recipeData.recipe_steps[currentStep - 1];
      const prevStepDetailsLength = prevStep?.details.length || 0;
      setCurrentStep(currentStep - 1);
      setCurrentDetailIndex(prevStepDetailsLength - 1);

      const prevDetail = prevStep?.details[prevStepDetailsLength - 1];
      if (prevDetail && ytRef.current) {
        ytRef.current.seekTo(prevDetail.start, true);
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
      setCurrentDetailIndex(0);
      const step = recipeData.recipe_steps[targetStep];
      const firstDetail = step?.details[0];
      if (firstDetail && ytRef.current) {
        ytRef.current.seekTo(firstDetail.start, true);
        setTimeout(() => {
          onTimeUpdate?.();
        }, 100);
      }
    }
  };

  const goToSpecificDetail = (stepIndex: number, detailIndex: number) => {
    if (stepIndex >= 0 && stepIndex < recipeData.recipe_steps.length) {
      const targetStep = recipeData.recipe_steps[stepIndex];
      const targetDetails = targetStep?.details || [];
      
      if (detailIndex >= 0 && detailIndex < targetDetails.length) {
        setCurrentStep(stepIndex);
        setCurrentDetailIndex(detailIndex);
        
        const targetDetail = targetDetails[detailIndex];
        if (targetDetail && ytRef.current) {
          ytRef.current.seekTo(targetDetail.start, true);
          setTimeout(() => {
            onTimeUpdate?.();
          }, 100);
        }
      }
    }
  };

  const handleContainerClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const containerWidth = rect.width;

    if (clickX < containerWidth / 3) {
      goToPreviousStep();
    }
    else if (clickX > (containerWidth * 2) / 3) {
      goToNextStep();
    }
  };

  const getCurrentStepDisplay = () => {
    const currentDetailIndex = getCurrentDetailIndex();
    const currentStepData = recipeData.recipe_steps[currentStep];

    return {
      globalStepNumber: currentDetailIndex + 1,
      subtitle: currentStepData?.subtitle || '',
      detailText: currentStepData?.details[currentDetailIndex]?.text || '',
      alphabetPrefix: String.fromCharCode(64 + (currentStepData?.step_order || 0)),
    };
  };

  const getNextStepDisplay = () => {
    const nextStepInfo = getNextStepInfo();

    if (nextStepInfo) {
      const nextStepData = recipeData.recipe_steps[nextStepInfo.stepIndex];
      return {
        globalStepNumber: nextStepInfo.detailIndex + 1,
        subtitle: nextStepInfo.subtitle,
        detailText: nextStepData?.details[nextStepInfo.detailIndex]?.text || '',
        alphabetPrefix: String.fromCharCode(64 + (nextStepData?.step_order || 0)),
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

  const getNextStepsPreview = (count?: number) => {
    const previews = [];
    let stepIndex = currentStep;
    let detailIndex = currentDetailIndex + 1;

    while (count === undefined || previews.length < count) {
      const currentStepData = recipeData.recipe_steps[stepIndex];
      const currentStepDetails = currentStepData?.details || [];
      
      if (detailIndex < currentStepDetails.length) {
        previews.push({
          stepIndex,
          detailIndex,
          globalStepNumber: detailIndex + 1,
          subtitle: null,
          detailText: currentStepDetails[detailIndex]?.text || '',
          alphabetPrefix: String.fromCharCode(64 + (currentStepData?.step_order || 0)),
          isRecipeEnd: false,
        });
        detailIndex++;
      } else {
        stepIndex++;
        if (stepIndex >= recipeData.recipe_steps.length) {
          break;
        }
        detailIndex = 0;
        const nextStep = recipeData.recipe_steps[stepIndex];
        previews.push({
          stepIndex,
          detailIndex,
          globalStepNumber: 1,
          subtitle: nextStep?.subtitle || null,
          detailText: nextStep?.details[0]?.text || '',
          alphabetPrefix: String.fromCharCode(64 + (nextStep?.step_order || 0)),
          isRecipeEnd: false,
        });
        detailIndex = 1;
      }
    }

    return previews;
  };

  const getAllPreviousSteps = () => {
    const previews = [];
    let stepIndex = 0;
    let detailIndex = 0;

    while (stepIndex < currentStep || (stepIndex === currentStep && detailIndex < currentDetailIndex)) {
      const stepData = recipeData.recipe_steps[stepIndex];
      const stepDetails = stepData?.details || [];

      if (detailIndex < stepDetails.length) {
        previews.push({
          stepIndex,
          detailIndex,
          globalStepNumber: detailIndex + 1,
          subtitle: detailIndex === 0 ? stepData?.subtitle || null : null,
          detailText: stepDetails[detailIndex]?.text || '',
          alphabetPrefix: String.fromCharCode(64 + (stepData?.step_order || 0)),
          isRecipeEnd: false,
        });
        detailIndex++;
      } else {
        stepIndex++;
        detailIndex = 0;
      }
    }

    return previews;
  };

  return {
    currentStep,
    currentDetailIndex,
    setCurrentStep,
    setCurrentDetailIndex,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    goToSpecificDetail,
    handleContainerClick,
    getCurrentStepDisplay,
    getNextStepDisplay,
    getNextStepsPreview,
    getAllPreviousSteps,
    getGlobalStepNumber,
  };
};
