import { sendBridgeMessage } from 'bridge/utils/webview';
import { WEBVIEW_MESSAGE_TYPES } from '_common/constants';
import { create } from 'zustand';
import { useCallback } from 'react';

export const enum ORIENTATION {
  // LANDSCAPE_LEFT = 'LANDSCAPE_LEFT',
  PORTRAIT_UP = 'PORTRAIT_UP',
  LANDSCAPE_RIGHT = 'LANDSCAPE_RIGHT',
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
      set({ orientation: width > height ? ORIENTATION.LANDSCAPE_RIGHT : ORIENTATION.PORTRAIT_UP });
    },
    toPortrait: () => {
      set({ orientation: ORIENTATION.PORTRAIT_UP });
    },
    toLandscape: () => {
      set({ orientation: ORIENTATION.LANDSCAPE_RIGHT });
    },
  };
});

export function useOrientation() {
  const { orientation, toPortrait, toLandscape } = orientationStore();
  const handlePortrait = useCallback(()=>{
    sendBridgeMessage(WEBVIEW_MESSAGE_TYPES.LOCK_TO_PORTRAIT_UP, null);
    toPortrait();
  }, [toPortrait]);
  const handleLandscape = useCallback(()=>{
    sendBridgeMessage(WEBVIEW_MESSAGE_TYPES.LOCK_TO_LANDSCAPE_RIGHT, null);
    toLandscape();
  },[toLandscape]);

  const isPortrait = useCallback(()=>{
    return orientation === ORIENTATION.PORTRAIT_UP;
  },[orientation]);
  
  return { isPortrait,handlePortrait,handleLandscape };
}
