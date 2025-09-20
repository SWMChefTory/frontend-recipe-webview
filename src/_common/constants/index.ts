import { BridgeMessageType } from '../../bridge/types/webview';

// React Native WebView 메시지 타입
// enum안하고 Record타입 쓰는 이유는?
export const WEBVIEW_MESSAGE_TYPES: Record<string, BridgeMessageType> = {
  GO_HOME: 'GO_HOME',
  REFRESH_TOKEN: 'REFRESH_TOKEN',
  TIMER_START: 'TIMER_START',
  TIMER_STOP: 'TIMER_STOP',
  TIMER_CHECK: 'TIMER_CHECK',
  TIMER_SET: 'TIMER_SET',
  LOCK_TO_PORTRAIT_UP : 'LOCK_TO_PORTRAIT_UP',
  LOCK_TO_LANDSCAPE_LEFT : 'LOCK_TO_LANDSCAPE_LEFT',
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
