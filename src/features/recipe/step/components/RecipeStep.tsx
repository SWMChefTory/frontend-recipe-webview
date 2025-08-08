// src/features/recipe/step/components/RecipeStep.tsx (전체 코드)

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import Slider from 'react-slick';

import { Header, TimerModal, TimerPopover, YouTubePlayer, useGlobalTimer } from 'features/_common';
import TimerStartingModal from 'features/_common/components/Timer/TimerStartingModal/TimerStartingModal';
import { useAccessToken } from 'features/bridge';
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
  const [isTimerModalOpen, setIsTimerModalOpen] = useState(false);
  const [isTimerPopoverOpen, setIsTimerPopoverOpen] = useState(false);

  // 타이머 시작 알림 모달 관련 상태
  const [isStartingSoonModalOpen, setIsStartingSoonModalOpen] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [timerDuration, setTimerDuration] = useState({ minutes: 0, seconds: 0 });
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const accessToken = useAccessToken();
  const { timer, startTimer, pauseTimer, resumeTimer, stopTimer, formatTime } = useGlobalTimer();
  const { id: recipeId } = useParams<{ id: string }>();

  // 타이머와 인터벌 정리 함수
  const clearAllTimers = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // 5초 카운트다운 후 타이머 시작하는 함수
  const startTimerWithCountdown = (minutes: number, seconds: number) => {
    clearAllTimers(); // 기존 타이머/인터벌 정리
    setCountdown(5); // 카운트다운 5로 리셋
    setTimerDuration({ minutes, seconds }); // 타이머 시간 저장
    setIsStartingSoonModalOpen(true); // 모달 열기

    // 카운트다운 인터벌 시작
    intervalRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // 5초 후 타이머 시작
    timeoutRef.current = setTimeout(() => {
      startTimer(minutes, seconds);
      setIsStartingSoonModalOpen(false);
      clearAllTimers();
    }, 5000);
  };

  // 모달 닫기 핸들러
  const handleStartingModalClose = () => {
    setIsStartingSoonModalOpen(false);
    clearAllTimers();
  };

  // 타이머 취소 핸들러
  const handleTimerCancel = () => {
    setIsStartingSoonModalOpen(false);
    clearAllTimers();
  };

  const handleIntent = (intent: BasicIntent) => {
    const [cmd, arg1, arg2] = intent.split(' ');
    switch (cmd) {
      // ... 다른 case들은 동일 ...
      case 'NEXT':
        carouselControls.goToNext();
        break;
      case 'PREV':
        carouselControls.goToPrevious();
        break;
      case 'STEP': {
        const num = parseInt(arg1 ?? '', 10);
        if (!Number.isNaN(num) && num >= 1) {
          carouselControls.goToStep(num);
        }
        break;
      }
      case 'TIMESTAMP': {
        const secs = parseInt(arg1 ?? '', 10);
        if (!Number.isNaN(secs)) {
          carouselControls.seekTo(secs);
          ytRef.current?.seekTo(secs, true);
        }
        break;
      }
      case 'TIMER': {
        switch (arg1) {
          case 'START':
            setIsTimerModalOpen(true);
            break;
          case 'STOP':
            pauseTimer();
            break;
          case 'CHECK':
            setIsTimerPopoverOpen(true);
            break;
          case 'SET': {
            const totalSeconds = parseInt(arg2 ?? '0', 10);
            if (Number.isNaN(totalSeconds) || totalSeconds <= 0) break;

            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;

            startTimerWithCountdown(minutes, seconds);
            break;
          }
        }
        break;
      }
    }
  };

  const handleTimerClick = () => {
    if (timer.timeLeft > 0) {
      setIsTimerPopoverOpen(true);
    } else {
      setIsTimerModalOpen(true);
    }
  };

  const handleTimerModalClose = () => {
    setIsTimerModalOpen(false);
  };

  const handleTimerPopoverClose = () => {
    setIsTimerPopoverOpen(false);
  };

  const handleSetTimer = (minutes: number, seconds: number) => {
    startTimer(minutes, seconds);
  };

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, []);

  useSimpleSpeech({
    selectedSttModel,
    accessToken,
    recipeId: recipeId!,
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
        onTimerClick={handleTimerClick}
        timerTimeLeft={timer.timeLeft}
        formatTime={formatTime}
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

      <TimerModal
        isOpen={isTimerModalOpen}
        onClose={handleTimerModalClose}
        onSetTimer={handleSetTimer}
      />

      <TimerStartingModal
        isOpen={isStartingSoonModalOpen}
        countdown={countdown}
        timerTime={formatTime(timerDuration.minutes * 60 + timerDuration.seconds)}
        onClose={handleStartingModalClose}
        onCancel={handleTimerCancel}
      />

      <TimerPopover
        isOpen={isTimerPopoverOpen}
        onClose={handleTimerPopoverClose}
        timeLeft={timer.timeLeft}
        isRunning={timer.isRunning}
        formatTime={formatTime}
        onPause={pauseTimer}
        onResume={resumeTimer}
        onStop={stopTimer}
        initialTime={timer.initialTime}
      />
    </div>
  );
};

export default RecipeStep;
