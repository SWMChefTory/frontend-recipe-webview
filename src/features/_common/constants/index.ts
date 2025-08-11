import { BridgeMessageType } from '../../bridge/types/webview';

// 애플리케이션 전체에서 사용되는 상수들
export const TRANSITION_DURATION = 150;
export const LOADING_SIMULATION_DELAY = 500;

export const DEFAULT_RECIPE_ID = '1';

// React Native WebView 메시지 타입
export const WEBVIEW_MESSAGE_TYPES: Record<string, BridgeMessageType> = {
  START_COOKING: 'START_COOKING',
  FINISH_COOKING: 'FINISH_COOKING',
  BACK_TO_RECIPE: 'BACK_TO_RECIPE',
  BACK_PRESSED: 'BACK_PRESSED',
  REFRESH_TOKEN: 'REFRESH_TOKEN',
} as const;

// YouTube 설정
export const YOUTUBE_CONFIG = {
  BASE_PARAMS: [
    'enablejsapi=1',
    'rel=0',
    'modestbranding=1',
    'playsinline=1',
    'disablekb=1',
    'iv_load_policy=3',
    'html5=1',
  ] as const,
} as const;
