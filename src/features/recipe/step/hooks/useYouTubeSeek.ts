import { useCallback, useEffect, useMemo, useState } from 'react';
import { RecipeStep as RecipeStepType } from '../../detail/types/recipe';

interface UseYouTubeSeekProps {
  recipeSteps: RecipeStepType[];
  currentStep: number;
  onStepChange: (stepIndex: number) => void;
}

interface UseYouTubeSeekReturn {
  seekTime: { stepIdx: number; seconds: number } | null;
  seekKey: number;
  currentStepData: RecipeStepType;
  seekTo: (seconds: number) => void;
}

/**
 * YouTube 시킹 관련 로직을 관리하는 커스텀 훅
 */
export const useYouTubeSeek = ({
  recipeSteps,
  currentStep,
  onStepChange,
}: UseYouTubeSeekProps): UseYouTubeSeekReturn => {
  const [seekTime, setSeekTime] = useState<{ stepIdx: number; seconds: number } | null>(null);
  const [seekKey, setSeekKey] = useState<number>(0);

  /**
   * 특정 시간으로 시킹하는 함수
   */
  const seekTo = useCallback(
    (seconds: number) => {
      // step 찾기: step.start <= seconds < step.end
      const stepIdx = recipeSteps.findIndex((step: RecipeStepType, idx) => {
        const isLast = idx === recipeSteps.length - 1;
        if (isLast) {
          return seconds >= step.start_time;
        }
        return seconds >= step.start_time && seconds < recipeSteps[idx + 1].start_time;
      });

      if (stepIdx !== -1) {
        onStepChange(stepIdx);
        setSeekTime({ stepIdx, seconds });
        setSeekKey(prev => prev + 1); // 강제 리마운트
      }
    },
    [recipeSteps, onStepChange],
  );

  /**
   * 현재 단계 데이터 (시킹이 있으면 해당 시간으로, 아니면 기본 start_time)
   */
  const currentStepData = useMemo(() => {
    if (seekTime && seekTime.stepIdx === currentStep) {
      return { ...recipeSteps[currentStep], start_time: seekTime.seconds };
    }
    return recipeSteps[currentStep];
  }, [recipeSteps, currentStep, seekTime]);

  /**
   * currentStep이 바뀌면, seekTime.stepIdx와 currentStep이 같을 때만 0.5초 후 seekTime 리셋
   */
  useEffect(() => {
    if (seekTime && seekTime.stepIdx === currentStep) {
      const timer = setTimeout(() => setSeekTime(null), 500);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [seekTime, currentStep]);

  return {
    seekTime,
    seekKey,
    currentStepData,
    seekTo,
  };
};
