import { useCallback } from 'react';
import Header from '../../../core/components/Header/Header';
import YouTubePlayer from '../../../core/components/YouTube/YouTubePlayer';
import { formatTime } from '../../../core/utils/time';
import { sendBackPressed } from '../../../webview/utils/webview';
import { RecipeInfoProps } from '../../types/index';
import { Ingredient } from '../../types/recipe';
import './RecipeInfo.css';

/**
 * 레시피 정보를 표시하는 컴포넌트
 * @param props - 레시피 정보 컴포넌트 props
 * @returns JSX 엘리먼트
 */
const RecipeInfo = ({ 
  recipeData, 
  onStartRecipeStep, 
  onBack 
}: RecipeInfoProps): JSX.Element => {

  const handleBackPress = useCallback((): void => {
    if (onBack) {
      onBack();
    } else if (window.ReactNativeWebView) {
      sendBackPressed(recipeData);
    } else {
      // 웹 환경에서 테스트용
      window.history.back();
    }
  }, [onBack, recipeData]);

  return (
    <div className="recipe-info">
      {/* 헤더 */}
      <Header
        title={recipeData.title}
        onBack={handleBackPress}
        showTimer={false}
      />

      {/* YouTube 영상 섹션 */}
      <YouTubePlayer
        youtubeEmbedId={recipeData.youtubeEmbedId}
        startTime={0}
        title={`${recipeData.title} 동영상`}
        autoplay={false}
      />

      {/* 레시피 정보 섹션 */}
      <div className="recipe-content">
        {/* 요리명과 설명 */}
        <header className="recipe-header">
          <h1 className="recipe-title">{recipeData.title}</h1>
          <p className="recipe-description">{recipeData.description}</p>
        </header>

        {/* 소요시간 */}
        <section className="cooking-time-section">
          <h3 className="section-title">소요 시간</h3>
          <p className="cooking-time">{formatTime(recipeData.total_time_sec)}</p>
        </section>

        {/* 재료 리스트 */}
        <section className="ingredients-section">
          <h3 className="section-title">재료</h3>
          <ul className="ingredients-list">
            {recipeData.ingredients.map((ingredient: Ingredient, index: number) => (
              <li key={`ingredient-${index}`} className="ingredient-item">
                {index + 1}. {ingredient.name} {ingredient.amount}{ingredient.unit}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* 조리 시작하기 버튼 */}
      <div className="button-container">
        <button
          className="start-cooking-btn" 
          onClick={onStartRecipeStep}
          type="button"
          aria-label="조리 시작하기"
        >
          조리 시작하기
        </button>
      </div>
    </div>
  );
};

export default RecipeInfo; 