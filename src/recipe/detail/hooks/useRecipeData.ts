import { useAccessToken } from 'bridge';
import { sendRequestAccessTokenRefresh } from 'bridge/utils/webview';
import { useEffect, useState } from 'react';
import { fetchRecipe } from '../api/fetchRecipe';
import { RecipeData } from '../types/recipe';

interface UseRecipeDataResult {
  recipeData: RecipeData | null;
  loading: boolean;
  error: string | null;
}

/**
 * 레시피 데이터 로딩을 담당하는 커스텀 훅
 * @param recipeId - 레시피 ID
 * @returns 레시피 데이터, 로딩 상태, 에러 상태
 */
export const useRecipeData = (recipeId?: string): UseRecipeDataResult => {
  const accessToken = useAccessToken();

  const [recipeData, setRecipeData] = useState<RecipeData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setRecipeData(null);

    const loadRecipeData = async () => {
      if (!recipeId) {
        setError('레시피 ID가 없습니다.');
        setLoading(false);
        return;
      }

      if (!accessToken || !accessToken.startsWith('Bearer ')) {
        setError('유효하지 않은 액세스 토큰입니다.');
        setLoading(false);
        return;
      }

      try {
        const recipeResponse = await fetchRecipe(recipeId, accessToken);
        if ((recipeResponse as any)?.errorCode === 'AUTH_001') {
          sendRequestAccessTokenRefresh();
          return;
        }
        setRecipeData(recipeResponse);
      } catch (err) {
        setError(err instanceof Error ? err.message : '레시피 데이터를 불러오는 중 오류 발생');
      } finally {
        setLoading(false);
      }
    };

    loadRecipeData();
  }, [recipeId, accessToken]);

  return { recipeData, loading, error };
};
