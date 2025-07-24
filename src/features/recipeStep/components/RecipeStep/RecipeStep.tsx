import React, { useCallback, useMemo, useState } from 'react';
import Slider from 'react-slick';
import Header from '../../../common/components/Header/Header';
import YouTubePlayer from '../../../common/components/YouTube/YouTubePlayer';
import { RecipeData } from '../../../recipeDetail/types/recipe';
import SpeechRecognition from '../../../speech/components/SpeechRecognition/SpeechRecognition';
import { useStepSpeechRecognition } from '../../../speech/hooks/useStepSpeechRecognition';
import { useCarousel } from '../../hooks/useCarousel';
import './RecipeStep.css';
import StepDots from './StepDots';

// RecipeStep 컴포넌트 Props
interface RecipeStepProps {
  recipeData: RecipeData;
  onFinishCooking: () => void;
  onBackToRecipe: () => void;
}

/**
 * 개별 조리 단계 카드 컴포넌트
 */
const StepCard: React.FC<{
  step: RecipeData['steps'][0];
  index: number;
  totalSteps: number;
}> = ({ step, index, totalSteps }) => (
  <div className="carousel-slide">
    <article className="step-card">
      <header className="step-header">
        <h3 className="step-title">Step {index + 1}</h3>
        <div className="step-indicator">
          {index + 1} / {totalSteps}
        </div>
      </header>
      <div className="step-content">
        <ul className="step-description-list">
          {step.details.map((detail: string, detailIndex: number) => (
            <li key={`detail-${index}-${detailIndex}`} className="step-description-item">
              {detail}
            </li>
          ))}
        </ul>
      </div>
    </article>
  </div>
);

/**
 * 조리 모드 컴포넌트
 * @param props - 조리 모드 컴포넌트 props
 * @returns JSX 엘리먼트
 */
const RecipeStep = ({
  recipeData,
  onFinishCooking,
  onBackToRecipe,
}: RecipeStepProps): JSX.Element => {
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

  const totalSteps = useMemo(() => recipeData.steps.length, [recipeData.steps.length]);

  // TIMESTAMP 명령을 위한 유튜브 시킹 상태
  const [seekTime, setSeekTime] = useState<{ stepIdx: number; seconds: number } | null>(null);
  const [seekKey, setSeekKey] = useState<number>(0);

  // 캐러셀 제어 객체 생성
  const carouselControls = useMemo(() => {
    return {
      goToNext: () => {
        goToNext();
      },
      goToPrevious: () => {
        goToPrevious();
      },
      goToStep: (step: number) => {
        // 1-based를 0-based로 변환
        const stepIndex = step - 1;
        if (stepIndex >= 0 && stepIndex < totalSteps) {
          goToStep(stepIndex);
        } else {
          console.log('잘못된 단계 번호:', step, '(허용 범위: 1-' + totalSteps + ')');
        }
      },
      currentStep: currentStep + 1, // 1-based로 반환
      totalSteps,
      seekTo: (seconds: number) => {
        // step 찾기: step.start <= seconds < step.end
        const stepIdx = recipeData.steps.findIndex((step, idx) => {
          const isLast = idx === recipeData.steps.length - 1;
          if (isLast) {
            return seconds >= step.start;
          }
          return seconds >= step.start && seconds < recipeData.steps[idx + 1].start;
        });
        if (stepIdx !== -1) {
          handleStepClick(stepIdx);
          setSeekTime({ stepIdx, seconds });
          setSeekKey(prev => prev + 1); // 강제 리마운트
        }
      },
    };
  }, [
    currentStep,
    totalSteps,
    handleStepClick,
    recipeData.steps,
    goToNext,
    goToPrevious,
    goToStep,
  ]);

  const { isListening, isVoiceDetected, transcript, error, isSupported } =
    useStepSpeechRecognition(carouselControls);

  // TIMESTAMP 명령이 있고, stepIdx와 currentStep이 일치하면 해당 초로, 아니면 현재 단계의 start
  const currentStepData = useMemo(() => {
    if (seekTime && seekTime.stepIdx === currentStep) {
      return { ...recipeData.steps[currentStep], start: seekTime.seconds };
    }
    return recipeData.steps[currentStep];
  }, [recipeData.steps, currentStep, seekTime]);
  const isLastStep = useMemo(() => currentStep === totalSteps - 1, [currentStep, totalSteps]);

  const handleBackPress = useCallback((): void => {
    onBackToRecipe();
  }, [onBackToRecipe]);

  // currentStep이 바뀌면, seekTime.stepIdx와 currentStep이 같을 때만 0.5초 후 seekTime 리셋
  React.useEffect(() => {
    if (seekTime && seekTime.stepIdx === currentStep) {
      const timer = setTimeout(() => setSeekTime(null), 500);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [seekTime, currentStep]);

  return (
    <div className="cooking-mode">
      {/* 헤더 */}
      <Header
        title={recipeData.title}
        currentStep={currentStep + 1}
        totalSteps={totalSteps}
        onBack={handleBackPress}
        showTimer={true}
      />

      {/* YouTube 영상 섹션 */}
      <YouTubePlayer
        youtubeEmbedId={recipeData.youtubeEmbedId}
        startTime={currentStepData.start}
        title={`${recipeData.title} - Step ${currentStep + 1}`}
        autoplay={true}
        youtubeKey={seekTime !== null ? seekKey : youtubeKey}
      />

      {/* 조리 단계 캐러셀 */}
      <section className="cooking-steps-container">
        {/* 단계 인디케이터 */}
        <StepDots totalSteps={totalSteps} currentStep={currentStep} onStepClick={handleStepClick} />

        {/* React Slick 캐러셀 */}
        <div className="carousel-container">
          <Slider ref={sliderRef} {...slickSettings}>
            {recipeData.steps.map((step, index) => (
              <StepCard
                key={`step-slide-${index}`}
                step={step}
                index={index}
                totalSteps={totalSteps}
              />
            ))}
          </Slider>
        </div>

        {/* 음성 인식 상태 표시 */}
        <SpeechRecognition
          isListening={isListening}
          isVoiceDetected={isVoiceDetected}
          transcript={transcript}
          error={error}
          isSupported={isSupported}
        />

        {/* 조리 완료 버튼 (마지막 단계일 때만) */}
        {isLastStep && (
          <div className="bottom-actions">
            <button
              className="finish-cooking-btn"
              onClick={onFinishCooking}
              type="button"
              aria-label="조리 완료"
            >
              조리 완료
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default RecipeStep;
