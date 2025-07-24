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
  seekTo?: (seconds: number) => void; // 유튜브 동영상 이동 함수
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
 * 지연 함수 (async/await 사용)
 */
const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * 단계별 음성 감지를 관리하는 커스텀 훅 (실시간 STT 기반)
 * @param carouselControls - 캐러셀 제어 객체
 * @param autoStart - 자동 시작 여부
 * @returns 단계별 음성 감지 상태와 함수들
 */
export const useStepSpeechRecognition = (
  carouselControls: CarouselControls,
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
        // TIMESTAMP 명령 처리: stepNumber를 초(second)로 간주하여 유튜브 동영상 이동
        if (typeof stepNumber === 'number' && stepNumber >= 0) {
          if (typeof (carouselControls as any).seekTo === 'function') {
            (carouselControls as any).seekTo(stepNumber);
          }
        }
        break;

      default:
        // STEPn 명령 처리
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
  } = useSpeechRecognition(handleVoiceCommand);

  const [stepVoiceDetections, setStepVoiceDetections] = useState<StepVoiceDetections>({});
  const [prevStep, setPrevStep] = useState<number>(carouselControls.currentStep);

  // 컴포넌트 마운트 시 자동으로 음성 인식 시작 (YouTube 로딩 완료 후)
  useEffect(() => {
    if (isSupported && autoStart && !hasStartedRef.current) {
      hasStartedRef.current = true; // 시작 플래그 설정

      const startListeningDelayed = async (): Promise<void> => {
        await delay(1500); // YouTube가 완전히 로드된 후 음성 인식 시작
        startListening();
      };

      startListeningDelayed();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
