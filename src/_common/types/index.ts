// Core types exports
// 공통 컴포넌트 Props 타입들
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// 에러 컴포넌트 Props
export interface ErrorProps {
  error: string;
}

// 로딩 컴포넌트 Props
export interface LoadingProps extends BaseComponentProps {}

// YouTube 플레이어 Props
export interface YouTubePlayerProps {
  youtubeEmbedId: string;
  title: string;
  autoplay?: boolean;
  youtubeKey?: number;
}

// 단계 인디케이터 Props
export interface StepDotsProps {
  totalSteps: number;
  currentStep: number;
  onStepClick: (stepIndex: number) => void;
}

// 음성 감지 컴포넌트 Props
export interface SpeechRecognitionProps {
  isListening: boolean;
  isVoiceDetected: boolean;
  transcript: string;
  error: string | null;
  isSupported: boolean;
}
