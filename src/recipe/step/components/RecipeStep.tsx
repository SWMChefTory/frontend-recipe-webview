import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Header, YouTubePlayer } from '_common';
import { sendBridgeMessage, useAccessToken } from 'bridge';
import { RecipeData } from 'recipe/detail/types/recipe';
import VoiceGuide from 'recipe/step/components/VoiceGuide';
import { useSimpleSpeech } from 'speech/hooks/useSimpleSpeech';
import { BasicIntent } from 'speech/types/parseIntent';

import { WEBVIEW_MESSAGE_TYPES } from '_common/constants';
import 'recipe/step/components/RecipeStep.css';
import { useRecipeStepNavigation } from '../hooks/useRecipeStepNavigation';
import './Overlay.css';

interface Props {
  recipeData: RecipeData;
  onBackToRecipe: () => void;
}

interface SegmentInfo {
  startTime: number;
  endTime: number;
  isCompleted: boolean;
  isCurrent: boolean;
  progress: number; // 0-1 for current segment
}

function ProgressBar({
  recipeData,
  currentStep,
  currentDetailIndex,
  currentTime,
}: {
  recipeData: RecipeData;
  currentStep: number;
  currentDetailIndex: number;
  currentTime: number;
}) {
  // 모든 세그먼트 정보를 계산
  const calculateSegments = (): SegmentInfo[] => {
    const segments: SegmentInfo[] = [];

    recipeData.recipe_steps.forEach((step, stepIndex) => {
      step.details.forEach((detail, detailIndex) => {
        const startTime = detail.start;

        // 다음 detail의 시작 시간을 찾기
        let endTime: number;
        if (detailIndex < step.details.length - 1) {
          // 같은 step 내 다음 detail
          endTime = step.details[detailIndex + 1].start;
        } else if (stepIndex < recipeData.recipe_steps.length - 1) {
          // 다음 step의 첫 번째 detail
          endTime = recipeData.recipe_steps[stepIndex + 1].details[0].start;
        } else {
          // 마지막 detail인 경우 비디오 끝까지
          endTime = recipeData.video_info.video_seconds || startTime + 10; // fallback
        }

        const isCurrent = stepIndex === currentStep && detailIndex === currentDetailIndex;
        const isCompleted = currentTime > endTime;

        let progress = 0;
        if (isCurrent && currentTime >= startTime) {
          progress = Math.min((currentTime - startTime) / (endTime - startTime), 1);
        }

        segments.push({
          startTime,
          endTime,
          isCompleted,
          isCurrent,
          progress,
        });
      });
    });

    return segments;
  };

  const segments = calculateSegments();

  return (
    <div className="progress-bar-container">
      <div className="progress-bar">
        {segments.map((segment, index) => (
          <div
            key={index}
            className={`progress-segment ${
              segment.isCompleted ? 'completed' : segment.isCurrent ? 'current' : 'pending'
            }`}
          >
            <div
              className="progress-fill"
              style={{
                width: segment.isCompleted
                  ? '100%'
                  : segment.isCurrent
                    ? `${segment.progress * 100}%`
                    : '0%',
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function LoadingOverlay() {
  return (
    <div className="loading-overlay">
      <div className="loading-content">
        <div className="spinner"></div>
        <p className="loading-message">로딩중...</p>
      </div>
    </div>
  );
}

const RecipeStep = ({ recipeData, onBackToRecipe }: Props) => {
  // 음성 가이드 관련 상태
  const [isKwsActive, setIsKwsActive] = useState(false);
  const [showVoiceGuide, setShowVoiceGuide] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const accessToken = useAccessToken();
  const { id: recipeId } = useParams<{ id: string }>();

  const ytRef = useRef<YT.Player | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Function to find the appropriate step based on current playback time
  const findStepByTime = useCallback(
    (currentTime: number) => {
      // Get the first step's first detail start time
      const firstStep = recipeData.recipe_steps[0];
      const firstDetailStart = firstStep?.details[0]?.start || 0;

      // If current time is before the first step, return first step
      if (currentTime < firstDetailStart) {
        return { stepIndex: 0, detailIndex: 0 };
      }

      for (let stepIndex = 0; stepIndex < recipeData.recipe_steps.length; stepIndex++) {
        const step = recipeData.recipe_steps[stepIndex];
        for (let detailIndex = 0; detailIndex < step.details.length; detailIndex++) {
          const detail = step.details[detailIndex];
          if (currentTime >= detail.start) {
            // Check if this is the last detail or if the next detail starts after current time
            const isLastDetail = detailIndex === step.details.length - 1;
            const nextDetail = !isLastDetail ? step.details[detailIndex + 1] : null;
            const nextStep =
              stepIndex < recipeData.recipe_steps.length - 1
                ? recipeData.recipe_steps[stepIndex + 1]
                : null;
            const nextDetailStart = nextDetail?.start || nextStep?.details[0]?.start || Infinity;

            if (currentTime < nextDetailStart) {
              return { stepIndex, detailIndex };
            }
          }
        }
      }
      // If no step found, return the last step's last detail
      const lastStep = recipeData.recipe_steps[recipeData.recipe_steps.length - 1];
      return {
        stepIndex: recipeData.recipe_steps.length - 1,
        detailIndex: lastStep.details.length - 1,
      };
    },
    [recipeData.recipe_steps],
  );

  const {
    currentStep,
    currentDetailIndex,
    setCurrentStep,
    setCurrentDetailIndex,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    handleContainerClick,
    getCurrentStepDisplay,
    getNextStepDisplay,
  } = useRecipeStepNavigation({
    recipeData,
    ytRef,
    onTimeUpdate: () => {
      // 단계 이동 시 시간만 업데이트
      if (ytRef.current) {
        const currentTime = ytRef.current.getCurrentTime();
        setCurrentTime(currentTime);
      }
    },
  });

  // Handle YouTube time updates
  const handleTimeUpdate = useCallback(() => {
    if (!ytRef.current) return;

    const currentTime = ytRef.current.getCurrentTime();
    setCurrentTime(currentTime);

    const { stepIndex, detailIndex } = findStepByTime(currentTime);

    // Only update if the step or detail has changed
    if (stepIndex !== currentStep || detailIndex !== currentDetailIndex) {
      setCurrentStep(stepIndex);
      setCurrentDetailIndex(detailIndex);
    }
  }, [currentStep, currentDetailIndex, setCurrentStep, setCurrentDetailIndex, findStepByTime]);

  // Handle YouTube state changes (including seeking)
  const handleStateChange = useCallback(
    (event: YT.OnStateChangeEvent) => {
      // 상태가 변경될 때마다 즉시 시간 업데이트
      if (event.data === YT.PlayerState.PLAYING || event.data === YT.PlayerState.PAUSED) {
        handleTimeUpdate();
      }
    },
    [handleTimeUpdate],
  );

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
        goToNextStep();
        commandExecuted = true;
        break;
      case 'PREV':
        goToPreviousStep();
        commandExecuted = true;
        break;
      case 'STEP': {
        const num = parseInt(arg1 ?? '', 10);
        if (!Number.isNaN(num)) {
          goToStep(num);
        }
        commandExecuted = true;
        break;
      }
      case 'TIMESTAMP': {
        const secs = parseInt(arg1 ?? '', 10);
        if (!Number.isNaN(secs) && ytRef.current) {
          ytRef.current.seekTo(secs, true);
          commandExecuted = true;
        }
        break;
      }
      case 'VIDEO': {
        switch (arg1) {
          case 'PLAY':
            ytRef.current?.playVideo();
            commandExecuted = true;
            break;
          case 'STOP':
            ytRef.current?.pauseVideo();
            commandExecuted = true;
            break;
        }
        break;
      }
      //TODO : 버튼 컴포넌트로 캡슐화
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

  //TODO : 버튼 컴포넌트로 캡슐화
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

  // Set up YouTube time update listener
  useEffect(() => {
    if (!ytRef.current || !isInitialized) return;

    const interval = setInterval(handleTimeUpdate, 100); // Check every 100ms for smoother updates

    return () => {
      clearInterval(interval);
    };
  }, [isInitialized, currentStep, currentDetailIndex, handleTimeUpdate]);

  return (
    <div className="cooking-mode safe-area safe-area-top safe-area-bottom">
      {!isInitialized && <LoadingOverlay />}
      <Header
        title={recipeData.video_info.video_title}
        currentStep={currentStep + 1}
        totalSteps={recipeData.recipe_steps.length}
        onBack={onBackToRecipe}
      />

      <YouTubePlayer
        youtubeEmbedId={recipeData.video_info.video_id}
        title={`${recipeData.video_info.video_title} - Step ${currentStep + 1}`}
        autoplay
        onPlayerReady={player => {
          ytRef.current = player;
          setIsInitialized(true);
        }}
        onStateChange={handleStateChange}
      />

      <div className="cooking-steps-wrapper">
        <ProgressBar
          recipeData={recipeData}
          currentStep={currentStep}
          currentDetailIndex={currentDetailIndex}
          currentTime={currentTime}
        />
        <section className="cooking-steps-container" onClick={handleContainerClick}>
          {(() => {
            const currentDisplay = getCurrentStepDisplay();
            const nextDisplay = getNextStepDisplay();

            return (
              <>
                <div className="steps-header">
                  <h2 className="steps-title">
                    {currentDisplay.alphabetPrefix}. {currentDisplay.subtitle}
                  </h2>
                </div>

                <div className="current-step">
                  <>
                    <span className="step-number">{currentDisplay.globalStepNumber}.</span>
                    <span className="step-text">{currentDisplay.detailText}</span>
                  </>
                </div>

                {nextDisplay.subtitle && (
                  <div className="steps-header">
                    <span className="steps-title">
                      {nextDisplay.alphabetPrefix}. {nextDisplay.subtitle}
                    </span>
                  </div>
                )}

                <div className="next-step">
                  {nextDisplay.isRecipeEnd ? (
                    <span className="next-step-text">{nextDisplay.detailText}</span>
                  ) : (
                    <>
                      <span className="next-step-number">{nextDisplay.globalStepNumber}.</span>
                      <span className="next-step-text">{nextDisplay.detailText}</span>
                    </>
                  )}
                </div>
              </>
            );
          })()}
        </section>
      </div>

      {/* 플로팅 음성 가이드 버튼 */}
      {/* 왼쪽 하단 플로팅 타이머 버튼 */}
      {/* TODO : 버튼 컴포넌트 분리 */}
      <div className="floating-timer-container">
        <button
          className="floating-timer-btn"
          onClick={handleTimerClick}
          aria-label="타이머"
          type="button"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="13" r="8" stroke="#ff4500" strokeWidth="2" />
            <path
              d="M12 9v4l3 2"
              stroke="#ff4500"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M9 3h6" stroke="#ff4500" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* TODO : 버튼 컴포넌트 분리 */}
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
