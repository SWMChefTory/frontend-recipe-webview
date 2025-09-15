// Recipe types exports
import { RecipeData } from './recipe';

export * from './recipe';

// 레시피 정보 컴포넌트 Props
export interface RecipeInfoProps {
  recipeData: RecipeData;
  onStartRecipeStep: () => void;
  onBack: () => void;
}
