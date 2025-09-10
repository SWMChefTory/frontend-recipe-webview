import { Header } from '_common';
import { WEBVIEW_MESSAGE_TYPES } from '_common/constants';
import { sendBackPressed, sendBridgeMessage } from 'bridge/utils/webview';
import { useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import IngredientList from 'recipe/detail/components/IngredientList';
import 'recipe/detail/components/RecipeInfo.css';
import StartCookingButton from 'recipe/detail/components/StartCookingButton';
import Video from 'recipe/detail/components/Video';
import { RecipeInfoProps } from 'recipe/detail/types';
import MeasurementOverlay from 'recipe/measurement/MeasurementOverlay';
import RecipeSteps from './RecipeSteps';
import RecipeHeader from './RecipeHeader';
import IngredientsModal from './IngredientsModal';

const RecipeInfo = ({ recipeData, onStartRecipeStep }: RecipeInfoProps): JSX.Element => {
  const [showMeasurement, setShowMeasurement] = useState(false);
  const youtubePlayerRef = useRef<YT.Player | null>(null);
  const { id: recipeId } = useParams<{ id: string }>();

  const { analysis } = recipeData;
  const originalServings = analysis?.servings ?? 1;
  const cookingTime = analysis?.cooking_time ?? 0;
  const tags = analysis?.tags ?? [];
  const description = analysis?.description ?? '';

  // 인분 조절 상태 (기본값은 원래 인분수)
  const [currentServings, setCurrentServings] = useState(originalServings);
  const [showMissingModal, setShowMissingModal] = useState(false);
  const [checkedCount, setCheckedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(analysis.ingredients.length);

  const handleBackPress = (): void => {
    if (window.ReactNativeWebView) {
      sendBackPressed();
    } else {
      window.history.back();
    }
  };

  const handleTimeClick = (time: number) => {
    const sec = Math.max(0, Math.floor(Number(time) || 0));
    const player = youtubePlayerRef.current;
    if (!player) return;

    player.seekTo(sec, true);
    try { player.playVideo(); } catch {}
    const videoElement = document.querySelector('iframe');
    if (videoElement) {
      videoElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleTimerClick = () => {
    sendBridgeMessage(WEBVIEW_MESSAGE_TYPES.TIMER_CHECK, null, {
      recipe_id: recipeId ?? '',
      recipe_title: recipeData.video_info.video_title,
    });
  };


  const handleStartClick = () => {
    if (totalCount !== checkedCount) {
      setShowMissingModal(true);
      return;
    }
    onStartRecipeStep('CLOVA');
  };

  const handleProceedAnyway = () => {
    setShowMissingModal(false);
    onStartRecipeStep('CLOVA');
  };

  const handleServingsChange = (newServings: number) => {
    setCurrentServings(Math.max(1, Math.min(10, newServings))); // 1-10인분 제한
  };

  const decreaseServings = () => handleServingsChange(currentServings - 1);
  const increaseServings = () => handleServingsChange(currentServings + 1);

  return (
    <>
      <div className="recipe-info">
        <Header
          title={recipeData.video_info.video_title}
          onBack={handleBackPress}
          onTimerClick={handleTimerClick}
        />

        <Video
          videoId={recipeData.video_info.video_id}
          title={recipeData.video_info.video_title}
          youtubeRef={youtubePlayerRef}
        />

        <div className="recipe-content">
          <RecipeHeader
            analysisId={analysis.id}
            title={recipeData.video_info.video_title}
            description={description}
            tags={tags}
            cookingTimeMin={cookingTime}
            originalServings={originalServings}
            currentServings={currentServings}
            onDecreaseServings={decreaseServings}
            onIncreaseServings={increaseServings}
          />

          <IngredientList
            ingredients={analysis.ingredients}
            currentServings={currentServings}
            originalServings={originalServings}
            onOpenMeasurement={() => setShowMeasurement(true)}
            onCheckedSummaryChange={(c, t) => { setCheckedCount(c); setTotalCount(t); }}
          />

          <RecipeSteps steps={recipeData.recipe_steps} onTimeClick={handleTimeClick} />
        </div>

        <div className="button-container">
          <StartCookingButton onClick={handleStartClick} />
        </div>
      </div>

      {showMeasurement && (
        <div className="measurement-overlay active">
          <MeasurementOverlay onClose={() => setShowMeasurement(false)} />
        </div>
      )}
      {showMissingModal && (
        <IngredientsModal
          checkedCount={checkedCount}
          totalCount={totalCount}
          onClose={() => setShowMissingModal(false)}
          onProceed={handleProceedAnyway}
        />
      )}
    </>
  );
};

export default RecipeInfo;