// src/features/recipe/step/components/RecipeStep.tsx (전체 코드)

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import Slider from 'react-slick';

import { Header, YouTubePlayer } from 'features/_common';
import { sendBridgeMessage, useAccessToken } from 'features/bridge';
import { RecipeData } from 'features/recipe/detail/types/recipe';
import StepCard from 'features/recipe/step/components/StepCard';
import { useRecipeStepController } from 'features/recipe/step/hooks/useRecipeStepController';
import { useSimpleSpeech } from 'features/speech/hooks/useSimpleSpeech';
import { BasicIntent } from 'features/speech/types/parseIntent';

import { WEBVIEW_MESSAGE_TYPES } from 'features/_common/constants';
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
  const [hasCustomPosition, setHasCustomPosition] = useState(false);
  const [showVoiceIndicator, setShowVoiceIndicator] = useState(false);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const INDICATOR_SIZE = 80;

  const accessToken = useAccessToken();
  const { id: recipeId } = useParams<{ id: string }>();

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
            sendBridgeMessage(WEBVIEW_MESSAGE_TYPES.TIMER_START, null, {
              recipe_id: recipeId ?? '',
              recipe_title: recipeData.video_info.video_title,
            });
            break;
          case 'STOP':
            sendBridgeMessage(WEBVIEW_MESSAGE_TYPES.TIMER_STOP, null, {
              recipe_id: recipeId ?? '',
              recipe_title: recipeData.video_info.video_title,
            });
            break;
          case 'CHECK':
            sendBridgeMessage(WEBVIEW_MESSAGE_TYPES.TIMER_CHECK, null, {
              recipe_id: recipeId ?? '',
              recipe_title: recipeData.video_info.video_title,
            });
            break;
          case 'SET': {
            sendBridgeMessage(WEBVIEW_MESSAGE_TYPES.TIMER_SET, null, {
              recipe_id: recipeId ?? '',
              recipe_title: recipeData.video_info.video_title,
              timer_time: arg2 ?? '0',
            });
            break;
          }
        }
        break;
      }
    }
  };

  const handleTimerClick = () => {
    sendBridgeMessage(WEBVIEW_MESSAGE_TYPES.TIMER_CHECK, null, {
      recipe_id: recipeId ?? '',
      recipe_title: recipeData.video_info.video_title,
    });
  };

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
    const posX = e.clientX - containerRect.left - INDICATOR_SIZE / 2;
    const posY = e.clientY - containerRect.top - INDICATOR_SIZE / 2;
    const clampedX = Math.max(0, Math.min(posX, container.clientWidth - INDICATOR_SIZE));
    const clampedY = Math.max(0, Math.min(posY, container.clientHeight - INDICATOR_SIZE));
    setHasCustomPosition(true);
    setVoicePosition({ x: clampedX, y: clampedY });
    dragOffsetRef.current = { x: INDICATOR_SIZE / 2, y: INDICATOR_SIZE / 2 };
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
    onKwsDetection: probability => {
      // KWS 확률은 로그로만 출력 (필요시 UI에 표시 가능)
      if (probability > 0.1) {
        // 노이즈 필터링
      }
    },
    onKwsActivate: () => {
      setShowVoiceIndicator(true);
    },
    onKwsDeactivate: () => {
      setShowVoiceIndicator(false);
    },
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
        onTimerClick={handleTimerClick}
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

        {showVoiceIndicator && (
          <div
            ref={voiceIndicatorRef}
            className={`voice-indicator-wrapper ${isDragging ? 'dragging' : ''}`}
            style={
              hasCustomPosition
                ? {
                    left: `${voicePosition.x}px`,
                    top: `${voicePosition.y}px`,
                    transform: 'none',
                  }
                : undefined
            }
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            <div className="voice-indicator-floater">
              <div
                className="voice-indicator"
                style={{
                  transform: `scale(${1 + volume * 0.3})`, // Siri 스타일로 볼륨 반응 조정
                }}
              >
                {/* 웨이브 레이어들 */}
                <div className="voice-indicator-wave" />
                <div className="voice-indicator-wave" />
                <div className="voice-indicator-wave" />
                {/* 중앙 코어 */}
                <div
                  className="voice-indicator-core"
                  style={{
                    transform: `scale(${1 + volume * 0.5})`, // 볼륨에 따른 코어 크기 조정
                  }}
                />
              </div>
            </div>
          </div>
        )}

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
