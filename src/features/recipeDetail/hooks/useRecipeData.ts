import { useEffect, useState } from 'react';
import { USE_MOCK } from '../../core/config';
import { fetchRecipe } from '../api/fetchRecipe';
import { getRecipeById } from '../services/data';
import { RecipeData } from '../types/recipe';

// 훅 반환 타입
interface UseRecipeDataResult {
  recipeData: RecipeData | null;
  loading: boolean;
  error: string | null;
}

/**
 * 레시피 데이터 로딩을 담당하는 커스텀 훅
 * @param recipeId - 레시피 ID (선택적, 없으면 URL에서 추출)
 * @returns 레시피 데이터, 로딩 상태, 에러 상태
 */
export const useRecipeData = (recipeId?: string): UseRecipeDataResult => {
  const [recipeData, setRecipeData] = useState<RecipeData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRecipeData = async (): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        let targetRecipeId: string | null = recipeId || null;
				
				if (!targetRecipeId) {
					throw new Error('레시피 아이디를 찾을 수 없습니다.');
				}

        let recipeResponse: RecipeData | undefined = undefined;

        if (USE_MOCK) {
          recipeResponse = getRecipeById(targetRecipeId);
        } else {
          recipeResponse = await fetchRecipe(targetRecipeId);
        }

        if (!recipeResponse) {
          throw new Error(`레시피가 존재하지 않습니다. Recipe ID: ${targetRecipeId}`);
        }

        setRecipeData(recipeResponse);
      } catch (err) {
        console.error('Failed to load recipe data:', err);
        setError(err instanceof Error ? err.message : `레시피 데이터 로딩 중 오류가 발생했습니다: ${err}`);
        setRecipeData(null);
      } finally {
        setLoading(false);
      }
    };

    loadRecipeData();
  }, [recipeId]);

  return { recipeData, loading, error };
}; 