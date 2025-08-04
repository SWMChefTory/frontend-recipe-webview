import { useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import Slider from 'react-slick';

import { useAccessToken } from 'features/bridge';
import Header from 'features/common/components/Header/Header';
import YouTubePlayer from 'features/common/components/YouTube/YouTubePlayer';
import { RecipeData } from 'features/recipe/detail/types/recipe';
import StepCard from 'features/recipe/step/components/StepCard';
import StepDots from 'features/recipe/step/components/StepDots';
import { useRecipeStepController } from 'features/recipe/step/hooks/useRecipeStepController';
import { useSimpleSpeech } from 'features/speech/hooks/useSimpleSpeech';
import { BasicIntent } from 'features/speech/types/parseIntent';

import 'features/recipe/step/components/RecipeStep.css';
import './VoiceIndicator.css';

interface Props {
  recipeData: RecipeData;
  onFinishCooking: () => void;
  onBackToRecipe: () => void;
  selectedSttModel: string;
}

const RecipeStep = ({ recipeData, onFinishCooking, onBackToRecipe, selectedSttModel }: Props) => {
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

  const ytRef = useRef<YT.Player | null>(null);
  const [volume, setVolume] = useState(0);

  const accessToken = useAccessToken();
  const { id: recipeId } = useParams<{ id: string }>();

  const handleIntent = (intent: BasicIntent) => {
    if (intent.startsWith('STEP')) {
      const num = parseInt(intent.slice(4), 10);
      if (!Number.isNaN(num) && num >= 1) {
        carouselControls.goToStep(num);
      }
      return;
    }
    const [cmd, arg] = intent.split(' ');
    switch (cmd) {
      case 'NEXT':
        carouselControls.goToNext();
        break;
      case 'PREV':
        carouselControls.goToPrevious();
        break;
      case 'TIMESTAMP': {
        const secs = parseInt(arg ?? '', 10);
        if (!Number.isNaN(secs)) {
          ytRef.current?.seekTo(secs, true);
          carouselControls.seekTo(secs);
        }
        break;
      }
    }
  };

  useSimpleSpeech({
    selectedSttModel,
    accessToken,
    recipeId: recipeId!,
    onVoiceStart: () => {
      // ytRef.current?.mute();
    },
    onVoiceEnd: () => {
      // ytRef.current?.unMute();
      // setVolume(0);
    },
    onIntent: handleIntent,
    onVolume: v => setVolume(v),
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
        <StepDots
          totalSteps={carouselControls.totalSteps}
          currentStep={currentStep}
          onStepClick={handleStepClick}
        />

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

        <div className="voice-indicator-wrapper">
          <div
            className="voice-indicator"
            style={{
              transform: `scale(${1 + volume * 1.2})`,
            }}
          />
        </div>

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
