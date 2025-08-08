/**
 * 시간 포맷 함수 (초를 분:초 형식으로 변환)
 * @param seconds - 초 단위 시간
 * @returns 포맷된 시간 문자열
 */
export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}분 ${remainingSeconds > 0 ? `${remainingSeconds}초` : ''}`.trim();
};
