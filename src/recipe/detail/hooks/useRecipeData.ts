import { useAccessToken } from 'app/AccessTokenProvider';
import { sendRequestAccessTokenRefresh } from 'bridge/utils/webview';
import { useEffect, useState } from 'react';
import { fetchRecipe } from '../api/fetchRecipe';
import { RecipeData } from '../types/recipe';

interface UseRecipeDataResult {
  recipeData: RecipeData | null;
  isLoading: boolean;
  errorMessage: string | null;
}

/**
 * 레시피 데이터 로딩을 담당하는 커스텀 훅
 * @param recipeId - 레시피 ID
 * @returns 레시피 데이터, 로딩 상태, 에러 상태
 */
export const useRecipeData = (recipeId?: string): UseRecipeDataResult => {
  const accessToken = useAccessToken();

  const [recipeData, setRecipeData] = useState<RecipeData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    setRecipeData(null);

    let refreshTimeout: ReturnType<typeof setTimeout> | null = null;
    let isWaitingForTokenRefresh = false;

    const loadRecipeData = async () => {
      if (!recipeId) {
        setError('레시피를 찾을 수 없습니다.');
        setIsLoading(false);
        return;
      }

      if (!accessToken || !accessToken.startsWith('Bearer ')) {
        // 토큰 재발급 요청 후 3초 동안 로딩 유지, 이후 에러 페이지 표시
        isWaitingForTokenRefresh = true;
        sendRequestAccessTokenRefresh();
        refreshTimeout = setTimeout(() => {
          setError('인증이 만료되었습니다.');
          setIsLoading(false);
        }, 3000);
        return;
      }

      try {
        const recipeResponse = await fetchRecipe(recipeId, accessToken);
        if ((recipeResponse as any)?.errorCode === 'AUTH_001') {
          // 토큰 재발급 요청 후 3초 동안 로딩 유지, 이후 에러 페이지 표시
          isWaitingForTokenRefresh = true;
          sendRequestAccessTokenRefresh();
          refreshTimeout = setTimeout(() => {
            setError('인증이 만료되었습니다.');
            setIsLoading(false);
          }, 3000);
          return;
        }
        setRecipeData(recipeResponse);
      } catch (err) {
        setError(err instanceof Error ? err.message : '레시피를 불러오는 데 실패했습니다.');
      } finally {
        if (!isWaitingForTokenRefresh) {
          setIsLoading(false);
        }
      }
    };
    loadRecipeData();

    return () => {
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
        refreshTimeout = null;
      }
    };
  }, [recipeId, accessToken]);

  return { recipeData, isLoading, errorMessage: error };
};
