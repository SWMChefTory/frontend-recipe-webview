// Cooking module exports
import { RecipeData } from '../detail/types';

export * from './components';
export * from './hooks';

// CookingMode 컴포넌트 Props
export interface CookingModeProps {
  recipeData: RecipeData;
  onFinishCooking: () => void;
  onBackToRecipe: () => void;
}
