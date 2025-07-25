import { useEffect, useState } from 'react';
import { fetchRecipe } from '../api/fetchRecipe'; // fetchRecipe 임포트
import { RecipeData } from '../types/recipe';

// 훅 반환 타입
interface UseRecipeDataResult {
  recipeData: RecipeData | null;
  loading: boolean;
  error: string | null;
}

/**
 * 레시피 데이터 로딩을 담당하는 커스텀 훅
 * @param recipeId - 레시피 ID
 * @param accessToken - 액세스 토큰
 * @returns 레시피 데이터, 로딩 상태, 에러 상태
 */
export const useRecipeData = (
  recipeId?: string,
  accessToken?: string | null,
): UseRecipeDataResult => {
  const [recipeData, setRecipeData] = useState<RecipeData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRecipeData = async (): Promise<void> => {
      if (!recipeId) {
        setError('레시피 아이디를 찾을 수 없습니다.');
        setLoading(false); // 로딩 완료
        return;
      }
      if (!accessToken) {
        setError('액세스 토큰이 없습니다.');
        setLoading(false); // 로딩 완료
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const recipeResponse = await fetchRecipe(recipeId, accessToken);

        setRecipeData(recipeResponse);
      } catch (err) {
        console.error('Failed to load recipe data:', err);
        setError(
          err instanceof Error ? err.message : `레시피 데이터 로딩 중 오류가 발생했습니다: ${err}`,
        );
        setRecipeData(null);
      } finally {
        setLoading(false);
      }
    };

    loadRecipeData();
  }, [recipeId, accessToken]);

  return { recipeData, loading, error };
};
