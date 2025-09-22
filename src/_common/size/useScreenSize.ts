import { useEffect } from 'react';
import { create } from 'zustand';

interface ScreenSize {
  width: number;
  height: number;
}

interface ScreenSizeStore {
  screenSize: ScreenSize;
  setScreenSize: (screenSize: ScreenSize) => void;
}

const useScreenSizeStore = create<ScreenSizeStore>((set, get) => {
  return {
    screenSize: {
      width: 0,
      height: 0,
    },
    setScreenSize: (screenSize: ScreenSize) => {
      set({ screenSize: { ...get().screenSize, ...screenSize } });
    },
  };
});

export function useInitScreenSize() {
  const { setScreenSize } = useScreenSizeStore();
  console.log('useInitScreenSize');

  useEffect(() => {
    console.log('useScreenSize');

    const updateScreenSize = () => {
      console.log('updateScreenSize', window.screen.width, window.screen.height);
      setScreenSize({
        width: window.screen.width,
        height: window.screen.height,
      });
    };

    updateScreenSize();

    window.addEventListener('orientationchange', updateScreenSize);

    return () => {
      window.removeEventListener('orientationchange', updateScreenSize);
    };
  }, [setScreenSize]);
}

export function useScreenSize() {
  const { screenSize } = useScreenSizeStore();

  return screenSize;
}

