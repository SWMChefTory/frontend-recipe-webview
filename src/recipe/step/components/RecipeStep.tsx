import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Header, YouTubePlayer, useOrientation } from '_common';
import { sendBridgeMessage, useAccessToken } from 'bridge';
import { RecipeData } from 'recipe/detail/types/recipe';
import VoiceGuide from 'recipe/step/components/VoiceGuide';
import { useSimpleSpeech } from 'speech/hooks/useSimpleSpeech';
import { BasicIntent } from 'speech/types/parseIntent';

import { WEBVIEW_MESSAGE_TYPES } from '_common/constants';
import { useRecipeStepNavigation } from '../hooks/useRecipeStepNavigation';
import './RecipeStep.css';
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
  progress: number;
}

interface FlatDetail {
  stepIndex: number;
  detailIndex: number;
  start: number;
}

function ProgressBar({
  recipeData,
  currentStep,
  currentTime,
}: {
  recipeData: RecipeData;
  currentStep: number;
  currentDetailIndex: number;
  currentTime: number;
}) {
  const segments = useMemo((): SegmentInfo[] => {
    return recipeData.recipe_steps.map((step, stepIndex) => {
      const startTime = step.details[0]?.start || 0;
      
      const endTime =
        stepIndex < recipeData.recipe_steps.length - 1
          ? recipeData.recipe_steps[stepIndex + 1].details[0]?.start || startTime + 10
          : recipeData.video_info.video_seconds || startTime + 10;

      const isCurrent = stepIndex === currentStep;
      const isCompleted = stepIndex < currentStep;
      
      let progress = 0;
      if (isCurrent && currentTime >= startTime) {
        progress = Math.min((currentTime - startTime) / (endTime - startTime), 1);
      }

      return { startTime, endTime, isCompleted, isCurrent, progress };
    });
  }, [recipeData, currentStep, currentTime]);

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
  const [isKwsActive, setIsKwsActive] = useState(false);
  const [showVoiceGuide, setShowVoiceGuide] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const isLandscape = useOrientation();
  const accessToken = useAccessToken();
  const { id: recipeId } = useParams<{ id: string }>();

  const ytRef = useRef<YT.Player | null>(null);
  const currentStepRef = useRef<HTMLDivElement>(null);

  const allDetails = useMemo((): FlatDetail[] => {
    const flat: FlatDetail[] = [];
    recipeData.recipe_steps.forEach((step, stepIndex) => {
      step.details.forEach((detail, detailIndex) => {
        flat.push({ stepIndex, detailIndex, start: detail.start });
      });
    });
    return flat;
  }, [recipeData.recipe_steps]);

  const findStepByTime = useCallback(
    (currentTime: number): { stepIndex: number; detailIndex: number } => {
      if (allDetails.length === 0) {
        return { stepIndex: 0, detailIndex: 0 };
      }

      const firstStart = allDetails[0].start;
      if (currentTime < firstStart) {
        return { stepIndex: 0, detailIndex: 0 };
      }

      for (let i = allDetails.length - 1; i >= 0; i--) {
        if (currentTime >= allDetails[i].start) {
          return {
            stepIndex: allDetails[i].stepIndex,
            detailIndex: allDetails[i].detailIndex,
          };
        }
      }

      const last = allDetails[allDetails.length - 1];
      return { stepIndex: last.stepIndex, detailIndex: last.detailIndex };
    },
    [allDetails],
  );

  const {
    currentStep,
    currentDetailIndex,
    setCurrentStep,
    setCurrentDetailIndex,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    goToSpecificDetail,
    getCurrentStepDisplay,
    getNextStepsPreview,
    getAllPreviousSteps,
  } = useRecipeStepNavigation({
    recipeData,
    ytRef,
    onTimeUpdate: () => {
      if (ytRef.current) {
        setCurrentTime(ytRef.current.getCurrentTime());
      }
    },
  });

  const handleTimeUpdate = useCallback(() => {
    if (!ytRef.current) return;

    const currentTime = ytRef.current.getCurrentTime();
    setCurrentTime(currentTime);

    const { stepIndex, detailIndex } = findStepByTime(currentTime);

    if (stepIndex !== currentStep || detailIndex !== currentDetailIndex) {
      setCurrentStep(stepIndex);
      setCurrentDetailIndex(detailIndex);
    }
  }, [currentStep, currentDetailIndex, setCurrentStep, setCurrentDetailIndex, findStepByTime]);

  const handleStateChange = useCallback(
    (event: YT.OnStateChangeEvent) => {
      if (event.data === YT.PlayerState.PLAYING || event.data === YT.PlayerState.PAUSED) {
        handleTimeUpdate();
      }
    },
    [handleTimeUpdate],
  );

  const handleIntent = (intent: BasicIntent) => {
    const [cmd, arg1, arg2] = intent.split(' ');

    if (cmd === 'WAKEWORD') {
      if (!isKwsActive) {
        setIsKwsActive(true);
      }
      return;
    }

    if (!isKwsActive) return;

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
      case 'VIDEO':
        if (arg1 === 'PLAY') {
          ytRef.current?.playVideo();
          commandExecuted = true;
        } else if (arg1 === 'STOP') {
          ytRef.current?.pauseVideo();
          commandExecuted = true;
        }
        break;
      case 'TIMER': {
        const timerData = {
          recipe_id: recipeId ?? '',
          recipe_title: recipeData.video_info.video_title,
        };

        switch (arg1) {
          case 'START':
            sendBridgeMessage(WEBVIEW_MESSAGE_TYPES.TIMER_START, null, timerData);
            commandExecuted = true;
            break;
          case 'STOP':
            sendBridgeMessage(WEBVIEW_MESSAGE_TYPES.TIMER_STOP, null, timerData);
            commandExecuted = true;
            break;
          case 'CHECK':
            sendBridgeMessage(WEBVIEW_MESSAGE_TYPES.TIMER_CHECK, null, timerData);
            commandExecuted = true;
            break;
          case 'SET':
            sendBridgeMessage(WEBVIEW_MESSAGE_TYPES.TIMER_SET, null, {
              ...timerData,
              timer_time: arg2 ?? '0',
            });
            commandExecuted = true;
            break;
        }
        break;
      }
    }

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

  const handleHeaderDragStart = useCallback((e: TouchEvent | MouseEvent) => {
    if (!isLandscape) return;
    
    e.preventDefault();
    setIsDragging(true);
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setDragStartY(clientY);
  }, [isLandscape]);

  const handleHeaderDragMove = useCallback((e: TouchEvent | MouseEvent) => {
    if (!isDragging || !isLandscape) return;
    
    e.preventDefault();
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const deltaY = clientY - dragStartY;
    
    if (deltaY > 30) {
      setIsHeaderVisible(true);
      setIsDragging(false);
    } else if (deltaY < -30) {
      setIsHeaderVisible(false);
      setIsDragging(false);
    }
  }, [isDragging, isLandscape, dragStartY]);

  const handleHeaderDragEnd = useCallback((e: TouchEvent | MouseEvent) => {
    if (!isLandscape) return;
    e.preventDefault();
    setIsDragging(false);
  }, [isLandscape]);

  useSimpleSpeech({
    accessToken,
    recipeId: recipeId!,
    onIntent: handleIntent,
    onKwsDetection: probability => {
      if (probability > 0.1) {
      }
    },
    onKwsActivate: () => setIsKwsActive(true),
    onKwsDeactivate: () => setIsKwsActive(false),
  });

  
  useEffect(() => {
    if (!ytRef.current || !isInitialized) return;

    const interval = setInterval(handleTimeUpdate, 200);
    return () => clearInterval(interval);
  }, [isInitialized, handleTimeUpdate]);

  useEffect(() => {
    if (!isLandscape) {
      setIsHeaderVisible(true);
      return;
    }

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDelta = currentScrollY - lastScrollY;
      
      if (scrollDelta > 15 && currentScrollY > 50) {
        setIsHeaderVisible(true);
      } else if (scrollDelta < -15) {
        setIsHeaderVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLandscape, lastScrollY]);

  useEffect(() => {
    if (!isLandscape) return;

    const headerHandle = document.querySelector('.header-handle');
    if (!headerHandle) return;

    const listeners = [
      { type: 'touchstart', handler: handleHeaderDragStart },
      { type: 'touchmove', handler: handleHeaderDragMove },
      { type: 'touchend', handler: handleHeaderDragEnd },
      { type: 'mousedown', handler: handleHeaderDragStart },
      { type: 'mousemove', handler: handleHeaderDragMove },
      { type: 'mouseup', handler: handleHeaderDragEnd },
    ];

    listeners.forEach(({ type, handler }) => {
      headerHandle.addEventListener(type, handler as EventListener, 
        type.startsWith('touch') ? { passive: false } : undefined
      );
    });

    return () => {
      listeners.forEach(({ type, handler }) => {
        headerHandle.removeEventListener(type, handler as EventListener);
      });
    };
  }, [isLandscape, handleHeaderDragStart, handleHeaderDragMove, handleHeaderDragEnd]);

  useEffect(() => {
    if (!isLandscape) return;

    const handleTopTouch = (e: TouchEvent) => {
      const touchY = e.touches[0].clientY;
      if (touchY < 50 && !isHeaderVisible) {
        setIsHeaderVisible(true);
      }
    };

    document.addEventListener('touchstart', handleTopTouch, { passive: true });
    return () => document.removeEventListener('touchstart', handleTopTouch);
  }, [isLandscape, isHeaderVisible]);

  useEffect(() => {
    if (!isLandscape || !isHeaderVisible) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      const header = document.querySelector('.header');
      
      if (header && !header.contains(target)) {
        setIsHeaderVisible(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('touchend', handleClickOutside as EventListener);

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('touchend', handleClickOutside as EventListener);
    };
  }, [isLandscape, isHeaderVisible]);

  useEffect(() => {
    if (!currentStepRef.current) return;

    currentStepRef.current.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }, [currentStep, currentDetailIndex]);

  const renderSteps = () => {
    const currentDisplay = getCurrentStepDisplay();
    const nextSteps = getNextStepsPreview();
    const previousSteps = getAllPreviousSteps();

    return (
      <>
        {previousSteps.map((prevStep, index) => (
          <div key={`prev-${index}`}>
            {prevStep.subtitle && (
              <div className="steps-header">
                <span className="steps-title">
                  {prevStep.alphabetPrefix}. {prevStep.subtitle}
                </span>
              </div>
            )}

            <div 
              className="previous-step clickable"
              onClick={(e) => {
                e.stopPropagation();
                goToSpecificDetail(prevStep.stepIndex, prevStep.detailIndex);
              }}
            >
              <span className="previous-step-number">{prevStep.globalStepNumber}.</span>
              <span className="previous-step-text">{prevStep.detailText}</span>
            </div>
          </div>
        ))}

        <div className="steps-header">
          <h2 className="steps-title">
            {currentDisplay.alphabetPrefix}. {currentDisplay.subtitle}
          </h2>
        </div>

        <div className="current-step" ref={currentStepRef}>
          <span className="step-number">{currentDisplay.globalStepNumber}.</span>
          <span className="step-text">{currentDisplay.detailText}</span>
        </div>

        {nextSteps.map((nextStep, index) => (
          <div key={`next-${index}`}>
            {nextStep.subtitle && (
              <div className="steps-header">
                <span className="steps-title">
                  {nextStep.alphabetPrefix}. {nextStep.subtitle}
                </span>
              </div>
            )}

            <div 
              className={`next-step next-step-${index + 1} clickable`}
              onClick={(e) => {
                e.stopPropagation();
                goToSpecificDetail(nextStep.stepIndex, nextStep.detailIndex);
              }}
            >
              <span className="next-step-number">{nextStep.globalStepNumber}.</span>
              <span className="next-step-text">{nextStep.detailText}</span>
            </div>
          </div>
        ))}
      </>
    );
  };

  return (
    <div className={`cooking-mode safe-area safe-area-top safe-area-bottom ${isLandscape ? 'landscape' : 'portrait'}`}>
      {!isInitialized && <LoadingOverlay />}
      
      <Header
        title={recipeData.video_info.video_title}
        totalSteps={recipeData.recipe_steps.length}
        onBack={onBackToRecipe}
        darkMode
        isVisible={isHeaderVisible}
        className={isLandscape ? 'landscape' : ''}
        onHeaderToggle={() => setIsHeaderVisible(true)}
      />

      <div className="youtube-wrapper" style={{ position: 'relative' }}>
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
        {isLandscape && isHeaderVisible && (
          <div 
            className="youtube-overlay" 
            onClick={() => setIsHeaderVisible(false)}
            onTouchEnd={() => setIsHeaderVisible(false)}
          />
        )}
      </div>

      <div className="cooking-steps-wrapper">
        <ProgressBar
          recipeData={recipeData}
          currentStep={currentStep}
          currentDetailIndex={currentDetailIndex}
          currentTime={currentTime}
        />
        <section className="cooking-steps-container">
          {renderSteps()}
        </section>
      </div>

      <div className="floating-timer-container">
        <button
          className="floating-timer-btn"
          onClick={handleTimerClick}
          aria-label="타이머"
          type="button"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="13" r="8" stroke="#FFFFFF" strokeWidth="2" />
            <path
              d="M12 9v4l3 2"
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M9 3h6" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className={`floating-voice-guide-container ${isKwsActive ? 'kws-active' : ''}`}>
        <div className="speech-bubble">
          <div className="speech-bubble-text">"토리야"라고 말해보세요</div>
          <div className="speech-bubble-arrow"></div>
        </div>
        <button
          className="floating-voice-guide-btn"
          onClick={() => setShowVoiceGuide(true)}
          aria-label="음성 명령 가이드"
          type="button"
        >
          <img
            src={isKwsActive ? '/tori-listening.png' : '/tori-idle.png'}
            alt={isKwsActive ? '토리 듣는 중' : '토리 대기 중'}
          />
        </button>
      </div>

      <VoiceGuide isVisible={showVoiceGuide} onClose={() => setShowVoiceGuide(false)} />
    </div>
  );
};

export default RecipeStep;