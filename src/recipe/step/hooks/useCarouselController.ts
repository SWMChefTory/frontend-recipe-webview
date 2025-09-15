import { useMemo} from 'react';
import { RecipeData } from '../../detail/types/recipe';
import { useCarousel } from './useCarousel';

//캐러셀을 조작하기 위한 훅, 캐러셀은 0부터 시작하기 때문에 훅도 마찬가지로 0부터 시작한다.
export const useCarouselController = (recipeData: RecipeData) => {
  const {
    sliderRef,
    currentStep,
    slickSettings,
    goToNext,
    goToPrevious,
    goToStep,
  } = useCarousel();

  //TODO : seekTime 필요 없어보이는데
  //DONE : 삭제

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
        const flattenedIndex = step; //DONE : 캐러셀은 항상 0부터 시작하게 조절해야함.
        if (flattenedIndex >= 0 && flattenedIndex < totalSteps) {
          goToStep(flattenedIndex);
        }
      },
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
        //handleStepClick제거하고 goToStep 제거
        goToStep(idx);
        return idx;
      },
    }),
    [currentStep, totalSteps, timelineStarts, goToNext, goToPrevious, goToStep],
  );


  //TODO : 시간만 반환?
  //현재 스텝의 시작 시간 반환하는데, seekTime은 왜 필요한가?
  const currentStepData = useMemo(() => {
    const fallbackStart = timelineStarts[currentStep] ?? 0;
    //TODO : seekTime에 set하지 않고 항상 null인 값인데 필요 없어보임
    //DONE : seekTime 삭제
    return { start_time: fallbackStart } as { start_time: number };
  }, [currentStep, timelineStarts]);

  const isLastStep = useMemo(() => currentStep === totalSteps - 1, [currentStep, totalSteps]);


  //TODO : 이건 왜 필요한거? 그리고 undefined 왜 반환? seekTime 항상 null인데 왜 계속 null?
  //DONE : 삭제

  return {
    sliderRef,
    currentStep,
    currentStepData,
    carouselControls,
    isLastStep,
    timelineStarts,
    slickSettings,
  };
};
