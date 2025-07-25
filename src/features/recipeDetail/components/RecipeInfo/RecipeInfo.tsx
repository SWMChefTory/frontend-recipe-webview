import { useCallback, useState } from 'react';
import { sendBackPressed } from '../../../bridge/utils/webview';
import Header from '../../../common/components/Header/Header';
import YouTubePlayer from '../../../common/components/YouTube/YouTubePlayer';
import { formatTime } from '../../../common/utils/time';
import { RecipeInfoProps } from '../../types/index';
import { Ingredient } from '../../types/recipe';
import './RecipeInfo.css';

const RecipeInfo = ({ recipeData, onStartRecipeStep }: RecipeInfoProps): JSX.Element => {
  const [selectedSttModel, setSelectedSttModel] = useState<string>('VITO'); // 기본값 설정

  const handleBackPress = useCallback((): void => {
    if (window.ReactNativeWebView) {
      sendBackPressed(recipeData);
    } else {
      // 웹 환경에서 테스트용
      window.history.back();
    }
  }, [recipeData]);

  const handleSttModelChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>): void => {
    setSelectedSttModel(event.target.value);
  }, []);

  return (
    <div className="recipe-info">
      {/* 헤더 */}
      <Header
        title={recipeData.video_info.video_title}
        onBack={handleBackPress}
        showTimer={false}
      />

      {/* YouTube 영상 섹션 */}
      <YouTubePlayer
        youtubeEmbedId={recipeData.video_info.video_id}
        startTime={0}
        title={`${recipeData.video_info.video_title} 동영상`}
        autoplay={false}
      />

      {/* 레시피 정보 섹션 */}
      <div className="recipe-content">
        {/* 요리명과 설명 */}
        <header className="recipe-header">
          <h1 className="recipe-title">{recipeData.video_info.video_title}</h1>
          <p className="recipe-description">
            {recipeData.video_info.video_title}에 대한 설명은 API에 없습니다. 임시 텍스트.
          </p>
        </header>

        {/* 소요시간 */}
        <section className="cooking-time-section">
          <h3 className="section-title">소요 시간</h3>
          <p className="cooking-time">{formatTime(recipeData.video_info.video_seconds)}</p>
        </section>

        {/* 재료 리스트 */}
        <section className="ingredients-section">
          <h3 className="section-title">재료</h3>
          <ul className="ingredients-list">
            {recipeData.ingredients_info.ingredients.map(
              (ingredient: Ingredient, index: number) => (
                <li key={`ingredient-${index}`} className="ingredient-item">
                  {index + 1}. {ingredient.name} {ingredient.amount}
                  {ingredient.unit}
                </li>
              ),
            )}
          </ul>
        </section>
      </div>

      <div>
        <select onChange={handleSttModelChange} value={selectedSttModel}>
          <option value="VITO">VITO</option>
          <option value="CLOVA">CLOVA</option>
          <option value="OPENAI">OPENAI</option>
        </select>
      </div>

      {/* 조리 시작하기 버튼 */}
      <div className="button-container">
        <button
          className="start-cooking-btn"
          onClick={() => onStartRecipeStep(selectedSttModel)}
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
