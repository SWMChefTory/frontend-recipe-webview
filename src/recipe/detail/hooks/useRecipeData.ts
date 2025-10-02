import { useSuspenseQuery } from '@tanstack/react-query';
import { useAccessToken } from 'bridge';
import { sendRequestAccessTokenRefresh } from 'bridge/utils/webview';
import { useEffect, useRef } from 'react';
import { fetchRecipe } from '../api/fetchRecipe';
import { RecipeData } from '../types/recipe';

interface UseRecipeDataResult {
  recipeData: RecipeData;
}

/**
 * 레시피 데이터 로딩을 담당하는 커스텀 훅 (React Query Suspense 버전)
 * @param recipeId - 레시피 ID
 * @returns 레시피 데이터
 */
export const useRecipeData = (recipeId: string): UseRecipeDataResult => {
  const accessToken = useAccessToken();
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: recipeData } = useSuspenseQuery({
    queryKey: ['recipe', recipeId, accessToken],
    queryFn: async () => {
      if (!recipeId) {
        throw new Error('레시피를 찾을 수 없습니다.');
      }

      if (!accessToken || !accessToken.startsWith('Bearer ')) {
        sendRequestAccessTokenRefresh();

        await new Promise((_, reject) => {
          refreshTimeoutRef.current = setTimeout(() => {
            reject(new Error('인증이 만료되었습니다.'));
          }, 3000);
        });
      }

      const recipeResponse = await fetchRecipe(recipeId, accessToken!);

      if ((recipeResponse as any)?.errorCode === 'AUTH_001') {
        sendRequestAccessTokenRefresh();

        await new Promise((_, reject) => {
          refreshTimeoutRef.current = setTimeout(() => {
            reject(new Error('인증이 만료되었습니다.'));
          }, 3000);
        });
      }

      return recipeResponse;
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }
    };
  }, []);

  return {
    recipeData,
  };
};