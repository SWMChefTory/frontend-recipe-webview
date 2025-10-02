import { Header } from '_common';
import { sendBackPressed } from 'bridge/utils/webview';
import { useRef } from 'react';
import Video from 'recipe/detail/components/Video';
import { Ingredient, RecipeBriefing, RecipeInfoProps, RecipeStep, RecipeTag } from 'recipe/detail/types';
import RecipeBottomSheet from './RecipeBottomSheet';
import './RecipeInfo.css';

const RecipeInfo = ({ recipeData, onStartRecipeStep }: RecipeInfoProps): JSX.Element => {
  const youtubePlayerRef = useRef<YT.Player | null>(null);

  // --- 원본 데이터 추출 ---
  const video_info = recipeData?.video_info ?? {};
  const recipe_summary = recipeData?.recipe_detail_meta ?? {};
  const recipe_ingredients: Ingredient[] = recipeData?.recipe_ingredient ?? [];
  const recipe_steps: RecipeStep[] = recipeData?.recipe_steps ?? [];
  const recipe_tags: RecipeTag[] = recipeData?.recipe_tags ?? [];
  const recipe_briefings: RecipeBriefing[] = recipeData?.recipe_briefings?? [];

  const handleBackPressed = (): void => {
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
    try {
      player.playVideo();
    } catch {}
  };

  const handleStartClick = () => {
    onStartRecipeStep();
  };

  return (
    <>
      <div className="recipe-info safe-area safe-area-top safe-area-bottom">
        <Header title={video_info.video_title} onBack={handleBackPressed} />

        <Video
          videoId={video_info.video_id}
          title={video_info.video_title}
          youtubeRef={youtubePlayerRef}
        />

        <RecipeBottomSheet
          steps={recipe_steps}
          ingredients={recipe_ingredients}
          onTimeClick={handleTimeClick}
          onStartCooking={handleStartClick}
          recipe_summary={recipe_summary}
          tags={recipe_tags}
          briefings={recipe_briefings}
        />
      </div>
    </>
  );
};

export default RecipeInfo;