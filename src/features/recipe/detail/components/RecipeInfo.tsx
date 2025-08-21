import { Header } from 'features/_common';
import { WEBVIEW_MESSAGE_TYPES } from 'features/_common/constants';
import { sendBackPressed, sendBridgeMessage } from 'features/bridge/utils/webview';
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

  const handleBackPress = (): void => {
    if (window.ReactNativeWebView) {
      sendBackPressed();
    } else {
      window.history.back();
    }
  };

  // 타이머 관련 핸들러 함수들
  const handleTimerClick = () => {
    sendBridgeMessage(WEBVIEW_MESSAGE_TYPES.TIMER_CHECK, recipeData);
    console.log('handleTimerClick', recipeData);
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
    </>
  );
};

export default RecipeInfo;
