import { YOUTUBE_CONFIG } from '../constants';

/**
 * YouTube URL 생성 함수 (start time 포함, 자동재생)
 * @param embedId - YouTube 비디오 ID
 * @param startTime - 시작 시간 (초)
 * @param autoplay - 자동재생 여부
 * @returns YouTube embed URL
 */
export const getYouTubeUrl = (
  embedId: string, 
  startTime: number = 0, 
  autoplay: boolean = false
): string => {
  const startTimeSeconds = Math.floor(startTime);
  const currentOrigin = window.location.origin;
  
  const params = [
    ...YOUTUBE_CONFIG.BASE_PARAMS,
    `origin=${currentOrigin}`,
    `widget_referrer=${currentOrigin}`,
    `start=${startTimeSeconds}`,
    `autoplay=${autoplay ? '1' : '0'}`,
  ].join('&');
  
  return `https://www.youtube.com/embed/${embedId}?${params}`;
}; 