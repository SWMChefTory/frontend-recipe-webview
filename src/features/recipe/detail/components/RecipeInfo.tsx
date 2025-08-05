import { sendBackPressed } from 'features/bridge/utils/webview';
import Header from 'features/common/components/Header/Header';
import IngredientList from 'features/recipe/detail/components/IngredientList';
import 'features/recipe/detail/components/RecipeInfo.css';
import STTModelSelector from 'features/recipe/detail/components/STTModelSelector';
import StartCookingButton from 'features/recipe/detail/components/StartCookingButton';
import Video from 'features/recipe/detail/components/Video';
import { RecipeInfoProps } from 'features/recipe/detail/types';
import { useState } from 'react';
import RecipeSteps from './RecipeSteps';

const RecipeInfo = ({ recipeData, onStartRecipeStep }: RecipeInfoProps): JSX.Element => {
  const [selectedSttModel, setSelectedSttModel] = useState<string>('VITO');

  const handleBackPress = (): void => {
    if (window.ReactNativeWebView) {
      sendBackPressed(recipeData);
    } else {
      window.history.back();
    }
  };

  return (
    <div className="recipe-info">
      <Header title={recipeData.video_info.video_title} onBack={handleBackPress} />
      <Video videoId={recipeData.video_info.video_id} title={recipeData.video_info.video_title} />

      <div className="recipe-content">
        <header className="recipe-header">
          <div className="recipe-header-card">
            <h1 className="recipe-title">{recipeData.video_info.video_title}</h1>
          </div>
        </header>

        <IngredientList ingredients={recipeData.ingredients_info.ingredients} />

        <RecipeSteps steps={recipeData.recipe_steps} />
      </div>

      <STTModelSelector selected={selectedSttModel} onChange={setSelectedSttModel} />

      <div className="button-container">
        <StartCookingButton onClick={() => onStartRecipeStep(selectedSttModel)} />
      </div>
    </div>
  );
};

export default RecipeInfo;
