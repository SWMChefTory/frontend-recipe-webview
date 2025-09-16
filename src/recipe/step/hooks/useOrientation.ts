import { useEffect, useState } from 'react';


//safari 16.4 chrome 38 부터 지원
//https://developer.mozilla.org/en-US/docs/Web/API/ScreenOrientation#browser_compatibility 참고
export const useOrientation = () => {
  const [orientation, setOrientation] = useState<'landscape'| 'portrait'>(extractOrientation(window.screen.orientation.type));
  useEffect(() => {
    const listenOrientationChange = () => {
        window.screen.orientation.addEventListener("change", () => {
            const type = window.screen.orientation.type;
            setOrientation(extractOrientation(type));
          });
    };
    listenOrientationChange();
    return () => {
      window.screen.orientation.removeEventListener("change", listenOrientationChange);
    };
  }, []);

  return {orientation};
};

function extractOrientation(orientation: OrientationType): 'landscape' | 'portrait' {
  if (orientation === 'landscape-primary' || orientation === 'landscape-secondary') {
    return 'landscape';
  }
  return 'portrait';
}