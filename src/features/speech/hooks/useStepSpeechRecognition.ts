import { useEffect, useRef, useState } from 'react';
import { useSpeechRecognition, VoiceCommand, VoiceCommandCallback } from './useSpeechRecognition';

// 단계별 음성 감지 기록 타입
type StepVoiceDetections = Record<number, boolean>;

// 캐러셀 제어 인터페이스
interface CarouselControls {
  goToNext: () => void;
  goToPrevious: () => void;
  goToStep: (step: number) => void;
  currentStep: number;
  totalSteps: number;
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
  autoStart: boolean = true
): UseStepSpeechRecognitionResult => {
  const lastCommandRef = useRef<string>('');
  const commandTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasStartedRef = useRef<boolean>(false); // 연결 시작 여부 추적

  /**
   * 음성 명령 처리 함수
   */
  const handleVoiceCommand: VoiceCommandCallback = (command: VoiceCommand, stepNumber?: number) => {
    console.log('=== 음성 명령 수신 ===');
    console.log('명령:', command, '단계 번호:', stepNumber);
    console.log('현재 carouselControls.currentStep:', carouselControls.currentStep);
    console.log('현재 carouselControls.totalSteps:', carouselControls.totalSteps);

    // 중복 명령 방지 (1초 내)
    const commandKey = `${command}_${stepNumber || ''}`;
    if (lastCommandRef.current === commandKey) {
      console.log('중복 명령 무시:', commandKey);
      return;
    }

    lastCommandRef.current = commandKey;

    // 1초 후 중복 방지 해제
    if (commandTimeoutRef.current) {
      clearTimeout(commandTimeoutRef.current);
    }
    commandTimeoutRef.current = setTimeout(() => {
      lastCommandRef.current = '';
      console.log('중복 방지 해제');
    }, 1000);

    switch (command) {
      case 'NEXT':
        console.log(`NEXT 명령 처리: ${carouselControls.currentStep} < ${carouselControls.totalSteps}?`);
        if (carouselControls.currentStep < carouselControls.totalSteps) {
          console.log('다음 단계로 이동 실행');
          carouselControls.goToNext();
        } else {
          console.log('마지막 단계입니다');
        }
        break;

      case 'PREV':
        console.log(`PREV 명령 처리: ${carouselControls.currentStep} > 1?`);
        if (carouselControls.currentStep > 1) {
          console.log('이전 단계로 이동 실행');
          carouselControls.goToPrevious();
        } else {
          console.log('첫 번째 단계입니다');
        }
        break;

      default:
        // STEPn 명령 처리
        if (stepNumber && stepNumber >= 1 && stepNumber <= carouselControls.totalSteps) {
          console.log(`${stepNumber}번째 단계로 이동 실행`);
          carouselControls.goToStep(stepNumber);
        } else {
          console.log('잘못된 단계 번호:', stepNumber, '(허용 범위: 1-' + carouselControls.totalSteps + ')');
        }
        break;
    }
    console.log('=== 음성 명령 처리 완료 ===');
  };

  const {
    isListening,
    isVoiceDetected,
    transcript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetDetection
  } = useSpeechRecognition(handleVoiceCommand);

  const [stepVoiceDetections, setStepVoiceDetections] = useState<StepVoiceDetections>({});
  const [prevStep, setPrevStep] = useState<number>(carouselControls.currentStep);

  // 컴포넌트 마운트 시 자동으로 음성 인식 시작 (YouTube 로딩 완료 후)
  useEffect(() => {
    if (isSupported && autoStart && !hasStartedRef.current) {
      hasStartedRef.current = true; // 시작 플래그 설정
      
      const startListeningDelayed = async (): Promise<void> => {
        await delay(1500); // YouTube가 완전히 로드된 후 음성 인식 시작
        console.log('음성 인식 시작 시도 - 한 번만 실행');
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
        [carouselControls.currentStep]: true
      }));
    }
  }, [isVoiceDetected, carouselControls.currentStep]);

  // 단계가 변경될 때 감지 상태 리셋
  useEffect(() => {
    if (carouselControls.currentStep !== prevStep) {
      console.log('=== 단계 변경 감지 ===');
      console.log('이전 단계:', prevStep, '-> 현재 단계:', carouselControls.currentStep);
      setPrevStep(carouselControls.currentStep);
      resetDetection();
      
      // 중복 방지도 리셋
      lastCommandRef.current = '';
      if (commandTimeoutRef.current) {
        clearTimeout(commandTimeoutRef.current);
        commandTimeoutRef.current = null;
      }
      console.log('중복 방지 ref 리셋 완료');
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
  const currentStepVoiceDetected = stepVoiceDetections[carouselControls.currentStep] || isVoiceDetected;

  return {
    isListening,
    isVoiceDetected: currentStepVoiceDetected,
    transcript,
    error,
    isSupported,
    stepVoiceDetections,
    startListening,
    stopListening,
    resetDetection
  };
}; 