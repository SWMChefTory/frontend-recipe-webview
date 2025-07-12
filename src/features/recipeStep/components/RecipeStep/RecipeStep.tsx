import React, { useCallback, useMemo } from 'react';
import Slider from 'react-slick';
import Header from '../../../core/components/Header/Header';
import YouTubePlayer from '../../../core/components/YouTube/YouTubePlayer';
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
  totalSteps: number 
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
            <li 
              key={`detail-${index}-${detailIndex}`} 
              className="step-description-item"
            >
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
  onBackToRecipe 
}: RecipeStepProps): JSX.Element => {
  const {
    sliderRef,
    currentStep,
    youtubeKey,
    handleStepClick,
    slickSettings
  } = useCarousel(recipeData);

  const totalSteps = useMemo(() => recipeData.steps.length, [recipeData.steps.length]);

  // 캐러셀 제어 객체 생성
  const carouselControls = useMemo(() => {
    console.log('=== carouselControls 생성 ===');
    console.log('현재 currentStep (0-based):', currentStep);
    console.log('totalSteps:', totalSteps);
    console.log('1-based currentStep:', currentStep + 1);
    
    return {
      goToNext: () => {
        console.log('=== goToNext 호출 ===');
        console.log('조건 체크:', currentStep, '<', totalSteps - 1, '=', currentStep < totalSteps - 1);
        if (currentStep < totalSteps - 1) {
          console.log('다음 단계로 이동:', currentStep, '->', currentStep + 1);
          handleStepClick(currentStep + 1);
          console.log('음성 명령: 다음 단계로 이동');
        } else {
          console.log('마지막 단계이므로 이동 불가');
        }
      },
      goToPrevious: () => {
        console.log('=== goToPrevious 호출 ===');
        console.log('조건 체크:', currentStep, '>', 0, '=', currentStep > 0);
        if (currentStep > 0) {
          console.log('이전 단계로 이동:', currentStep, '->', currentStep - 1);
          handleStepClick(currentStep - 1);
          console.log('음성 명령: 이전 단계로 이동');
        } else {
          console.log('첫 번째 단계이므로 이동 불가');
        }
      },
      goToStep: (step: number) => {
        console.log('=== goToStep 호출 ===');
        console.log('목표 step (1-based):', step);
        // 1-based를 0-based로 변환
        const stepIndex = step - 1;
        console.log('변환된 stepIndex (0-based):', stepIndex);
        console.log('조건 체크:', stepIndex, '>=', 0, '&&', stepIndex, '<', totalSteps);
        if (stepIndex >= 0 && stepIndex < totalSteps) {
          console.log('특정 단계로 이동:', currentStep, '->', stepIndex);
          handleStepClick(stepIndex);
          console.log(`음성 명령: ${step}번째 단계로 이동`);
        } else {
          console.log('잘못된 단계 번호:', step, '(허용 범위: 1-' + totalSteps + ')');
        }
      },
      currentStep: currentStep + 1, // 1-based로 반환
      totalSteps
    };
  }, [currentStep, totalSteps, handleStepClick]);

  const {
    isListening,
    isVoiceDetected,
    transcript,
    error,
    isSupported
  } = useStepSpeechRecognition(carouselControls);

  const currentStepData = useMemo(() => recipeData.steps[currentStep], [recipeData.steps, currentStep]);
  const isLastStep = useMemo(() => currentStep === totalSteps - 1, [currentStep, totalSteps]);

  const handleBackPress = useCallback((): void => {
    onBackToRecipe();
  }, [onBackToRecipe]);

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
        youtubeKey={youtubeKey}
      />

      {/* 조리 단계 캐러셀 */}
      <section className="cooking-steps-container">
        {/* 단계 인디케이터 */}
        <StepDots
          totalSteps={totalSteps}
          currentStep={currentStep}
          onStepClick={handleStepClick}
        />

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