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

/**
 * 시간을 MM:SS 형식으로 포맷팅
 * @param seconds - 초 단위 시간
 * @returns MM:SS 형식의 시간 문자열
 */
export const formatTimeToMMSS = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * 시간 문자열을 초로 변환 (MM:SS 형식)
 * @param timeString - MM:SS 형식의 시간 문자열
 * @returns 초 단위 시간
 */
export const parseTimeToSeconds = (timeString: string): number => {
  const parts = timeString.split(':');
  if (parts.length !== 2) {
    throw new Error('Invalid time format. Expected MM:SS');
  }
  
  const minutes = parseInt(parts[0], 10);
  const seconds = parseInt(parts[1], 10);
  
  if (isNaN(minutes) || isNaN(seconds)) {
    throw new Error('Invalid time format. Expected numeric values');
  }
  
  return minutes * 60 + seconds;
}; 