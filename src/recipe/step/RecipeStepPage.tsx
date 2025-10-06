import { useBodyScrollLock, useTransition } from '_common';
import { WEBVIEW_MESSAGE_TYPES } from '_common/constants';
import { sendBridgeMessage } from 'bridge';
import { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import RecipeStep from 'recipe/step/components/RecipeStep';

/**
 * 조리 모드 페이지
 * URL: /recipes/:id
 */
const RecipeStepPage = (): JSX.Element => {
  const location = useLocation();

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { recipeData } = location.state as {
    recipeData: any;
  };

  const { transitioning, fadeIn } = useTransition();

  const handleBackToRecipe = (): void => {
    sendBridgeMessage(WEBVIEW_MESSAGE_TYPES.LOCK_TO_PORTRAIT_UP, null);
    setTimeout(() => {
      navigate(-1);
    }, 200);
  };

  useBodyScrollLock(true);

  useEffect(() => {
    sendBridgeMessage(WEBVIEW_MESSAGE_TYPES.UNLOCK_ORIENTATION, null);
  }, []);

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
        sendBridgeMessage(WEBVIEW_MESSAGE_TYPES.LOCK_TO_PORTRAIT_UP, null);
        setTimeout(() => {
          navigate(-1);
        }, 200);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [id, navigate]);

  return (
    <div
      className={`app cooking-mode ${transitioning ? 'transitioning' : ''} ${fadeIn ? 'fade-in' : ''}`}
    >
      <RecipeStep recipeData={recipeData} onBackToRecipe={handleBackToRecipe} />
    </div>
  );
};

export default RecipeStepPage;