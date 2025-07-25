// 재료 타입
export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
}

// 조리 단계 타입
export interface RecipeStep {
  id: string | null;
  step_order: number;
  subtitle: string;
  details: readonly string[];
  start_time: number;
  end_time: number;
}

// 비디오 정보 타입
export interface VideoInfo {
  video_id: string;
  video_title: string;
  video_thumbnail_url: string;
  video_seconds: number;
}

// 재료 정보 타입
export interface IngredientsInfo {
  id: string;
  ingredients: readonly Ingredient[];
}

// 시청 상태 정보 타입
export interface ViewStatus {
  id: string;
  viewed_at: string;
  last_play_seconds: number;
  created_at: string;
}

// 레시피 데이터 타입 (API 응답과 맵핑)
export interface RecipeData {
  recipe_status: 'READY' | 'NOT_COOK_URL' | 'FAILED' | 'COMPLETED';
  video_info: VideoInfo;
  ingredients_info: IngredientsInfo;
  recipe_steps: readonly RecipeStep[];
  view_status: ViewStatus;
}

// Mock 레시피 데이터베이스 타입 (이제 사용되지 않을 수 있음)
export interface MockRecipes {
  [key: string]: RecipeData;
}
