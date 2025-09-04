import { Header } from '_common';
import { WEBVIEW_MESSAGE_TYPES } from '_common/constants';
import { sendBackPressed, sendBridgeMessage } from 'bridge/utils/webview';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import IngredientList from 'recipe/detail/components/IngredientList';
import 'recipe/detail/components/RecipeInfo.css';
import StartCookingButton from 'recipe/detail/components/StartCookingButton';
import Video from 'recipe/detail/components/Video';
import { RecipeInfoProps } from 'recipe/detail/types';
import MeasurementOverlay from 'recipe/measurement/MeasurementOverlay';
import RecipeSteps from './RecipeSteps';

const RecipeInfo = ({ recipeData, onStartRecipeStep }: RecipeInfoProps): JSX.Element => {
  const [showMeasurement, setShowMeasurement] = useState(false);

  const { id: recipeId } = useParams<{ id: string }>();

  const handleBackPress = (): void => {
    if (window.ReactNativeWebView) {
      sendBackPressed();
    } else {
      window.history.back();
    }
  };

  // 타이머 관련 핸들러 함수들
  const handleTimerClick = () => {
    sendBridgeMessage(WEBVIEW_MESSAGE_TYPES.TIMER_CHECK, null, {
      recipe_id: recipeId ?? '',
      recipe_title: recipeData.video_info.video_title,
    });
  };

  return (
    <>
      <div className="recipe-info">
        <Header
          title={recipeData.video_info.video_title}
          onBack={handleBackPress}
          onTimerClick={handleTimerClick}
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

        <div className="button-container">
          <StartCookingButton onClick={() => onStartRecipeStep('CLOVA')} />
        </div>
      </div>

      {showMeasurement && (
        <div className="measurement-overlay active">
          <MeasurementOverlay onClose={() => setShowMeasurement(false)} />
        </div>
      )}
    </>
  );
};

export default RecipeInfo;
