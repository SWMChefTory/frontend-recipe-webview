import { RecipeData } from '../types/recipe';

const BASE_API_URL = process.env.REACT_APP_API_URL as string;

export const fetchRecipe = async (id: string, accessToken: string): Promise<RecipeData> => {
  const response = await fetch(`${BASE_API_URL}/api/v1/recipes/${id}`, {
    headers: {
      Authorization: `${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
};
