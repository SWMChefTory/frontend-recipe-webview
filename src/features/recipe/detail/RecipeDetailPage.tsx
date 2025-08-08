import { Error, Loading, useBodyScrollLock, useTransition } from 'features/_common';
import { useBridgeActions } from 'features/bridge';
import { RecipeInfo, useRecipeData } from 'features/recipe/detail';
import { useNavigate, useParams } from 'react-router-dom';

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

  // 조리 시작 핸들러
  const handleStartRecipeStep = (selectedModel: string): void => {
    navigate(`/recipes/${id}/steps`, { state: { recipeData, selectedModel } });
  };

  // 네이티브 앱과 통신
  const bridgeActions = useBridgeActions(recipeData);

  // 스크롤 잠금 해제
  useBodyScrollLock(false);

  return (
    <div className={`app ${transitioning ? 'transitioning' : ''} ${fadeIn ? 'fade-in' : ''}`}>
      {loading ? (
        <Loading />
      ) : error ? (
        <Error error={error} />
      ) : !recipeData ? (
        <Error error="레시피 데이터를 찾을 수 없습니다." />
      ) : (
        <RecipeInfo
          recipeData={recipeData}
          onStartRecipeStep={handleStartRecipeStep}
          onBack={bridgeActions.handleBack}
        />
      )}
    </div>
  );
};

export default RecipeDetailPage;
