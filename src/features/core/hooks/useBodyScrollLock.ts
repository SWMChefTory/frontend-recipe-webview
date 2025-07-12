import { useEffect } from 'react';

/**
 * body 스크롤을 잠그거나 해제하는 커스텀 훅
 * @param isLocked - 스크롤 잠금 여부
 */
export const useBodyScrollLock = (isLocked: boolean): void => {
  useEffect(() => {
    const bodyStyle = document.body.style;
    const documentElementStyle = document.documentElement.style;

    if (isLocked) {
      // 스크롤 잠금
      bodyStyle.overflow = 'hidden';
      bodyStyle.height = '100vh';
      documentElementStyle.overflow = 'hidden';
      documentElementStyle.height = '100vh';
    } else {
      // 스크롤 잠금 해제
      bodyStyle.overflow = '';
      bodyStyle.height = '';
      documentElementStyle.overflow = '';
      documentElementStyle.height = '';
    }

    // 정리 함수 - 컴포넌트 언마운트 시 스타일 초기화
    return () => {
      bodyStyle.overflow = '';
      bodyStyle.height = '';
      documentElementStyle.overflow = '';
      documentElementStyle.height = '';
    };
  }, [isLocked]);
}; 