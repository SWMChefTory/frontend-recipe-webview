import { useBridgeActions } from 'features/bridge';
import { useBodyScrollLock, useTransition } from 'features/common';
import RecipeStep from 'features/recipe/step/components/RecipeStep';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

/**
 * 조리 모드 페이지
 * URL: /recipes/:id
 */
const RecipeStepPage = (): JSX.Element => {
  const location = useLocation();

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { recipeData, selectedModel } = location.state as {
    recipeData: any;
    selectedModel: string;
  };

  // 화면 전환 애니메이션
  const { transitioning, fadeIn } = useTransition();

  /**
   * 조리 완료 핸들러
   * - React Native로 메시지 전송 후 레시피 페이지로 이동
   * - 레시피 페이지로 이동 시 현재 페이지 정보를 저장하고 이동
   */
  const handleFinishCooking = (): void => {
    bridgeActions.handleFinishCooking();
    navigate(`/recipes/${id}`);
  };

  // 레시피로 돌아가기 핸들러 - 라우터로 네비게이션
  const handleBackToRecipe = (): void => {
    navigate(`/recipes/${id}`, { replace: true });
  };

  // 네이티브 앱과 통신
  const bridgeActions = useBridgeActions(recipeData, undefined);

  // 조리 모드일 때 body 스크롤 방지
  useBodyScrollLock(true);

  return (
    <div
      className={`app cooking-mode ${transitioning ? 'transitioning' : ''} ${fadeIn ? 'fade-in' : ''}`}
    >
      <RecipeStep
        recipeData={recipeData}
        onFinishCooking={handleFinishCooking}
        onBackToRecipe={handleBackToRecipe}
        selectedSttModel={selectedModel}
      />
    </div>
  );
};

export default RecipeStepPage;
