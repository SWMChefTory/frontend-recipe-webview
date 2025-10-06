import { RecipeData } from '../../recipe/detail/types/recipe';

export type BridgeMessageType =
  | 'BACK_PRESSED'
  | 'REFRESH_TOKEN'
  | 'TIMER_START'
  | 'TIMER_STOP'
  | 'TIMER_CHECK'
  | 'TIMER_SET'
  | 'UNLOCK_ORIENTATION'
  | 'LOCK_TO_PORTRAIT_UP';

export interface BridgeMessage {
  type: BridgeMessageType;
  data: RecipeData | null;
  recipe_id?: string;
  recipe_title?: string;
  timer_time?: string;
}

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
