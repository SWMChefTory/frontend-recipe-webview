// 재료 타입
export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
}

// 조리 단계 타입
export interface RecipeStep {
  subtitle: string;
  details: readonly string[];
  start: number;
  end: number;
}

// 레시피 데이터 타입
export interface RecipeData {
  id: number;
  title: string;
  description: string;
  total_time_sec: number;
  youtubeEmbedId: string;
  ingredients: readonly Ingredient[];
  steps: readonly RecipeStep[];
}

export interface RecipeResponse {
    recipeStatus: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING' | string;
    videoInfo: VideoInfo;
    ingredientsInfo: IngredientsInfo;
    recipeStepInfos: RecipeStepInfo[];
  }
  
  export interface VideoInfo {
    videoId: string;
    title: string;
    channelTitle: string;
    thumbnailUrl: string;
  }
  
  export interface IngredientsInfo {
    ingredientsId: string;
    ingredients: Ingredient[];
  }
  
  export interface RecipeStepInfo {
    id: string;
    order: number;
    subtitle: string;
    details: string[];
    start: number;
    end: number;
  }
  

// Mock 레시피 데이터베이스 타입
export interface MockRecipes {
  [key: string]: RecipeData;
} 