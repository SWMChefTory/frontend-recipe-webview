import { useCallback } from 'react';
import { WEBVIEW_MESSAGE_TYPES } from '../../common/constants';
import { RecipeData } from '../../recipeDetail/types/recipe';
import { sendBridgeMessage } from '../utils/webview';

interface UseWebViewActionsResult {
  handleStartCooking: () => void;
  handleFinishCooking: () => void;
  handleBackToRecipe: () => void;
  handleBack: () => void;
}

/**
 * Bridge(네이티브 통신) 관련 액션들을 관리하는 커스텀 훅
 * @param recipeData - 레시피 데이터
 * @param onModeChange - 모드 변경 콜백 함수
 * @returns WebView 액션 핸들러들
 */
export const useBridgeActions = (
  recipeData: RecipeData | null,
  onModeChange?: (mode: boolean) => void,
): UseWebViewActionsResult => {
  const handleStartCooking = useCallback((): void => {
    if (!recipeData) {
      return;
    }
    onModeChange?.(true);

    if (window.ReactNativeWebView) {
      sendBridgeMessage(WEBVIEW_MESSAGE_TYPES.START_COOKING, recipeData);
    }
  }, [recipeData, onModeChange]);

  const handleFinishCooking = useCallback((): void => {
    if (!recipeData) {
      return;
    }

    if (window.ReactNativeWebView) {
      onModeChange?.(false);
      sendBridgeMessage(WEBVIEW_MESSAGE_TYPES.FINISH_COOKING, recipeData);
    }
  }, [recipeData, onModeChange]);

  const handleBackToRecipe = useCallback((): void => {
    if (!recipeData) {
      return;
    }
    onModeChange?.(false);

    if (window.ReactNativeWebView) {
      sendBridgeMessage(WEBVIEW_MESSAGE_TYPES.BACK_TO_RECIPE, recipeData);
    }
  }, [recipeData, onModeChange]);

  const handleBack = useCallback((): void => {
    if (!recipeData) {
      return;
    }

    if (window.ReactNativeWebView) {
      sendBridgeMessage(WEBVIEW_MESSAGE_TYPES.BACK_PRESSED, recipeData);
    } else {
      // 웹 환경에서 테스트용
      window.history.back();
    }
  }, [recipeData]);

  return {
    handleStartCooking,
    handleFinishCooking,
    handleBackToRecipe,
    handleBack,
  };
};
