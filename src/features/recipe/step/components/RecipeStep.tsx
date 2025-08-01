import { useRef, useState } from 'react';
import Slider from 'react-slick';

import Header from 'features/common/components/Header/Header';
import YouTubePlayer from 'features/common/components/YouTube/YouTubePlayer';
import { RecipeData } from 'features/recipe/detail/types/recipe';
import StepCard from 'features/recipe/step/components/StepCard';
import StepDots from 'features/recipe/step/components/StepDots';
import { useRecipeStepController } from 'features/recipe/step/hooks/useRecipeStepController';
import { useSimpleSpeech } from 'features/speech/hooks/useSimpleSpeech';
import { BasicIntent } from 'features/speech/types/parseIntent';

import 'features/recipe/step/components/RecipeStep.css'; // 기존 스타일
import './VoiceIndicator.css'; // 새 스타일

interface Props {
  recipeData: RecipeData;
  onFinishCooking: () => void;
  onBackToRecipe: () => void;
  selectedSttModel: string;
  accessToken: string | null;
  recipeId: string;
}

const RecipeStep = ({
  recipeData,
  onFinishCooking,
  onBackToRecipe,
  selectedSttModel,
  accessToken,
  recipeId,
}: Props) => {
  /* ───────── 슬라이더·단계 컨트롤 ───────── */
  const {
    sliderRef,
    currentStep,
    slickSettings,
    youtubeKey,
    currentStepData,
    carouselControls,
    handleStepClick,
    isLastStep,
  } = useRecipeStepController(recipeData);

  /* ───────── YouTube 플레이어 참조 ───────── */
  const ytRef = useRef<YT.Player | null>(null);

  /* ───────── 음성 감지 UI 상태 ───────── */
  const [voiceActive, setVoiceActive] = useState(false);

  const handleIntent = (intent: BasicIntent) => {
    if (intent.startsWith('STEP')) {
      const num = parseInt(intent.slice(4), 10);
      if (!Number.isNaN(num) && num >= 1) {
        carouselControls.goToStep(num);
      }
      return;
    }

    const [cmd, arg] = (typeof intent === 'string' ? intent : '').split(' ');

    switch (cmd) {
      case 'NEXT': {
        carouselControls.goToNext();
        break;
      }
      case 'PREV': {
        carouselControls.goToPrevious();
        break;
      }
      case 'TIMESTAMP': {
        const secs = parseInt(arg ?? '', 10);
        console.log(secs);
        if (!Number.isNaN(secs)) {
          ytRef.current?.seekTo(secs, true);
          carouselControls.seekTo(secs);
        }
        break;
      }
      default:
        break;
    }
  };

  /* 음성 훅: VAD → Mute / Un-Mute + Indicator */
  useSimpleSpeech({
    selectedSttModel,
    accessToken,
    recipeId,
    onVoiceStart: () => {
      ytRef.current?.mute();
      setVoiceActive(true);
    },
    onVoiceEnd: () => {
      ytRef.current?.unMute();
      setVoiceActive(false);
    },
    onIntent: handleIntent,
  });

  return (
    <div className="cooking-mode">
      <Header
        title={recipeData.video_info.video_title}
        currentStep={currentStep + 1}
        totalSteps={carouselControls.totalSteps}
        onBack={onBackToRecipe}
        showTimer
      />

      <YouTubePlayer
        youtubeEmbedId={recipeData.video_info.video_id}
        startTime={currentStepData.start_time}
        title={`${recipeData.video_info.video_title} - Step ${currentStep + 1}`}
        autoplay
        youtubeKey={youtubeKey}
        onPlayerReady={player => (ytRef.current = player)}
      />

      <section className="cooking-steps-container">
        {/* ───────── 상단 점 ───────── */}
        <StepDots
          totalSteps={carouselControls.totalSteps}
          currentStep={currentStep}
          onStepClick={handleStepClick}
        />

        {/* ───────── 슬라이더 ───────── */}
        <div className="carousel-container">
          <Slider ref={sliderRef} {...slickSettings}>
            {recipeData.recipe_steps.map((step, idx) => (
              <StepCard
                key={`step-${idx}`}
                step={step}
                index={idx}
                totalSteps={carouselControls.totalSteps}
              />
            ))}
          </Slider>
        </div>

        {/* ───────── 음성 인식 표시 ───────── */}
        <div className="voice-indicator-wrapper">
          {voiceActive && (
            <div className="voice-indicator" aria-label="Listening">
              <span className="bar bar1" />
              <span className="bar bar2" />
              <span className="bar bar3" />
              <span className="bar bar4" />
            </div>
          )}
        </div>

        {/* ───────── 하단 버튼 ───────── */}
        {isLastStep && (
          <div className="bottom-actions">
            <button className="finish-cooking-btn" onClick={onFinishCooking} type="button">
              조리 완료
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default RecipeStep;
