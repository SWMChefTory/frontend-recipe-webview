import { useCallback, useRef } from 'react';
import { VoiceCommandCallback } from '../types/voice';
import { parseVoiceCommand } from '../utils/parseVoiceCommand';

export interface WebSocketOptions {
  url: string;
  onIntentReceived: VoiceCommandCallback;
  onTranscript: (text: string) => void;
  onVoiceDetected: () => void;
  onVoiceReset: () => void;
  onError: (message: string) => void;
  onOpen: () => void;
  onClose: () => void;
}

export const useWebSocketClient = () => {
  const webSocketRef = useRef<WebSocket | null>(null);
  const voiceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connect = useCallback((options: WebSocketOptions): boolean => {
    try {
      const {
        url,
        onIntentReceived,
        onTranscript,
        onVoiceDetected,
        onVoiceReset,
        onError,
        onOpen,
        onClose,
      } = options;

      const socket = new WebSocket(url);
      webSocketRef.current = socket;

      socket.onopen = () => {
        console.log('WebSocket 연결 성공');
        onOpen();
      };

      socket.onmessage = event => {
        try {
          const data = JSON.parse(event.data);
          console.log('STT 서버 응답:', data);

          if (data.status === 200 && data.data) {
            const { intent, base_intent } = data.data;
            onTranscript(base_intent);
            onVoiceDetected();
            parseVoiceCommand(intent, onIntentReceived);
          } else {
            onTranscript(event.data);
          }
        } catch {
          console.log('STT 서버 메시지 (fallback):', event.data);
          onTranscript(event.data);
          onVoiceDetected();
        }

        if (voiceTimeoutRef.current) {
          clearTimeout(voiceTimeoutRef.current);
        }
        voiceTimeoutRef.current = setTimeout(() => {
          onVoiceReset();
        }, 3000);
      };

      socket.onerror = e => {
        console.error('WebSocket 오류:', e);
        onError('서버 연결에 실패했습니다.');
        onClose();
      };

      socket.onclose = () => {
        console.log('WebSocket 연결 종료');
        onClose();
      };

      return true;
    } catch (err) {
      console.error('WebSocket 설정 실패:', err);
      options.onError('WebSocket 연결에 실패했습니다.');
      return false;
    }
  }, []);

  const disconnect = useCallback(() => {
    const socket = webSocketRef.current;
    if (socket) {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send('EOS');
      }
      socket.close();
      webSocketRef.current = null;
    }

    if (voiceTimeoutRef.current) {
      clearTimeout(voiceTimeoutRef.current);
      voiceTimeoutRef.current = null;
    }
  }, []);

  const send = useCallback((data: ArrayBuffer) => {
    const socket = webSocketRef.current;
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(data);
    }
  }, []);

  const isOpen = useCallback(() => {
    return webSocketRef.current?.readyState === WebSocket.OPEN;
  }, []);

  return {
    connect,
    disconnect,
    send,
    isOpen,
    socketRef: webSocketRef,
  };
};
