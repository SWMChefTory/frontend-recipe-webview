import { RecipeData } from '../../recipe/detail/types/recipe';

// Bridge 메시지 타입들
export type BridgeMessageType =
  | 'GO_HOME'
  | 'REFRESH_TOKEN'
  | 'TIMER_START'
  | 'TIMER_STOP'
  | 'TIMER_CHECK'
  | 'TIMER_SET'
  | 'LOCK_TO_PORTRAIT_UP'
  | 'LOCK_TO_LANDSCAPE_LEFT'
  | 'LOCK_TO_LANDSCAPE_RIGHT';

// Bridge 메시지 인터페이스
export interface BridgeMessage {
  type: BridgeMessageType;
  data: RecipeData | null;
  recipe_id?: string;
  recipe_title?: string;
  timer_time?: string;
  orientation?: string;
}

// Slick 캐러셀 설정 타입
export interface SlickSettings {
  dots: boolean;
  infinite: boolean;
  speed: number;
  slidesToShow: number;
  slidesToScroll: number;
  centerMode: boolean;
  centerPadding: string;
  swipeToSlide: boolean;
  touchThreshold: number;
  arrows?: boolean;
  adaptiveHeight?: boolean;
  draggable?: boolean;
  beforeChange?: (current: number, next: number) => void;
  afterChange?: (current: number) => void;
  responsive?: Array<{
    breakpoint: number;
    settings: Partial<SlickSettings>;
  }>;
}
