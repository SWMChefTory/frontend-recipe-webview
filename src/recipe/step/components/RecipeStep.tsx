import { useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import Slider from 'react-slick';

import { Header, YouTubePlayer } from '_common';
import { sendBridgeMessage, useAccessToken } from 'bridge';
import { RecipeData } from 'recipe/detail/types/recipe';
import VoiceGuide from 'recipe/step/components/VoiceGuide';
import { useSimpleSpeech } from 'speech/hooks/useSimpleSpeech';
import { BasicIntent } from 'speech/types/parseIntent';
import StepCard from './StepCard';

import { WEBVIEW_MESSAGE_TYPES } from '_common/constants';
import 'recipe/step/components/RecipeStep.css';
import { useStepByVoiceController } from '../hooks/useStepController';
import { useStepInit } from '../hooks/useStepInit';
import './Overlay.css';

interface Props {
  recipeData: RecipeData;
  onBackToRecipe: () => void;
}

function LoadingOverlay() {
  return (
    <div className="loading-overlay">
      <div className="loading-content">
        <div className="spinner"></div>
        <p className="loading-message">Loading...</p>
        {/* {progress !== undefined && (
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progress}%` }}
              />
            </div>
          )} */}
      </div>
    </div>
  );
}

const RecipeStep = ({ recipeData, onBackToRecipe }: Props) => {
  //TODO : useEffect의 무한루프 막기 위해서 이거 있는 거 같은데, useEffect 제거해서 이거 없어도 될듯?
  //DONE : 삭제

  // const is

  // 음성 가이드 관련 상태
  const [isKwsActive, setIsKwsActive] = useState(false);
  const [showVoiceGuide, setShowVoiceGuide] = useState(false);

  const accessToken = useAccessToken();
  const { id: recipeId } = useParams<{ id: string }>();

  const [currentStep, setCurrentStep] = useState(0);

  const sliderRef = useRef<Slider>(null);
  const ytRef = useRef<YT.Player | null>(null);

  const { handleStepsFromVoice, handleStepsFromSlider } = useStepByVoiceController(
    sliderRef,
    ytRef,
    recipeData,
  );

  const { isInitialized, handleYtInitialized, handleSliderInitialized } = useStepInit(() =>
    handleStepsFromVoice.byStep(0),
  );

  const slickSettings = {
    dots: false,
    infinite: false,
    speed: 300,
    centerMode: true,
    centerPadding: '10%',
    afterChange: (index: number) => {
      setCurrentStep(index);
      handleStepsFromSlider.byStep(index);
    },
    arrows: false,
    adaptiveHeight: false, // 높이 적응 비활성화
    draggable: true,
    onInit: () => handleSliderInitialized(),
  };

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
        handleStepsFromVoice.toNext(currentStep);
        commandExecuted = true;
        break;
      case 'PREV':
        handleStepsFromVoice.toPrevious(currentStep);
        commandExecuted = true;
        break;
      case 'STEP': {
        const num = parseInt(arg1 ?? '', 10);
        if (!Number.isNaN(num) && num >= 1) {
          //외부로 오는 요청은 1부터 시작하기 때문에 -1 처리
          handleStepsFromVoice.byStep(num - 1);
          commandExecuted = true;
        }
        break;
      }
      case 'TIMESTAMP': {
        const secs = parseInt(arg1 ?? '', 10);
        if (!Number.isNaN(secs)) {
          handleStepsFromVoice.byTimestamp(secs);
          commandExecuted = true;
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

  // 캐러셀 단계 변경 시 해당 단계 시작 시간으로 YouTube를 시킹
  // TODO : 이렇게 상태 변화일 때 유튜브를 이동시키는 것은 불일치가 발생할 가능성있음. 그냥 레시피 조작할 때 마다 제거.
  // DONE : 삭제

  // 재생 시간이 다음 스텝 시작 시간에 도달하면 현재 스텝의 시작으로 루프
  // TODO : 이것도 단계 변환 시킬 때 그냥 버튼에서 처리하면 안될까, 그리고 사용자가 유튜브 영상의 초를 바꾸면, 기존 단계로 돌아오는데 step도 같이 바꿔줘야 하는거 아닌가
  // TODO : 이런 방식으로 되면 사용자가 말한 '다음'이 도착해서 다음으로 넘어갔는데, seek가 실행되서 비디오는 이전에 있던 step의 영상 시간으로 가버릴 수 도 있음.
  // DONE : 삭제

  let stepCount = 1;

  return (
    <div className="cooking-mode">
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
          handleYtInitialized();
        }}
      />

      <section className="cooking-steps-container">
        <div className="carousel-container">
          <Slider ref={sliderRef} {...slickSettings}>
            {recipeData.recipe_steps.flatMap((step, idx) =>
              step.details.map((detail, detailIdx) => (
                <StepCard
                  key={`step-${idx}-${detailIdx}`}
                  step={`${step.subtitle}(${detailIdx + 1}/${step.details.length})`}
                  detail={detail.text}
                  index={stepCount++}
                />
              )),
            )}
          </Slider>
        </div>
      </section>

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
