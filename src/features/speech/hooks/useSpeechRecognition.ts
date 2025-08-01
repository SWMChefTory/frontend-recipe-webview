import { UseSpeechRecognitionResult, VoiceCommandCallback } from 'features/speech/types/voice';
import { float32ToInt16, resampleTo16kHz } from 'features/speech/utils/audioProcessor';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useWebSocketClient } from './useWebSocketClient';

const STT_SERVER_URL = 'wss://cheftories.com/api/v1/voice-command/ws';

const AUDIO_CONFIG = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: false,
  sampleRate: 16000,
  channelCount: 1,
} as const;

export const useSpeechRecognition = (
  onVoiceCommand?: VoiceCommandCallback,
  selectedSttModel?: string,
  accessToken?: string | null,
  recipeId?: string,
): UseSpeechRecognitionResult => {
  const [isListening, setIsListening] = useState(false);
  const [isVoiceDetected, setIsVoiceDetected] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  const onVoiceCommandRef = useRef<VoiceCommandCallback | undefined>(onVoiceCommand);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<AudioWorkletNode | null>(null);

  const { connect, disconnect, send, isOpen } = useWebSocketClient();

  useEffect(() => {
    onVoiceCommandRef.current = onVoiceCommand;
  }, [onVoiceCommand]);

  const checkSupport = useCallback(() => {
    const hasWebSocket = typeof WebSocket !== 'undefined';
    const hasWebAudio =
      typeof AudioContext !== 'undefined' ||
      typeof (window as any).webkitAudioContext !== 'undefined';
    const hasGetUserMedia = typeof navigator.mediaDevices?.getUserMedia !== 'undefined';

    if (hasWebSocket && hasWebAudio && hasGetUserMedia) {
      setIsSupported(true);
    } else {
      setIsSupported(false);
      setError('브라우저가 필요한 기능을 지원하지 않습니다.');
    }
  }, []);

  const setupAudioProcessing = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: AUDIO_CONFIG });
      mediaStreamRef.current = stream;

      const audioContext = new AudioContext({ sampleRate: AUDIO_CONFIG.sampleRate });
      audioContextRef.current = audioContext;

      // Worklet 모듈 로드
      await audioContext.audioWorklet.addModule('/voice-processor.worklet.js');

      const source = audioContext.createMediaStreamSource(stream);
      const workletNode = new AudioWorkletNode(audioContext, 'voice-processor');

      // 메시지 수신 처리
      workletNode.port.onmessage = event => {
        if (!isOpen()) return;

        const inputData = event.data as Float32Array;
        const resampled = resampleTo16kHz(inputData, audioContext.sampleRate);
        const int16Data = float32ToInt16(resampled);
        send(int16Data.buffer);
      };

      source.connect(workletNode);
      workletNode.connect(audioContext.destination);

      // ScriptProcessorNode가 아닌 AudioWorkletNode 저장
      processorRef.current = workletNode;

      return true;
    } catch (err) {
      console.error('오디오 처리 실패:', err);
      setError('마이크 접근에 실패했습니다.');
      return false;
    }
  }, [send, isOpen]);

  const cleanup = useCallback(() => {
    disconnect();

    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
  }, [disconnect]);

  useEffect(() => {
    checkSupport();
    return cleanup;
  }, [checkSupport, cleanup]);

  const startListening = useCallback(async () => {
    if (!isSupported) {
      setError('브라우저가 필요한 기능을 지원하지 않습니다.');
      return;
    }

    setError(null);
    setTranscript('');

    const url = new URL(STT_SERVER_URL);
    url.searchParams.append('provider', selectedSttModel || 'VITO');
    if (accessToken) {
      const tokenWithoutBearer = accessToken.startsWith('Bearer ')
        ? accessToken.substring('Bearer '.length)
        : accessToken;
      url.searchParams.append('token', tokenWithoutBearer);
    }
    if (recipeId) {
      url.searchParams.append('recipe_id', recipeId);
    }

    const connected = connect({
      url: url.toString(),
      onIntentReceived: onVoiceCommandRef.current!,
      onTranscript: setTranscript,
      onVoiceDetected: () => setIsVoiceDetected(true),
      onVoiceReset: () => setIsVoiceDetected(false),
      onError: setError,
      onOpen: () => setError(null),
      onClose: () => setIsListening(false),
    });

    if (!connected) {
      return;
    }

    const audioReady = await setupAudioProcessing();
    if (audioReady) {
      setIsListening(true);
    }
  }, [isSupported, connect, setupAudioProcessing, selectedSttModel, accessToken, recipeId]);

  const stopListening = useCallback(() => {
    cleanup();
    setIsListening(false);
    setIsVoiceDetected(false);
  }, [cleanup]);

  const resetDetection = useCallback(() => {
    setIsVoiceDetected(false);
    setTranscript('');
    setError(null);
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
