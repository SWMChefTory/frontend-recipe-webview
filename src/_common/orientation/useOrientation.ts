import { sendBridgeMessage } from 'bridge/utils/webview';
import { WEBVIEW_MESSAGE_TYPES } from '_common/constants';
import { create } from 'zustand';

export const enum ORIENTATION {
  LANDSCAPE_LEFT = 'LANDSCAPE_LEFT',
  PORTRAIT_UP = 'PORTRAIT_UP',
}

interface OrientationState {
  orientation: ORIENTATION;
  setOrientation: ({ width, height }: { width: number; height: number }) => void;
  toPortrait: () => void;
  toLandscape: () => void;
}

const orientationStore = create<OrientationState>(set => {
  return {
    orientation: ORIENTATION.PORTRAIT_UP,
    setOrientation: ({ width, height }: { width: number; height: number }) => {
      set({ orientation: width > height ? ORIENTATION.LANDSCAPE_LEFT : ORIENTATION.PORTRAIT_UP });
    },
    toPortrait: () => {
      set({ orientation: ORIENTATION.PORTRAIT_UP });
    },
    toLandscape: () => {
      set({ orientation: ORIENTATION.LANDSCAPE_LEFT });
    },
  };
});

export function useOrientation() {
  const { orientation, toPortrait, toLandscape } = orientationStore();
  function handlePortrait() {
    sendBridgeMessage(WEBVIEW_MESSAGE_TYPES.LOCK_TO_PORTRAIT_UP, null);
    console.log('handlePortrait');
    toPortrait();
  }
  function handleLandscape() {
    sendBridgeMessage(WEBVIEW_MESSAGE_TYPES.LOCK_TO_LANDSCAPE_LEFT, null);
    toLandscape();
  }
  function isPortrait() {
    return orientation === ORIENTATION.PORTRAIT_UP;
  }
  return { isPortrait,handlePortrait,handleLandscape };
}
