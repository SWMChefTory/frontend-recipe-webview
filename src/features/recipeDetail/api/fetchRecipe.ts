import { RecipeData } from '../types/recipe';

const BASE_API_URL = 'https://cheftories.com';

export const fetchRecipe = async (id: string, accessToken: string | null): Promise<RecipeData> => {
  if (!accessToken) {
    throw new Error('Access token이 없습니다.');
  }

  const response = await fetch(`${BASE_API_URL}/api/v1/recipes/${id}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP 오류! 상태 코드: ${response.status}`);
  }

  const apiResponse: RecipeData = await response.json();

  // API 응답을 기존 RecipeData와 호환되는 형태로 변환
  // (현재 RecipeData 타입이 API 응답 구조와 일치하도록 업데이트되었으므로 추가 변환은 필요 없음)
  // 만약 RecipeData를 이전처럼 title, youtubeEmbedId 등으로 사용한다면 여기서 변환 로직 추가

  return apiResponse;
};
