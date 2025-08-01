import { useEffect, useRef, useState } from 'react';
import { VoiceCommand, VoiceCommandCallback } from '../types/voice';
import { useSpeechRecognition } from './useSpeechRecognition';

// 단계별 음성 감지 기록 타입
type StepVoiceDetections = Record<number, boolean>;

// 캐러셀 제어 인터페이스
interface CarouselControls {
  goToNext: () => void;
  goToPrevious: () => void;
  goToStep: (step: number) => void;
  currentStep: number;
  totalSteps: number;
  seekTo?: (seconds: number) => void;
}

// 훅 반환 타입
interface UseStepSpeechRecognitionResult {
  isListening: boolean;
  isVoiceDetected: boolean;
  transcript: string;
  error: string | null;
  isSupported: boolean;
  stepVoiceDetections: StepVoiceDetections;
  startListening: () => void;
  stopListening: () => void;
  resetDetection: () => void;
}

/**
 * 단계별 음성 감지를 관리하는 커스텀 훅 (실시간 STT 기반)
 * @param carouselControls - 캐러셀 제어 객체
 * @param autoStart - 자동 시작 여부
 * @returns 단계별 음성 감지 상태와 함수들
 */
export const useStepSpeechRecognition = (
  carouselControls: CarouselControls,
  selectedSttModel: string,
  accessToken: string | null,
  recipeId: string,
  autoStart: boolean = true,
): UseStepSpeechRecognitionResult => {
  const lastCommandRef = useRef<string>('');
  const commandTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasStartedRef = useRef<boolean>(false); // 연결 시작 여부 추적

  /**
   * 음성 명령 처리 함수
   */
  const handleVoiceCommand: VoiceCommandCallback = (command: VoiceCommand, stepNumber?: number) => {
    switch (command) {
      case 'NEXT':
        if (carouselControls.currentStep < carouselControls.totalSteps) {
          carouselControls.goToNext();
        }
        break;

      case 'PREV':
        if (carouselControls.currentStep > 0) {
          carouselControls.goToPrevious();
        }
        break;

      case 'TIMESTAMP':
        if (typeof stepNumber === 'number' && stepNumber >= 0) {
          if (typeof (carouselControls as any).seekTo === 'function') {
            (carouselControls as any).seekTo(stepNumber);
          }
        }
        break;

      default:
        if (stepNumber && stepNumber >= 1 && stepNumber <= carouselControls.totalSteps) {
          carouselControls.goToStep(stepNumber);
        }
        break;
    }
  };

  const {
    isListening,
    isVoiceDetected,
    transcript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetDetection,
  } = useSpeechRecognition(handleVoiceCommand, selectedSttModel, accessToken, recipeId);

  const [stepVoiceDetections, setStepVoiceDetections] = useState<StepVoiceDetections>({});
  const [prevStep, setPrevStep] = useState<number>(carouselControls.currentStep);

  // 컴포넌트 마운트 시 자동으로 음성 인식 시작
  useEffect(() => {
    if (isSupported && autoStart && !hasStartedRef.current) {
      hasStartedRef.current = true;

      const startListeningDelayed = async (): Promise<void> => {
        startListening();
      };

      startListeningDelayed();
    }
  }, [isSupported, autoStart]); // startListening을 의도적으로 제외 (중복 연결 방지)

  // 음성 감지 시 해당 단계에 기록
  useEffect(() => {
    if (isVoiceDetected) {
      setStepVoiceDetections(prev => ({
        ...prev,
        [carouselControls.currentStep]: true,
      }));
    }
  }, [isVoiceDetected, carouselControls.currentStep]);

  // 단계가 변경될 때 감지 상태 리셋
  useEffect(() => {
    if (carouselControls.currentStep !== prevStep) {
      setPrevStep(carouselControls.currentStep);
      resetDetection();

      // 중복 방지도 리셋
      lastCommandRef.current = '';
      if (commandTimeoutRef.current) {
        clearTimeout(commandTimeoutRef.current);
        commandTimeoutRef.current = null;
      }
    }
  }, [carouselControls.currentStep, prevStep, resetDetection]);

  // 컴포넌트 언마운트 시 타이머 정리 및 플래그 리셋
  useEffect(() => {
    return () => {
      if (commandTimeoutRef.current) {
        clearTimeout(commandTimeoutRef.current);
      }
      hasStartedRef.current = false; // 언마운트 시 플래그 리셋
    };
  }, []);

  // 현재 단계의 음성 감지 상태 가져오기
  const currentStepVoiceDetected =
    stepVoiceDetections[carouselControls.currentStep] || isVoiceDetected;

  return {
    isListening,
    isVoiceDetected: currentStepVoiceDetected,
    transcript,
    error,
    isSupported,
    stepVoiceDetections,
    startListening,
    stopListening,
    resetDetection,
  };
};
