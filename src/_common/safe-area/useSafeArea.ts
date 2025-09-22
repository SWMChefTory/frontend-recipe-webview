import { create } from 'zustand';
import useBrowserInfo from '_common/safe-area/info/useBrowserInfo';
import { useEffect } from 'react';

interface SafeAreaState {
  safeArea: { top: number; bottom: number; left: number; right: number };
  setSafeArea: ({
    top,
    bottom,
    left,
    right,
  }: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  }) => void;
  removeSafeArea: () => void;
}

const useSafeAreaStore = create<SafeAreaState>(set => {
  return {
    safeArea: { top: 0, bottom: 0, left: 0, right: 0 },
    setSafeArea: ({ top, bottom, left, right }) => {
      set({ safeArea: { top, bottom, left, right } });
    },
    removeSafeArea: () => {
      set({ safeArea: { top: 0, bottom: 0, left: 0, right: 0 } });
    },
  };
});

//safari 16.4 chrome 38 부터 지원
//한번만 사용해야 함.
//https://developer.mozilla.org/en-US/docs/Web/API/ScreenOrientation#browser_compatibility 참고
export default function useInitSafeArea() {
  // const { setSize } = useSizeStore();
  const {setSafeArea, removeSafeArea } = useSafeAreaStore();
  const { browserName, browserVersion } = useBrowserInfo();

  console.log(browserName, browserVersion);

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
        (msg as any).type === 'SAFE_AREA' &&
        (msg as any).safe_area
      ) {
        // const safeArea = JSON.parse((msg as any).safe_area);
        const safeArea = (msg as any).safe_area;
        setSafeArea({
          top: safeArea.top || 0,
          bottom: safeArea.bottom || 0,
          left: safeArea.left || 0,
          right: safeArea.right || 0,
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
      removeSafeArea();
    }
  }, [setSafeArea, removeSafeArea]);
}

export function useSafeArea() {
  const { safeArea } = useSafeAreaStore();
  return safeArea;
}
