// src/features/recipe/step/components/RecipeStep.tsx (전체 코드)

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import Slider from 'react-slick';

import { Header, YouTubePlayer } from '_common';
import { sendBridgeMessage, useAccessToken } from 'bridge';
import { RecipeData } from 'recipe/detail/types/recipe';
import StepCard from 'recipe/step/components/StepCard';
import VoiceGuide from 'recipe/step/components/VoiceGuide';
import { useRecipeStepController } from 'recipe/step/hooks/useRecipeStepController';
import { useSimpleSpeech } from 'speech/hooks/useSimpleSpeech';
import { BasicIntent } from 'speech/types/parseIntent';

import { WEBVIEW_MESSAGE_TYPES } from '_common/constants';
import 'recipe/step/components/RecipeStep.css';

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

  // 음성 가이드 관련 상태
  const [isKwsActive, setIsKwsActive] = useState(false);
  const [showVoiceGuide, setShowVoiceGuide] = useState(false);

  const accessToken = useAccessToken();
  const { id: recipeId } = useParams<{ id: string }>();

  const handleIntent = (intent: BasicIntent) => {
    const [cmd, arg1, arg2] = intent.split(' ');

    // WAKEWORD 처리: KWS가 비활성화 상태일 때만 활성화
    if (cmd === 'WAKEWORD') {
      if (!isKwsActive) {
        setIsKwsActive(true);
      }
      return;
    }

    // 다른 명령들은 KWS가 활성화된 상태에서만 실행
    if (!isKwsActive) {
      return;
    }

    // 유효한 명령이 실행되면 KWS 비활성화
    let commandExecuted = false;

    switch (cmd) {
      case 'NEXT':
        carouselControls.goToNext();
        commandExecuted = true;
        break;
      case 'PREV':
        carouselControls.goToPrevious();
        commandExecuted = true;
        break;
      case 'STEP': {
        const num = parseInt(arg1 ?? '', 10);
        if (!Number.isNaN(num) && num >= 1) {
          carouselControls.goToStep(num);
          commandExecuted = true;
        }
        break;
      }
      case 'TIMESTAMP': {
        const secs = parseInt(arg1 ?? '', 10);
        if (!Number.isNaN(secs)) {
          skipNextAutoSeekRef.current = true;
          carouselControls.seekTo(secs);
          ytRef.current?.seekTo(secs, true);
          commandExecuted = true;
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
            commandExecuted = true;
            break;
          case 'STOP':
            sendBridgeMessage(WEBVIEW_MESSAGE_TYPES.TIMER_STOP, null, {
              recipe_id: recipeId ?? '',
              recipe_title: recipeData.video_info.video_title,
            });
            commandExecuted = true;
            break;
          case 'CHECK':
            sendBridgeMessage(WEBVIEW_MESSAGE_TYPES.TIMER_CHECK, null, {
              recipe_id: recipeId ?? '',
              recipe_title: recipeData.video_info.video_title,
            });
            commandExecuted = true;
            break;
          case 'SET': {
            sendBridgeMessage(WEBVIEW_MESSAGE_TYPES.TIMER_SET, null, {
              recipe_id: recipeId ?? '',
              recipe_title: recipeData.video_info.video_title,
              timer_time: arg2 ?? '0',
            });
            commandExecuted = true;
            break;
          }
        }
        break;
      }
    }

    // 명령이 실행되었으면 KWS 비활성화
    if (commandExecuted) {
      setIsKwsActive(false);
    }
  };

  const handleTimerClick = () => {
    sendBridgeMessage(WEBVIEW_MESSAGE_TYPES.TIMER_CHECK, null, {
      recipe_id: recipeId ?? '',
      recipe_title: recipeData.video_info.video_title,
    });
  };

  const handleVoiceGuideOpen = () => {
    setShowVoiceGuide(true);
  };

  const handleVoiceGuideClose = () => {
    setShowVoiceGuide(false);
  };

  useSimpleSpeech({
    selectedSttModel,
    accessToken,
    recipeId: recipeId!,
    onIntent: handleIntent,
    onKwsDetection: probability => {
      // KWS 확률은 로그로만 출력 (필요시 UI에 표시 가능)
      if (probability > 0.1) {
        // 노이즈 필터링
      }
    },
    onKwsActivate: () => {
      setIsKwsActive(true);
    },
    onKwsDeactivate: () => {
      setIsKwsActive(false);
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

      <section className="cooking-steps-container">
        <div className="carousel-container">
          <Slider ref={sliderRef} {...slickSettings}>
            {recipeData.recipe_steps.map((step, idx) => (
              <StepCard key={`step-${idx}`} step={step} index={idx} />
            ))}
          </Slider>
        </div>

        {isLastStep && (
          <div className="bottom-actions">
            <button className="finish-cooking-btn" onClick={onFinishCooking} type="button">
              조리 완료
            </button>
          </div>
        )}
      </section>

      {/* 플로팅 음성 가이드 버튼 */}
      <div className={`floating-voice-guide-container ${isKwsActive ? 'kws-active' : ''}`}>
        <div className="speech-bubble">
          <div className="speech-bubble-text">"토리야"라고 말해보세요</div>
          <div className="speech-bubble-arrow"></div>
        </div>
        <button
          className="floating-voice-guide-btn"
          onClick={handleVoiceGuideOpen}
          aria-label="음성 명령 가이드"
          type="button"
        >
          <img
            src={isKwsActive ? '/tori-listening.png' : '/tori-idle.png'}
            alt={isKwsActive ? '토리 듣는 중' : '토리 대기 중'}
          />
        </button>
      </div>

      <VoiceGuide isVisible={showVoiceGuide} onClose={handleVoiceGuideClose} />
    </div>
  );
};

export default RecipeStep;
