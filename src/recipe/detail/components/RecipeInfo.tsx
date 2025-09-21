import { Header } from '_common';
import { sendGoHome } from 'bridge/utils/webview';
import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import IngredientList from 'recipe/detail/components/IngredientList';
import 'recipe/detail/components/IngredientList.css';
import 'recipe/detail/components/RecipeHeader.css';
import 'recipe/detail/components/RecipeInfo.css';
import 'recipe/detail/components/RecipeSteps.css';
import StartCookingButton from 'recipe/detail/components/StartCookingButton';
import 'recipe/detail/components/StartCookingButton.css';
import Video from 'recipe/detail/components/Video';
import { RecipeBriefing, RecipeInfoProps } from 'recipe/detail/types';
import IngredientsModal from './IngredientsModal';
import RecipeBriefings from './RecipeBriefings';
import RecipeHeader from './RecipeHeader';
import RecipeSteps from './RecipeSteps';

const RecipeInfo = ({ recipeData, onStartRecipeStep }: RecipeInfoProps): JSX.Element => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const youtubePlayerRef = useRef<YT.Player | null>(null);

  const video_info = recipeData?.video_info ?? {};

  const { recipe_detail_meta: RecipeDetailMeta } = recipeData;
  const originalServings = RecipeDetailMeta?.servings ?? 1;
  const cookingTime = RecipeDetailMeta?.cook_time ?? 0;
  const description = RecipeDetailMeta?.description ?? '';

  const recipe_ingredients = recipeData?.recipe_ingredient ?? [];
  const recipe_steps = recipeData?.recipe_steps ?? [];
  const recipe_tags = recipeData?.recipe_tags ?? [];
  const recipe_briefings = recipeData?.recipe_briefings ?? [];

  // 인분 조절 상태 (기본값은 원래 인분수)
  const [currentServings, setCurrentServings] = useState(originalServings);
  const [showMissingModal, setShowMissingModal] = useState(false);
  const [checkedCount, setCheckedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(recipe_ingredients.length);

  const handleGoHome = (): void => {
    if (window.ReactNativeWebView) {
      sendGoHome();
    } else {
      window.history.back();
    }
  };

  const handleTimeClick = (time: number) => {
    const sec = Math.max(0, Math.floor(Number(time) || 0));
    const player = youtubePlayerRef.current;
    if (!player) return;

    player.seekTo(sec, true);
    try {
      player.playVideo();
    } catch {}
  };

  const handleStartClick = () => {
    if (totalCount !== checkedCount) {
      setShowMissingModal(true);
      return;
    }
    onStartRecipeStep();
  };

  const handleProceedAnyway = () => {
    setShowMissingModal(false);
    onStartRecipeStep();
  };

  const handleServingsChange = (newServings: number) => {
    setCurrentServings(Math.max(1, Math.min(10, newServings)));
  };

  const decreaseServings = () => handleServingsChange(currentServings - 1);
  const increaseServings = () => handleServingsChange(currentServings + 1);

  return (
    <>
      <div className="recipe-info">
        <Header title={video_info.video_title} onBack={handleGoHome} />

        <Video
          videoId={video_info.video_id}
          title={video_info.video_title}
          youtubeRef={youtubePlayerRef}
        />

        <div className="recipe-content">
          <RecipeHeader
            analysisId={RecipeDetailMeta?.id}
            title={video_info.video_title}
            description={description}
            tags={recipe_tags.map(tag => tag.name)}
            cookingTimeMin={cookingTime}
            originalServings={originalServings}
            currentServings={currentServings}
            onDecreaseServings={decreaseServings}
            onIncreaseServings={increaseServings}
          />

          <IngredientList
            ingredients={recipe_ingredients}
            currentServings={currentServings}
            originalServings={originalServings}
            onOpenMeasurement={() => navigate(`/recipes/${id}/measurement`)}
            onCheckedSummaryChange={(c, t) => {
              setCheckedCount(c);
              setTotalCount(t);
            }}
          />

          <RecipeSteps steps={recipe_steps} onTimeClick={handleTimeClick} />
          <RecipeBriefings
            briefings={recipe_briefings.map((briefing: RecipeBriefing) => briefing.content)}
          />
        </div>

        <div className="button-container">
          <StartCookingButton onClick={handleStartClick} />
        </div>
      </div>

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
