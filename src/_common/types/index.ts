
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}


export interface ErrorProps {
  error: string;
}

export interface LoadingProps extends BaseComponentProps {}


export interface HeaderProps {
  title: string;
  currentStep?: number;
  totalSteps?: number;
  onBack: () => void;
  onTimerClick?: () => void;
  darkMode?: boolean;
  isVisible?: boolean;
  className?: string;
  onHeaderToggle?: () => void;
}


export interface YouTubePlayerProps {
  youtubeEmbedId: string;
  title: string;
  autoplay?: boolean;
  youtubeKey?: number;
}


export interface StepDotsProps {
  totalSteps: number;
  currentStep: number;
  onStepClick: (stepIndex: number) => void;
}


export interface SpeechRecognitionProps {
  isListening: boolean;
  isVoiceDetected: boolean;
  transcript: string;
  error: string | null;
  isSupported: boolean;
}
