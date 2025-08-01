import { VoiceCommandCallback } from 'features/speech/types/voice';
import { parseVoiceCommand } from 'features/speech/utils/parseVoiceCommand';
import { useCallback, useRef } from 'react';

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

/**
 * WebSocket 클라이언트 훅
 * @returns WebSocket 클라이언트 객체
 */
const SILENCE_MS = 3000;

export const useWebSocketClient = () => {
  const webSocketRef = useRef<WebSocket | null>(null);
  const voiceTimeoutRef = useRef<number | null>(null);

  const clearVoiceTimeout = () => {
    if (voiceTimeoutRef.current !== null) {
      clearTimeout(voiceTimeoutRef.current);
      voiceTimeoutRef.current = null;
    }
  };

  const disconnect = useCallback(() => {
    const socket = webSocketRef.current;
    if (socket) {
      if (socket.readyState === WebSocket.OPEN) socket.send('EOS');
      socket.close();
      webSocketRef.current = null;
    }
    clearVoiceTimeout();
  }, []);

  const connect = useCallback(
    (options: WebSocketOptions): boolean => {
      // 1) 중복 연결 방지
      if (webSocketRef.current) {
        disconnect();
      }

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

        socket.onmessage = async event => {
          try {
            const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data; // Blob/ArrayBuffer 대비

            if (data?.status === 200 && data.data) {
              const { intent, base_intent } = data.data;
              onTranscript(base_intent);
              onVoiceDetected();
              try {
                parseVoiceCommand(intent, onIntentReceived);
              } catch (e) {
                console.error('명령 파싱 실패', e);
                onError('명령 파싱에 실패했습니다.');
              }
            } else {
              onTranscript(event.data);
            }
          } catch {
            console.log('STT 서버 메시지(fallback):', event.data);
            onTranscript(event.data);
            onVoiceDetected();
          }

          clearVoiceTimeout();
          voiceTimeoutRef.current = window.setTimeout(onVoiceReset, SILENCE_MS);
        };

        socket.onerror = e => {
          console.error('WebSocket 오류:', e);
          onError(`서버 오류: ${JSON.stringify(e)}`);
          // 중복 방지: onClose는 onclose에서만 호출
        };

        socket.onclose = () => {
          console.log('WebSocket 연결 종료');
          clearVoiceTimeout();
          onClose();
        };

        return true;
      } catch (err) {
        console.error('WebSocket 설정 실패:', err);
        options.onError('WebSocket 초기화에 실패했습니다.');
        return false;
      }
    },
    [disconnect],
  );

  const send = useCallback((data: ArrayBuffer) => {
    const socket = webSocketRef.current;
    if (socket?.readyState === WebSocket.OPEN) socket.send(data);
  }, []);

  const isOpen = useCallback(() => webSocketRef.current?.readyState === WebSocket.OPEN, []);

  return { connect, disconnect, send, isOpen, socketRef: webSocketRef };
};
