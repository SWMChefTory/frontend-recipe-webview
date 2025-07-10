import { useNavigate, useParams } from 'react-router-dom';
import {
  Error, Loading, useBodyScrollLock,
  useTransition
} from '../core';
import { useRecipeData } from '../recipeDetail';
import { useWebViewActions } from '../webview';
import RecipeStep from './components/RecipeStep/RecipeStep';

/**
 * 조리 모드 페이지
 * URL: /recipeId/:id/cooking
 */
const RecipeStepPage = (): JSX.Element => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { recipeData, loading, error } = useRecipeData(id);
  
  // 화면 전환 애니메이션
  const { transitioning, fadeIn } = useTransition();
  
  // 조리 완료 핸들러 - React Native로 메시지 전송 후 레시피 페이지로 이동
  const handleFinishCooking = (): void => {
    if (recipeData) {
      // React Native로 조리 완료 메시지 전송
      webViewActions.handleFinishCooking();
      // 레시피 페이지로 이동
      navigate(`/recipes/${id}`);
    }
  };
  
  // 레시피로 돌아가기 핸들러 - 라우터로 네비게이션
  const handleBackToRecipe = (): void => {
    navigate(`/recipes/${id}`);
  };
  
  // 네이티브 앱과 통신
  const webViewActions = useWebViewActions(recipeData, () => {
    // 조리 페이지에서는 모드 변경 없음 (이미 조리 모드)
  });
  
  // 조리 모드일 때 body 스크롤 방지
  useBodyScrollLock(true);

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
      className={`app cooking-mode ${transitioning ? 'transitioning' : ''} ${fadeIn ? 'fade-in' : ''}`}
    >
      <RecipeStep 
        recipeData={recipeData} 
        onFinishCooking={handleFinishCooking}
        onBackToRecipe={handleBackToRecipe}
      />
    </div>
  );
};

export default RecipeStepPage; 