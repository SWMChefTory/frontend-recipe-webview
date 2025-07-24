import { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { RecipeInfo, useRecipeData } from '.';
import { useBridgeActions } from '../bridge';
import { Error, Loading, useBodyScrollLock, useTransition } from '../common';

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
  const handleStartRecipeStep = useCallback((): void => {
    navigate(`/recipes/${id}/steps`, { state: { recipeData } });
  }, [navigate, id, recipeData]);

  // 네이티브 앱과 통신
  const bridgeActions = useBridgeActions(recipeData);

  // 스크롤 잠금 해제 (레시피 정보는 스크롤 가능)
  useBodyScrollLock(false);

  // 렌더링 콘텐츠 함수
  const renderContent = () => {
    if (loading) {
      return <Loading />;
    }
    if (error) {
      return <Error error={error} />;
    }
    if (!recipeData) {
      return <Error error="레시피 데이터를 찾을 수 없습니다." />;
    }

    return (
      <RecipeInfo
        recipeData={recipeData}
        onStartRecipeStep={handleStartRecipeStep}
        onBack={bridgeActions.handleBack}
      />
    );
  };

  return (
    <div className={`app ${transitioning ? 'transitioning' : ''} ${fadeIn ? 'fade-in' : ''}`}>
      {renderContent()}
    </div>
  );
};

export default RecipeDetailPage;
