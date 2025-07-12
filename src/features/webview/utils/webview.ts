import { WEBVIEW_MESSAGE_TYPES } from '../../core/constants';
import { RecipeData } from '../../recipeDetail/types/recipe';
import { WebViewMessage, WebViewMessageType } from '../types/webview';

// 전역 객체에 ReactNativeWebView 추가
declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
  }
}

/**
 * React Native WebView로 메시지를 전송하는 공통 함수
 * @param type - 메시지 타입
 * @param data - 전송할 데이터
 * @param additionalData - 추가 데이터
 */
export const sendWebViewMessage = (
  type: WebViewMessageType, 
  data: RecipeData | null, 
  additionalData: Partial<WebViewMessage> = {}
): void => {
  if (window.ReactNativeWebView) {
    const message: WebViewMessage = {
      type,
      data,
      ...additionalData,
    };
    window.ReactNativeWebView.postMessage(JSON.stringify(message));
  }
};

/**
 * 조리 시작 메시지 전송
 * @param recipeData - 레시피 데이터
 */
export const sendStartCooking = (recipeData: RecipeData): void => {
  sendWebViewMessage(WEBVIEW_MESSAGE_TYPES.START_COOKING, recipeData);
};

/**
 * 조리 완료 메시지 전송
 * @param recipeData - 레시피 데이터
 */
export const sendFinishCooking = (recipeData: RecipeData): void => {
  sendWebViewMessage(WEBVIEW_MESSAGE_TYPES.FINISH_COOKING, recipeData);
};

/**
 * 레시피로 돌아가기 메시지 전송
 * @param recipeData - 레시피 데이터
 */
export const sendBackToRecipe = (recipeData: RecipeData): void => {
  sendWebViewMessage(WEBVIEW_MESSAGE_TYPES.BACK_TO_RECIPE, recipeData);
};

/**
 * 뒤로가기 메시지 전송
 * @param recipeData - 레시피 데이터
 */
export const sendBackPressed = (recipeData: RecipeData): void => {
  sendWebViewMessage(WEBVIEW_MESSAGE_TYPES.BACK_PRESSED, recipeData);
}; 