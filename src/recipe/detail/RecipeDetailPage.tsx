import { Suspense, useEffect } from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { useNavigate, useParams } from 'react-router-dom';
import { Error, Loading } from '_common';
import { useBridgeActions } from 'bridge';
import { RecipeInfo, useRecipeData } from 'recipe/detail';

/**
 * 레시피 정보 페이지
 * URL: /recipes/:id
 */
const RecipeDetailPage = (): JSX.Element => {
  const { id } = useParams<{ id: string }>();

  return <ErrorBoundary
    fallbackRender={({}: FallbackProps) => <Error error={'레시피를 불러오는 데 실패했습니다.'} />}
  >
    <Suspense fallback={<Loading />}>
      <RecipeDetailContent recipeId={id} />
    </Suspense>
  </ErrorBoundary>;
};

/**
 * 레시피 상세 내용 (Suspense 경계 내부)
 */
interface RecipeDetailContentProps {
  recipeId: string | undefined;
}

const RecipeDetailContent = ({ recipeId }: RecipeDetailContentProps) => {
  const navigate = useNavigate();
  if (!recipeId) {
    // @ts-ignore
    throw new Error('레시피를 찾을 수 없습니다.');
  }
  const { recipeData } = useRecipeData(recipeId);

  const handleStartRecipeStep = (): void => {
    navigate(`/recipes/${recipeId}/steps`, { state: { recipeData } });
  };

  const bridgeActions = useBridgeActions(recipeData);

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

  return (
    <RecipeInfo
      recipeData={recipeData}
      onStartRecipeStep={handleStartRecipeStep}
      onBack={bridgeActions.handleGoHome}
    />
  );
};
export default RecipeDetailPage;