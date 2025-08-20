// src/features/recipe/step/components/RecipeStep.tsx (전체 코드)

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import Slider from 'react-slick';

import { Header, TimerModal, TimerPopover, YouTubePlayer, useGlobalTimer } from 'features/_common';
import TimerStartingModal from 'features/_common/components/Timer/TimerStartingModal/TimerStartingModal';
import { useAccessToken } from 'features/bridge';
import { RecipeData } from 'features/recipe/detail/types/recipe';
import StepCard from 'features/recipe/step/components/StepCard';
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
  const { sliderRef, currentStep, slickSettings, currentStepData, carouselControls, isLastStep } =
    useRecipeStepController(recipeData);

  // 유튜브 플레이어 관련 상태
  const ytRef = useRef<YT.Player | null>(null);
  const skipNextAutoSeekRef = useRef<boolean>(false);

  // 음성 인디케이터 관련 상태
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [volume, setVolume] = useState(0);
  const voiceIndicatorRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [voicePosition, setVoicePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const INDICATOR_SIZE = 40;

  // 타이머 관련 상태
  const [isStartingSoonModalOpen, setIsStartingSoonModalOpen] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [timerDuration, setTimerDuration] = useState({ minutes: 0, seconds: 0 });
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isTimerModalOpen, setIsTimerModalOpen] = useState(false);
  const [isTimerPopoverOpen, setIsTimerPopoverOpen] = useState(false);

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
          skipNextAutoSeekRef.current = true;
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

  // 음성 인디케이터 초기 위치를 화면 하단 중앙에서 살짝 위로 설정
  useEffect(() => {
    const updateInitialPosition = () => {
      const container = containerRef.current;
      if (!container) return;
      const centerX = container.clientWidth / 2 - INDICATOR_SIZE / 2;
      const bottomOffset = 24; // 하단에서 24px 위
      const y = container.clientHeight - INDICATOR_SIZE - bottomOffset;
      const clampedX = Math.max(0, Math.min(centerX, container.clientWidth - INDICATOR_SIZE));
      const clampedY = Math.max(0, Math.min(y, container.clientHeight - INDICATOR_SIZE));
      setVoicePosition({ x: clampedX, y: clampedY });
    };

    updateInitialPosition();
    window.addEventListener('resize', updateInitialPosition);
    return () => window.removeEventListener('resize', updateInitialPosition);
  }, []);

  // 드래그 앤 드롭 핸들러
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;
    const target = voiceIndicatorRef.current;
    if (!target) return;
    e.preventDefault();
    e.stopPropagation();
    target.setPointerCapture(e.pointerId);
    setIsDragging(true);
    const containerRect = container.getBoundingClientRect();
    const startX = e.clientX - containerRect.left;
    const startY = e.clientY - containerRect.top;
    dragOffsetRef.current = { x: startX - voicePosition.x, y: startY - voicePosition.y };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const container = containerRef.current;
    if (!container) return;
    e.preventDefault();
    e.stopPropagation();
    const containerRect = container.getBoundingClientRect();
    const posX = e.clientX - containerRect.left - dragOffsetRef.current.x;
    const posY = e.clientY - containerRect.top - dragOffsetRef.current.y;
    const clampedX = Math.max(0, Math.min(posX, container.clientWidth - INDICATOR_SIZE));
    const clampedY = Math.max(0, Math.min(posY, container.clientHeight - INDICATOR_SIZE));
    setVoicePosition({ x: clampedX, y: clampedY });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const target = voiceIndicatorRef.current;
    if (target) {
      try {
        target.releasePointerCapture(e.pointerId);
      } catch {}
    }
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  // 모바일(개발자도구 포함)에서 포인터 캡처가 불안정할 때를 위한 전역 이벤트 핸들러
  useEffect(() => {
    if (!isDragging) return;
    const onPointerMove = (e: PointerEvent) => {
      const container = containerRef.current;
      if (!container) return;
      e.preventDefault();
      const containerRect = container.getBoundingClientRect();
      const posX = e.clientX - containerRect.left - dragOffsetRef.current.x;
      const posY = e.clientY - containerRect.top - dragOffsetRef.current.y;
      const clampedX = Math.max(0, Math.min(posX, container.clientWidth - INDICATOR_SIZE));
      const clampedY = Math.max(0, Math.min(posY, container.clientHeight - INDICATOR_SIZE));
      setVoicePosition({ x: clampedX, y: clampedY });
    };
    const endDrag = (e: PointerEvent) => {
      e.preventDefault();
      setIsDragging(false);
    };
    window.addEventListener('pointermove', onPointerMove, { passive: false });
    window.addEventListener('pointerup', endDrag, { passive: false });
    window.addEventListener('pointercancel', endDrag, { passive: false });
    return () => {
      window.removeEventListener('pointermove', onPointerMove as EventListener);
      window.removeEventListener('pointerup', endDrag as EventListener);
      window.removeEventListener('pointercancel', endDrag as EventListener);
    };
  }, [isDragging]);

  useSimpleSpeech({
    selectedSttModel,
    accessToken,
    recipeId: recipeId!,
    onIntent: handleIntent,
    onVolume: v => setVolume(v),
  });

  // 캐러셀 단계 변경 시 해당 단계 시작 시간으로 YouTube를 시킹
  useEffect(() => {
    const player = ytRef.current;
    if (!player) return;
    if (skipNextAutoSeekRef.current) {
      // 타임스탬프 명령 직후 자동 시킹 1회 스킵
      skipNextAutoSeekRef.current = false;
      return;
    }
    const startSeconds = currentStepData.start_time ?? 0;
    try {
      player.seekTo(startSeconds, true);
    } catch {}
  }, [currentStepData.start_time]);

  // 재생 시간이 현재 스텝 범위를 벗어나면 캐러셀을 해당 스텝으로 이동
  useEffect(() => {
    const interval = setInterval(() => {
      const player = ytRef.current;
      if (!player) return;
      let currentSeconds = 0;
      try {
        // getCurrentTime는 재생/일시정지와 무관하게 현재 시간을 반환
        if (typeof player.getCurrentTime === 'function') {
          currentSeconds = player.getCurrentTime();
        }
      } catch {
        return;
      }

      const steps = recipeData.recipe_steps;
      const startOfCurrent = steps[currentStep]?.start_time ?? 0;
      const startOfNext = steps[currentStep + 1]?.start_time ?? Number.POSITIVE_INFINITY;

      if (currentSeconds < startOfCurrent || currentSeconds >= startOfNext) {
        // 비디오 시간에 맞춰 캐러셀만 이동하고, 자동 시킹은 1회 스킵
        skipNextAutoSeekRef.current = true;
        carouselControls.seekTo(currentSeconds);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [currentStep, recipeData.recipe_steps, carouselControls]);

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
        title={`${recipeData.video_info.video_title} - Step ${currentStep + 1}`}
        autoplay
        onPlayerReady={player => {
          ytRef.current = player;
          const startSeconds = currentStepData.start_time ?? 0;
          player.seekTo(startSeconds, true);
        }}
      />

      <section className="cooking-steps-container" ref={containerRef}>
        <div className="carousel-container">
          <Slider ref={sliderRef} {...slickSettings}>
            {recipeData.recipe_steps.map((step, idx) => (
              <StepCard key={`step-${idx}`} step={step} index={idx} />
            ))}
          </Slider>
        </div>

        <div
          ref={voiceIndicatorRef}
          className={`voice-indicator-wrapper ${isDragging ? 'dragging' : ''}`}
          style={{
            left: `${voicePosition.x}px`,
            top: `${voicePosition.y}px`,
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <div className="voice-indicator-floater">
            <div
              className="voice-indicator"
              style={{
                transform: `scale(${1 + volume * 1.5})`,
              }}
            />
          </div>
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
