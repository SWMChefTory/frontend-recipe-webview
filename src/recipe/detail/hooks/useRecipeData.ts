import { useSuspenseQuery } from '@tanstack/react-query';
import { useAccessToken } from 'bridge';
import { sendRequestAccessTokenRefresh } from 'bridge/utils/webview';
import { fetchRecipe } from '../api/fetchRecipe';
import { RecipeData } from '../types/recipe';

interface UseRecipeDataResult {
  recipeData: RecipeData;
}

export const useRecipeData = (recipeId: string): UseRecipeDataResult => {
  const accessToken = useAccessToken();

  const { data: recipeData } = useSuspenseQuery({
    queryKey: ['recipe', recipeId, accessToken],
    queryFn: async () => {
      if (!recipeId) {
        throw new Error('레시피를 찾을 수 없습니다.');
      }

      if (!accessToken || !accessToken.startsWith('Bearer ')) {
        sendRequestAccessTokenRefresh();
        throw new Error('TOKEN_REQUIRED');
      }

      const recipeResponse = await fetchRecipe(recipeId, accessToken);

      if ((recipeResponse as any)?.errorCode === 'AUTH_001') {
        sendRequestAccessTokenRefresh();
        throw new Error('TOKEN_EXPIRED');
      }

      return recipeResponse;
    },
    retry: (failureCount, error) => {
      const errorMessage = (error as Error).message;
      return (
        failureCount < 2 &&
        (errorMessage === 'TOKEN_REQUIRED' || errorMessage === 'TOKEN_EXPIRED')
      );
    },
    retryDelay: 300,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  return { recipeData };
};