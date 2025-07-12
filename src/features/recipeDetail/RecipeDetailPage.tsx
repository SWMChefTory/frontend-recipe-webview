import { useNavigate, useParams } from 'react-router-dom';
import { RecipeInfo, useRecipeData } from '.';
import {
  Error, Loading, useBodyScrollLock,
  useTransition
} from '../core';
import { useWebViewActions } from '../webview';

/**
 * 레시피 정보 페이지
 * URL: /recipes/:id
 */
const RecipeDetailPage = (): JSX.Element => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { recipeData, loading, error } = useRecipeData(id);
  
  // 화면 전환 애니메이션
  const { transitioning, fadeIn } = useTransition();
  
  // 조리 시작 핸들러 - 라우터로 네비게이션
  const handleStartRecipeStep = (): void => {
    if (recipeData) {
      navigate(`/recipes/${id}/steps`);
    }
  };
  
  // 네이티브 앱과 통신
  const webViewActions = useWebViewActions(recipeData, () => {
    // 레시피 페이지에서는 모드 변경 없음
  });
  
  // 스크롤 잠금 해제 (레시피 정보는 스크롤 가능)
  useBodyScrollLock(false);

  // 로딩 상태
  if (loading) {
    return (
      <div className="app">
        <Loading />
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="app">
        <Error error={error} />
      </div>
    );
  }

  // 레시피 데이터가 없는 경우
  if (!recipeData) {
    return (
      <div className="app">
        <Error error="레시피 데이터를 찾을 수 없습니다." />
      </div>
    );
  }

  return (
    <div 
      className={`app ${transitioning ? 'transitioning' : ''} ${fadeIn ? 'fade-in' : ''}`}
    >
      <RecipeInfo 
        recipeData={recipeData} 
        onStartRecipeStep={handleStartRecipeStep}
        onBack={webViewActions.handleBack}
      />
    </div>
  );
};

export default RecipeDetailPage; 