import { RecipeData } from '../../recipeDetail/types/recipe';

// Bridge 메시지 타입들
export type BridgeMessageType = 
  | 'START_COOKING'
  | 'FINISH_COOKING'
  | 'BACK_TO_RECIPE'
  | 'BACK_PRESSED';

// Bridge 메시지 인터페이스
export interface BridgeMessage {
  type: BridgeMessageType;
  data: RecipeData | null;
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