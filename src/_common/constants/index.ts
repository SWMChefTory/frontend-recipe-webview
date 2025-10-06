import { BridgeMessageType } from '../../bridge/types/webview';

export const WEBVIEW_MESSAGE_TYPES: Record<string, BridgeMessageType> = {
  BACK_PRESSED: 'BACK_PRESSED',
  REFRESH_TOKEN: 'REFRESH_TOKEN',
  TIMER_START: 'TIMER_START',
  TIMER_STOP: 'TIMER_STOP',
  TIMER_CHECK: 'TIMER_CHECK',
  TIMER_SET: 'TIMER_SET',
  UNLOCK_ORIENTATION: 'UNLOCK_ORIENTATION',
  LOCK_TO_PORTRAIT_UP: 'LOCK_TO_PORTRAIT_UP',
} as const;

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
