import { Error as ErrorView, Loading } from '_common';
import { useBridgeActions } from 'bridge';
import { Suspense, useEffect } from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { useNavigate, useParams } from 'react-router-dom';
import { RecipeInfo, useRecipeData } from 'recipe/detail';

const RecipeDetailPage = (): JSX.Element => {
  const { id } = useParams<{ id: string }>();

  return (
    <ErrorBoundary
      fallbackRender={(_: FallbackProps) => (
        <ErrorView error={'레시피를 불러오는 데 실패했습니다.'} />
      )}
    >
      <Suspense fallback={<Loading />}>
        <RecipeDetailContent recipeId={id} />
      </Suspense>
    </ErrorBoundary>
  );
};

interface RecipeDetailContentProps {
  recipeId: string | undefined;
}

const RecipeDetailContent = ({ recipeId }: RecipeDetailContentProps) => {
  const navigate = useNavigate();

  if (!recipeId) {
    throw new globalThis.Error('레시피를 찾을 수 없습니다.');
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
      } catch {
        return;
      }

      if (
        typeof msg === 'object' &&
        msg !== null &&
        'type' in msg &&
        (msg as any).type === 'BACK_PRESSED'
      ) {
        bridgeActions.handleBack();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [bridgeActions]);

  return (
    <RecipeInfo
      recipeData={recipeData}
      onStartRecipeStep={handleStartRecipeStep}
      onBack={bridgeActions.handleBack}
    />
  );
};

export default RecipeDetailPage;
