import { BasicIntent, parseIntent } from 'features/speech/types/parseIntent';
import { useEffect, useRef, useState } from 'react';

const STT_URL = 'wss://cheftories.com/api/v1/voice-command/ws';

interface Params {
  selectedSttModel?: string;
  accessToken?: string | null;
  recipeId?: string;
  onVoiceStart?: () => void;
  onVoiceEnd?: () => void;
  onIntent?: (intent: BasicIntent) => void;
}

export const useSimpleSpeech = ({
  selectedSttModel = 'VITO',
  accessToken,
  recipeId,
  onVoiceStart,
  onVoiceEnd,
  onIntent,
}: Params) => {
  /* ───────── UI 상태 ───────── */
  const [transcript, setTranscript] = useState('');
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ───────── 내부 참조 ───────── */
  const ctxRef = useRef<AudioContext | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const idleRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ───────── 1) 시작 ───────── */
  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { noiseSuppression: true, echoCancellation: true, autoGainControl: false },
      });

      /* AudioContext + Worklet */
      ctxRef.current = new AudioContext({ sampleRate: 16000 });
      await ctxRef.current.audioWorklet.addModule('/voice-processor.worklet.js');
      const node = new AudioWorkletNode(ctxRef.current, 'voice-processor', {
        processorOptions: { frameSize: 3200 },
      });
      ctxRef.current.createMediaStreamSource(stream).connect(node);

      /* WebSocket 연결 */
      const url = new URL(STT_URL);
      url.searchParams.append('provider', selectedSttModel);
      if (accessToken) url.searchParams.append('token', accessToken.replace(/^Bearer\s/i, ''));
      if (recipeId) url.searchParams.append('recipe_id', recipeId);
      wsRef.current = new WebSocket(url.toString());

      /* Worklet → WS 전송 + VAD */
      node.port.onmessage = ({ data }) => {
        if (data.type === 'vad') {
          if (data.voice) {
            onVoiceStart?.();
            if (idleRef.current) clearTimeout(idleRef.current);
          } else {
            idleRef.current = setTimeout(() => onVoiceEnd?.(), 400); // 0.4 s 무음 후 Un-Mute
          }
          return;
        }

        if (data.type === 'pcm' && wsRef.current?.readyState === WebSocket.OPEN) {
          const pcm16 = Int16Array.from(
            data.data as Float32Array,
            s => Math.max(-1, Math.min(1, s)) * 0x7fff,
          );
          wsRef.current.send(pcm16.buffer); // 전송만, 저장 X
        }
      };

      /* STT 응답 */
      wsRef.current.onmessage = ({ data }) => {
        try {
          const j = JSON.parse(data as string);

          if (j.status === 200 && j.data?.intent) {
            onIntent?.(parseIntent(j.data.intent));
          }

          setTranscript(
            j.status === 200 && j.data?.base_intent ? j.data.base_intent : (data as string),
          );
        } catch {
          setTranscript(data as string);
        }
      };

      wsRef.current.onopen = () => setListening(true);
      wsRef.current.onerror = () => setError('WebSocket 오류');
      wsRef.current.onclose = () => setListening(false);
    } catch (e) {
      console.error(e);
      setError('초기화 실패');
    }
  };

  /* ───────── 2) 정리 ───────── */
  const stop = () => {
    wsRef.current?.close();
    ctxRef.current?.close();
    if (idleRef.current) clearTimeout(idleRef.current);
    setListening(false);
  };

  /* ───────── 3) 마운트 / 언마운트 ───────── */
  useEffect(() => {
    start();
    return stop;
  }, []);

  return { transcript, isListening: listening, error, stop };
};
