import { Error, Loading, useBodyScrollLock, useTransition } from '_common';
import { useBridgeActions } from 'bridge';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { RecipeInfo, useRecipeData } from 'recipe/detail';

/**
 * 레시피 정보 페이지
 * URL: /recipes/:id
 */
const RecipeDetailPage = (): JSX.Element => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { recipeData, isLoading, errorMessage } = useRecipeData(id);

  // 화면 전환 애니메이션
  const { transitioning, fadeIn } = useTransition();

  // 조리 시작 핸들러
  const handleStartRecipeStep = (): void => {
    navigate(`/recipes/${id}/steps`, { state: { recipeData } });
  };

  // 네이티브 앱과 통신
  const bridgeActions = useBridgeActions(recipeData);

  // 네이티브 BACK_PRESSED 처리: 상세 페이지에서는 브릿지로 back 전달
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      let msg: unknown;
      try {
        msg = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      } catch (e) {
        return;
      }

      if (
        typeof msg === 'object' &&
        msg !== null &&
        'type' in msg &&
        (msg as any).type === 'BACK_PRESSED'
      ) {
        bridgeActions.handleGoHome();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [bridgeActions]);

  // 로딩 중에는 스크롤 잠금
  useBodyScrollLock(isLoading);

  return (
    <div className={`app ${transitioning ? 'transitioning' : ''} ${fadeIn ? 'fade-in' : ''}`}>
      {isLoading ? (
        <Loading />
      ) : !recipeData || errorMessage ? (
        <Error error={errorMessage || '레시피를 찾을 수 없습니다.'} />
      ) : (
        <RecipeInfo
          recipeData={recipeData}
          onStartRecipeStep={handleStartRecipeStep}
          onBack={bridgeActions.handleGoHome}
        />
      )}
    </div>
  );
};

export default RecipeDetailPage;
