import { RecipeData } from '../types/recipe';

const BASE_API_URL = 'https://dev.api.cheftories.com';

export const fetchRecipe = async (id: string, accessToken: string): Promise<RecipeData> => {
  const response = await fetch(`${BASE_API_URL}/api/v1/recipes/${id}`, {
    headers: {
      Authorization: `${accessToken}`,
    },
  });

  const apiResponse: RecipeData = await response.json();

  return apiResponse;
};
