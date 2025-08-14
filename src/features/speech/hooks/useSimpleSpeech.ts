import { useMicVAD } from '@ricky0123/vad-react';
import { sendRequestAccessTokenRefresh } from 'features/bridge/utils/webview';
import { BasicIntent, parseIntent } from 'features/speech/types/parseIntent';
import { useEffect, useRef, useState } from 'react';

const STT_URL = 'wss://cheftories.com/api/v1/voice-command/ws';
const CHUNK_SIZE = 160; // 10ms @ 16kHz
const BUFFER_CHUNKS = 3; // → 30ms 단위 전송
const SEND_SIZE = CHUNK_SIZE * BUFFER_CHUNKS;

const f32ToI16 = (f: Float32Array) => {
  const i = new Int16Array(f.length);
  for (let n = 0; n < f.length; n++) {
    i[n] = Math.max(-1, Math.min(1, f[n])) * 0x7fff;
  }
  return i;
};

interface Params {
  selectedSttModel?: string;
  accessToken?: string | null;
  recipeId?: string;
  onVoiceStart?: () => void;
  onVoiceEnd?: () => void;
  onIntent?: (i: BasicIntent) => void;
  onVolume?: (vol: number) => void;
}

export const useSimpleSpeech = ({
  selectedSttModel = 'VITO',
  accessToken,
  recipeId,
  onVoiceStart,
  onVoiceEnd,
  onIntent,
  onVolume,
}: Params) => {
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const isWSReady = useRef(false);
  const leftoverRef = useRef<Float32Array | null>(null);
  const sendTimeRef = useRef<number | null>(null);

  const accessTokenRef = useRef(accessToken);
  const recipeIdRef = useRef(recipeId);
  const onIntentRef = useRef(onIntent);
  const selectedSttModelRef = useRef(selectedSttModel);
  const vadRef = useRef<ReturnType<typeof useMicVAD> | null>(null);

  useEffect(() => {
    accessTokenRef.current = accessToken;
  }, [accessToken]);

  useEffect(() => {
    recipeIdRef.current = recipeId;
  }, [recipeId]);

  useEffect(() => {
    onIntentRef.current = onIntent;
  }, [onIntent]);

  useEffect(() => {
    selectedSttModelRef.current = selectedSttModel;
  }, [selectedSttModel]);

  vadRef.current = useMicVAD({
    model: 'v5',
    positiveSpeechThreshold: 0.6,
    negativeSpeechThreshold: 0.5,
    startOnLoad: true,
    additionalAudioConstraints: {
      noiseSuppression: true,
      echoCancellation: true,
      autoGainControl: false,
    } as any,

    onSpeechStart: () => {
      console.log('[VAD] speech start');
      onVoiceStart?.();
    },
    onSpeechEnd: () => {
      console.log('[VAD] speech end');
      onVoiceEnd?.();
    },

    onFrameProcessed: (_, frame) => {
      const ws = wsRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN || !isWSReady.current) return;

      let sumSq = 0;
      for (let i = 0; i < frame.length; i++) sumSq += frame[i] ** 2;
      const rms = Math.sqrt(sumSq / frame.length);
      onVolume?.(rms);

      let samples: Float32Array;
      if (leftoverRef.current) {
        const merged = new Float32Array(leftoverRef.current.length + frame.length);
        merged.set(leftoverRef.current);
        merged.set(frame, leftoverRef.current.length);
        samples = merged;
        leftoverRef.current = null;
      } else {
        samples = frame;
      }

      for (let off = 0; off + SEND_SIZE <= samples.length; off += SEND_SIZE) {
        const slice = samples.subarray(off, off + SEND_SIZE);
        const payload = f32ToI16(slice).buffer;
        sendTimeRef.current = performance.now();
        ws.send(payload);
      }

      const rest = samples.length % SEND_SIZE;
      if (rest) leftoverRef.current = samples.subarray(samples.length - rest);
    },
  });

  useEffect(() => {
    const openWS = () => {
      const url = new URL(STT_URL);
      url.searchParams.append('provider', selectedSttModelRef.current ?? 'VITO');
      const token = accessTokenRef.current;
      if (token) url.searchParams.append('token', token.replace(/^Bearer\s/i, ''));
      if (recipeIdRef.current) url.searchParams.append('recipe_id', recipeIdRef.current);
      const ws = new WebSocket(url.toString());
      ws.binaryType = 'arraybuffer';
      wsRef.current = ws;
      isWSReady.current = false;

      ws.onopen = () => {
        console.log('[WS] connected');
        isWSReady.current = true;
      };

      ws.onmessage = ({ data }) => {
        const j = JSON.parse(data as string);
        if (j.status === 200 && j.data?.intent) {
          onIntentRef.current?.(parseIntent(j.data.intent));
        }
      };

      ws.onerror = e => {
        console.error('[WS] error', e);
        setError('WebSocket 오류');
      };

      ws.onclose = e => {
        console.log('[WS] closed');
        console.error(e);

        if (e.code === 1008) {
          sendRequestAccessTokenRefresh();
        }
        setTimeout(openWS, 500);
      };
    };

    openWS();
    return () => {
      wsRef.current?.close();
      vadRef.current?.pause();
    };
  }, []);

  return {
    error,
    isListening: vadRef.current?.listening ?? false,
    stop: vadRef.current?.pause ?? (() => {}),
  };
};
