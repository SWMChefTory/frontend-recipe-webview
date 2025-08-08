import { Header, TimerModal, TimerPopover, useGlobalTimer } from 'features/_common';
import { sendBackPressed } from 'features/bridge/utils/webview';
import IngredientList from 'features/recipe/detail/components/IngredientList';
import 'features/recipe/detail/components/RecipeInfo.css';
import STTModelSelector from 'features/recipe/detail/components/STTModelSelector';
import StartCookingButton from 'features/recipe/detail/components/StartCookingButton';
import Video from 'features/recipe/detail/components/Video';
import { RecipeInfoProps } from 'features/recipe/detail/types';
import MeasurementOverlay from 'features/recipe/measurement/MeasurementOverlay';
import { useState } from 'react';
import RecipeSteps from './RecipeSteps';

const RecipeInfo = ({ recipeData, onStartRecipeStep }: RecipeInfoProps): JSX.Element => {
  const [selectedSttModel, setSelectedSttModel] = useState<string>('VITO');
  const [showMeasurement, setShowMeasurement] = useState(false);
  const [isTimerModalOpen, setIsTimerModalOpen] = useState(false);
  const [isTimerPopoverOpen, setIsTimerPopoverOpen] = useState(false);

  // 전역 타이머 상태 사용
  const { timer, startTimer, pauseTimer, resumeTimer, stopTimer, formatTime } = useGlobalTimer();

  const handleBackPress = (): void => {
    if (window.ReactNativeWebView) {
      sendBackPressed(recipeData);
    } else {
      window.history.back();
    }
  };

  // 타이머 관련 핸들러 함수들
  const handleTimerClick = () => {
    if (timer.timeLeft > 0) {
      // 타이머가 실행 중이면 컨트롤 팝오버 열기
      setIsTimerPopoverOpen(true);
    } else {
      // 타이머가 설정되지 않았으면 설정 모달 열기
      setIsTimerModalOpen(true);
    }
  };

  const handleTimerModalClose = () => {
    setIsTimerModalOpen(false);
  };

  const handleSetTimer = (minutes: number, seconds: number) => {
    startTimer(minutes, seconds);
    // 알림 권한 요청 (최초 1회)
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const handleTimerPopoverClose = () => {
    setIsTimerPopoverOpen(false);
  };

  return (
    <>
      <div className="recipe-info">
        <Header
          title={recipeData.video_info.video_title}
          onBack={handleBackPress}
          showTimer
          onTimerClick={handleTimerClick}
          timerTimeLeft={timer.timeLeft}
          formatTime={formatTime}
        />

        <Video videoId={recipeData.video_info.video_id} title={recipeData.video_info.video_title} />

        <div className="recipe-content">
          <header className="recipe-header">
            <div className="recipe-header-card">
              <h1 className="recipe-title">{recipeData.video_info.video_title}</h1>
            </div>
          </header>

          <IngredientList
            ingredients={recipeData.ingredients_info.ingredients}
            onOpenMeasurement={() => setShowMeasurement(true)}
          />

          <RecipeSteps steps={recipeData.recipe_steps} />
        </div>

        <STTModelSelector selected={selectedSttModel} onChange={setSelectedSttModel} />

        <div className="button-container">
          <StartCookingButton onClick={() => onStartRecipeStep(selectedSttModel)} />
        </div>
      </div>

      {showMeasurement && (
        <div className="measurement-overlay active">
          <MeasurementOverlay onClose={() => setShowMeasurement(false)} />
        </div>
      )}

      {/* 타이머 설정 모달 */}
      <TimerModal
        isOpen={isTimerModalOpen}
        onClose={handleTimerModalClose}
        onSetTimer={handleSetTimer}
      />

      {/* 타이머 컨트롤 팝오버 */}
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
    </>
  );
};

export default RecipeInfo;
