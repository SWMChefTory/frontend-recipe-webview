import { RecipeData } from '../types/recipe';

const BASE_API_URL = 'https://cheftories.com';

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
    throw new Error(`HTTP 오류! 상태 코드: ${response.status}`);
  }

  const apiResponse: RecipeData = await response.json();

  return apiResponse;
};
