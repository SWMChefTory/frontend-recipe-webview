import { RecipeData } from "../types/recipe";

export const fetchRecipe = async (id: string): Promise<RecipeData> => {
  const res = await fetch(`/api/recipes/${id}`);
  if (!res.ok) {
    throw new Error(`HTTP 오류! 상태 코드: ${res.status}`);
  }
  return res.json();
};
