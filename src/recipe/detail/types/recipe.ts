// 재료 타입
export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
}

// 조리 단계 타입
export interface RecipeStep {
  id: string;
  step_order: number;
  subtitle: string;
  start_time: number;
  details: readonly RecipeStepDetail[];
}
export interface RecipeStepDetail {
  text: string;
  start: number;
}
// 비디오 정보 타입
export interface VideoInfo {
  video_id: string;
  video_title: string;
  video_thumbnail_url: string;
  video_seconds: number;
}

// 재료 정보 타입
export interface Analysis {
  id: string;
  ingredients: Ingredient[];
  description: string;
  tags: string[];
  servings: number;
  cook_time: number;
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
  analysis: Analysis;
  recipe_steps: RecipeStep[];
  view_status: ViewStatus;
}

// Mock 레시피 데이터베이스 타입 (이제 사용되지 않을 수 있음)
export interface MockRecipes {
  [key: string]: RecipeData;
}
