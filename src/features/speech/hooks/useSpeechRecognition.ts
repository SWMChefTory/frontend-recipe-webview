import { useCallback, useEffect, useRef, useState } from 'react';

// 음성 명령 타입
export type VoiceCommand = 'NEXT' | 'PREV' | 'STEP1' | 'STEP2' | 'STEP3' | 'STEP4' | 'STEP5' | 'STEP6' | 'STEP7' | 'STEP8' | 'STEP9' | 'STEP10';

// 음성 명령 콜백 타입
export type VoiceCommandCallback = (command: VoiceCommand, stepNumber?: number) => void;

// 서버 응답 타입
interface ServerResponse {
  status: number;
  data: {
    intent: string;
    base_intent: string;
  };
}

// 훅 반환 타입 - WebSocket 기반 실시간 STT
interface UseSpeechRecognitionResult {
  isListening: boolean;
  isVoiceDetected: boolean;
  transcript: string;
  error: string | null;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetDetection: () => void;
}

// 서버 설정
const STT_SERVER_URL = 'wss://cheftories.com/voice-command/api/v1/voice-command/wss';

// 오디오 설정 상수 (서버 요구사항에 맞춤)
const AUDIO_CONFIG = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
  sampleRate: 16000, // 서버에서 요구하는 16kHz
  channelCount: 1,
} as const;

// 오디오 처리 상수
const BUFFER_SIZE = 8192; // 서버에서 요구하는 블록 크기
const TARGET_SAMPLE_RATE = 16000;

/**
 * WebSocket 기반 실시간 음성 인식 훅
 * @param onVoiceCommand 음성 명령 콜백 함수
 * @returns 음성 인식 상태와 제어 함수들
 */
export const useSpeechRecognition = (onVoiceCommand?: VoiceCommandCallback): UseSpeechRecognitionResult => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isVoiceDetected, setIsVoiceDetected] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState<boolean>(false);
  
  const webSocketRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const voiceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onVoiceCommandRef = useRef<VoiceCommandCallback | undefined>(onVoiceCommand);

  // 콜백 ref 업데이트
  useEffect(() => {
    onVoiceCommandRef.current = onVoiceCommand;
  }, [onVoiceCommand]);

  /**
   * 음성 의도 처리 함수
   */
  const handleVoiceIntent = useCallback((intent: string, callback: VoiceCommandCallback) => {
    console.log('음성 의도 처리:', intent);
    
    switch (intent) {
      case 'NEXT':
        callback('NEXT');
        break;
      case 'PREV':
        callback('PREV');
        break;
      default:
        // STEPn 패턴 처리
        const stepMatch = intent.match(/^STEP(\d+)$/);
        if (stepMatch) {
          const stepNumber = parseInt(stepMatch[1], 10);
          if (stepNumber >= 1 && stepNumber <= 10) {
            callback(`STEP${stepNumber}` as VoiceCommand, stepNumber);
          }
        }
        break;
    }
  }, []);

  /**
   * Float32Array를 Int16Array로 변환
   */
  const float32ToInt16 = useCallback((float32Array: Float32Array): Int16Array => {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      // -1.0 ~ 1.0 범위를 -32768 ~ 32767로 변환
      const sample = Math.max(-1, Math.min(1, float32Array[i]));
      int16Array[i] = sample * 32767;
    }
    return int16Array;
  }, []);

  /**
   * 샘플레이트 변환 (간단한 다운샘플링)
   */
  const resampleTo16kHz = useCallback((inputData: Float32Array, inputSampleRate: number): Float32Array => {
    if (inputSampleRate === TARGET_SAMPLE_RATE) {
      return inputData;
    }

    const ratio = inputSampleRate / TARGET_SAMPLE_RATE;
    const outputLength = Math.round(inputData.length / ratio);
    const outputData = new Float32Array(outputLength);

    for (let i = 0; i < outputLength; i++) {
      const index = Math.round(i * ratio);
      outputData[i] = inputData[Math.min(index, inputData.length - 1)];
    }

    return outputData;
  }, []);

  /**
   * WebSocket 연결 설정
   */
  const setupWebSocket = useCallback((): boolean => {
    try {
      webSocketRef.current = new WebSocket(STT_SERVER_URL);

      webSocketRef.current.onopen = () => {
        console.log('WebSocket 연결 성공');
        setError(null);
      };

      webSocketRef.current.onmessage = (event) => {
        try {
          const response: ServerResponse = JSON.parse(event.data);
          console.log('STT 서버 응답:', response);
          
          if (response.status === 200 && response.data) {
            const { intent, base_intent } = response.data;
            
            // base_intent를 transcript로 표시 (원본 STT 텍스트)
            setTranscript(base_intent);
            setIsVoiceDetected(true);
            
            // intent에 따른 음성 명령 처리 (최신 콜백 사용)
            if (onVoiceCommandRef.current && intent) {
              handleVoiceIntent(intent, onVoiceCommandRef.current);
            }
            
            // 음성 감지 상태를 3초 후 자동 리셋
            if (voiceTimeoutRef.current) {
              clearTimeout(voiceTimeoutRef.current);
            }
            voiceTimeoutRef.current = setTimeout(() => {
              setIsVoiceDetected(false);
            }, 3000);
          }
        } catch (parseError) {
          console.error('서버 응답 파싱 오류:', parseError);
          // 예전 형식 호환성을 위한 fallback
          console.log('STT 서버 메시지:', event.data);
          setTranscript(event.data);
          setIsVoiceDetected(true);
          
          if (voiceTimeoutRef.current) {
            clearTimeout(voiceTimeoutRef.current);
          }
          voiceTimeoutRef.current = setTimeout(() => {
            setIsVoiceDetected(false);
          }, 3000);
        }
      };

      webSocketRef.current.onerror = (error) => {
        console.error('WebSocket 오류:', error);
        setError('서버 연결에 실패했습니다.');
        setIsListening(false);
      };

      webSocketRef.current.onclose = () => {
        console.log('WebSocket 연결 종료');
        setIsListening(false);
      };

      return true;
    } catch (err) {
      console.error('WebSocket 설정 실패:', err);
      setError('WebSocket 연결에 실패했습니다.');
      return false;
    }
  }, [handleVoiceIntent]);

  /**
   * 오디오 스트림 및 프로세서 설정
   */
  const setupAudioProcessing = useCallback(async (): Promise<boolean> => {
    try {
      // 마이크 스트림 획득
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: AUDIO_CONFIG
      });
      mediaStreamRef.current = stream;

      // AudioContext 생성
      audioContextRef.current = new AudioContext({
        sampleRate: AUDIO_CONFIG.sampleRate
      });

      const source = audioContextRef.current.createMediaStreamSource(stream);
      
      // ScriptProcessorNode 생성 (실시간 오디오 처리)
      processorRef.current = audioContextRef.current.createScriptProcessor(BUFFER_SIZE, 1, 1);

      processorRef.current.onaudioprocess = (event) => {
        if (!webSocketRef.current || webSocketRef.current.readyState !== WebSocket.OPEN) {
          return;
        }

        const inputData = event.inputBuffer.getChannelData(0);
        
        // 16kHz로 리샘플링
        const resampledData = resampleTo16kHz(inputData, audioContextRef.current!.sampleRate);
        
        // Int16로 변환
        const int16Data = float32ToInt16(resampledData);
        
        // 서버로 전송
        webSocketRef.current.send(int16Data.buffer);
      };

      // 연결
      source.connect(processorRef.current);
      processorRef.current.connect(audioContextRef.current.destination);

      return true;
    } catch (err) {
      console.error('오디오 처리 설정 실패:', err);
      setError('마이크 접근에 실패했습니다.');
      return false;
    }
  }, [resampleTo16kHz, float32ToInt16]);

  /**
   * 브라우저 지원 여부 확인
   */
  const checkSupport = useCallback((): void => {
    const hasWebSocket = typeof WebSocket !== 'undefined';
    const hasWebAudio = typeof AudioContext !== 'undefined' || typeof (window as any).webkitAudioContext !== 'undefined';
    const hasGetUserMedia = typeof navigator.mediaDevices?.getUserMedia !== 'undefined';

    if (hasWebSocket && hasWebAudio && hasGetUserMedia) {
      setIsSupported(true);
    } else {
      setIsSupported(false);
      setError('브라우저가 필요한 기능을 지원하지 않습니다.');
    }
  }, []);

  /**
   * 정리 함수
   */
  const cleanup = useCallback((): void => {
    // WebSocket 종료
    if (webSocketRef.current) {
      if (webSocketRef.current.readyState === WebSocket.OPEN) {
        webSocketRef.current.send('EOS'); // 서버에 스트림 종료 신호
      }
      webSocketRef.current.close();
      webSocketRef.current = null;
    }

    // 오디오 프로세서 정리
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    // AudioContext 정리
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // 미디어 스트림 정리
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    // 타이머 정리
    if (voiceTimeoutRef.current) {
      clearTimeout(voiceTimeoutRef.current);
      voiceTimeoutRef.current = null;
    }
  }, []);

  // 컴포넌트 마운트 시 지원 여부 확인
  useEffect(() => {
    checkSupport();
    return cleanup;
  }, [checkSupport, cleanup]);

  /**
   * 음성 인식 시작
   */
  const startListening = useCallback(async (): Promise<void> => {
    if (!isSupported) {
      setError('브라우저가 필요한 기능을 지원하지 않습니다.');
      return;
    }

    setError(null);
    setTranscript('');

    try {
      // WebSocket 연결
      if (!setupWebSocket()) {
        return;
      }

      // WebSocket 연결 대기
      await new Promise<void>((resolve, reject) => {
        const checkConnection = () => {
          if (webSocketRef.current?.readyState === WebSocket.OPEN) {
            resolve();
          } else if (webSocketRef.current?.readyState === WebSocket.CLOSED) {
            reject(new Error('WebSocket 연결 실패'));
          } else {
            setTimeout(checkConnection, 100);
          }
        };
        checkConnection();
      });

      // 오디오 처리 설정
      if (await setupAudioProcessing()) {
        setIsListening(true);
        console.log('실시간 STT 시작');
      }
    } catch (err) {
      console.error('음성 인식 시작 실패:', err);
      setError(`음성 인식 시작에 실패했습니다. ${err}`);
      cleanup();
    }
  }, [isSupported, setupWebSocket, setupAudioProcessing, cleanup]);

  /**
   * 음성 인식 중지
   */
  const stopListening = useCallback((): void => {
    cleanup();
    setIsListening(false);
    setIsVoiceDetected(false);
    console.log('실시간 STT 중지');
  }, [cleanup]);

  /**
   * 음성 감지 상태 리셋
   */
  const resetDetection = useCallback((): void => {
    setIsVoiceDetected(false);
    setTranscript('');
    setError(null);
    
    if (voiceTimeoutRef.current) {
      clearTimeout(voiceTimeoutRef.current);
      voiceTimeoutRef.current = null;
    }
  }, []);

  return {
    isListening,
    isVoiceDetected,
    transcript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetDetection,
  };
}; 