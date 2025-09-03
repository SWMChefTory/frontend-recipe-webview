import { sendRequestAccessTokenRefresh } from 'features/bridge/utils/webview';
import { RecipeData } from '../types/recipe';

const BASE_API_URL = 'https://api.cheftories.com';

export const fetchRecipe = async (id: string, accessToken: string | null): Promise<RecipeData> => {
  if (!accessToken) {
    throw new Error('Access token이 없습니다.');
  }

  const response = await fetch(`${BASE_API_URL}/api/v1/recipes/${id}`, {
    headers: {
      Authorization: `${accessToken}`,
    },
  });

  if (!response.ok) {
    // 401 또는 403 에러 시 토큰 재요청
    if (response.status === 401 || response.status === 403) {
      sendRequestAccessTokenRefresh();
    }
    throw new Error(`HTTP 오류! 상태 코드: ${response.status}`);
  }

  const apiResponse: RecipeData = await response.json();

  return apiResponse;
};
