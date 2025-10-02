import { WEBVIEW_MESSAGE_TYPES } from '_common/constants';
import { RecipeData } from '../../recipe/detail/types/recipe';
import { sendBridgeMessage } from '../utils/webview';

interface UseWebViewActionsResult {
  handleBack: () => void;
}

/**
 * Bridge(네이티브 통신) 관련 액션들을 관리하는 커스텀 훅
 * @param recipeData - 레시피 데이터
 * @param onModeChange - 모드 변경 콜백 함수
 * @returns WebView 액션 핸들러들
 */
export const useBridgeActions = (recipeData: RecipeData | null): UseWebViewActionsResult => {
  const handleBack = (): void => {
    if (!recipeData) return;
    if (window.ReactNativeWebView) {
      sendBridgeMessage(WEBVIEW_MESSAGE_TYPES.BACK_PRESSED, recipeData);
    } else {
      window.history.back(); // 웹 테스트용
    }
  };

  return {
    handleBack,
  };
};
