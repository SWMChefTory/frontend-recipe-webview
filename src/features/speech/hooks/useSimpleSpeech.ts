import { BasicIntent, parseIntent } from 'features/speech/types/parseIntent';
import { useEffect, useRef, useState } from 'react';
const STT_URL = 'wss://cheftories.com/api/v1/voice-command/ws';

/* WAV 인코더 (for save) */
const wav = (pcm: Int16Array, sr: number) => {
  const b = new ArrayBuffer(44 + pcm.length * 2),
    v = new DataView(b);
  const W = (o: number, s: string) => {
    for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i));
  };
  W(0, 'RIFF');
  v.setUint32(4, 36 + pcm.length * 2, true);
  W(8, 'WAVEfmt ');
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);
  v.setUint16(22, 1, true);
  v.setUint32(24, sr, true);
  v.setUint32(28, sr * 2, true);
  v.setUint16(32, 2, true);
  v.setUint16(34, 16, true);
  W(36, 'data');
  v.setUint32(40, pcm.length * 2, true);
  new Int16Array(b, 44).set(pcm);
  return new Blob([b], { type: 'audio/wav' });
};

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
  const [transcript, setTranscript] = useState('');
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ctx = useRef<AudioContext | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const buf = useRef<Int16Array[]>([]);
  const idle = useRef<ReturnType<typeof setTimeout> | null>(null);

  const start = async () => {
    try {
      const ms = await navigator.mediaDevices.getUserMedia({
        audio: { noiseSuppression: true, echoCancellation: true, autoGainControl: false },
      });
      ctx.current = new AudioContext({ sampleRate: 16000 });
      await ctx.current.audioWorklet.addModule('/voice-processor.worklet.js');
      const node = new AudioWorkletNode(ctx.current, 'voice-processor', {
        processorOptions: { frameSize: 3200 },
      });
      ctx.current.createMediaStreamSource(ms).connect(node);

      /* WS */
      const u = new URL(STT_URL);
      u.searchParams.append('provider', selectedSttModel);
      if (accessToken) u.searchParams.append('token', accessToken.replace(/^Bearer\s/i, ''));
      if (recipeId) u.searchParams.append('recipe_id', recipeId);
      ws.current = new WebSocket(u.toString());

      node.port.onmessage = ({ data }) => {
        if (data.type === 'vad') {
          if (data.voice) {
            onVoiceStart?.();
            if (idle.current) clearTimeout(idle.current);
          } else {
            idle.current = setTimeout(() => onVoiceEnd?.(), 400); // 0.4 s 무음 후 Un-Mute
          }
          return;
        }

        if (data.type === 'pcm' && ws.current?.readyState === 1) {
          const pcm16 = Int16Array.from(
            data.data as Float32Array,
            s => Math.max(-1, Math.min(1, s)) * 0x7fff,
          );
          buf.current.push(pcm16);
          ws.current.send(pcm16.buffer);
        }
      };

      ws.current.onmessage = ({ data }) => {
        try {
          const j = JSON.parse(data as string);

          if (j.status === 200 && j.data?.intent) {
            onIntent?.(parseIntent(j.data.intent));
          }

          setTranscript(
            j.status === 200 && j.data?.base_intent ? j.data.base_intent : (data as string),
          );
          console.log(j.data);
        } catch {
          setTranscript(data as string);
        }
      };
      ws.current.onopen = () => setListening(true);
      ws.current.onerror = () => setError('WebSocket 오류');
      ws.current.onclose = () => setListening(false);
    } catch (e) {
      console.error(e);
      setError('초기화 실패');
    }
  };

  const stop = () => {
    ws.current?.close();
    ctx.current?.close();
    if (idle.current) clearTimeout(idle.current);
    setListening(false);
    if (buf.current.length) {
      const L = buf.current.reduce((n, a) => n + a.length, 0),
        m = new Int16Array(L);
      let o = 0;
      for (const a of buf.current) {
        m.set(a, o);
        o += a.length;
      }
      const url = URL.createObjectURL(wav(m, 16000));
      Object.assign(document.createElement('a'), {
        href: url,
        download: `rec_${Date.now()}.wav`,
      }).click();
      URL.revokeObjectURL(url);
      buf.current = [];
    }
  };

  useEffect(() => {
    start();
    return stop;
  }, []);
  return { transcript, isListening: listening, error };
};
