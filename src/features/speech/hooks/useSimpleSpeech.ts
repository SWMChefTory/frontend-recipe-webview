import { useEffect, useRef, useState } from 'react';

// TEN VAD exports (너가 올린 index 기준)
import type { TenVADInstance } from 'ten-vad-lib';
import { VADInstance, VADModuleLoader } from 'ten-vad-lib';

const STT_URL = 'wss://api.cheftories.com/api/v1/voice-command/ws';
const SAMPLE_RATE = 16000;
const CHUNK_SIZE = 160; // 10ms @ 16kHz
const BUFFER_CHUNKS = 3; // 30ms 묶음
const SEND_SIZE = CHUNK_SIZE * BUFFER_CHUNKS;

// VAD 게이팅 히스테리시스
const POS_TH = 0.6; // 켜짐 임계
const NEG_TH = 0.5; // 꺼짐 임계
const ON_HOLD_MS = 150; // 켜짐 유지(바운스 방지)
const OFF_HOLD_MS = 250; // 꺼짐 지연(턴 종료 안정)

// Pre-buffer 설정 (음성 앞부분 보호)
const PRE_BUFFER_MS = 200; // 200ms 프리버퍼
const PRE_BUFFER_CHUNKS = Math.ceil((PRE_BUFFER_MS * SAMPLE_RATE) / 1000 / CHUNK_SIZE); // ~12.5 청크

const f32ToI16 = (f: Float32Array) => {
  const i = new Int16Array(f.length);
  for (let n = 0; n < f.length; n++) {
    const v = Math.max(-1, Math.min(1, f[n]));
    i[n] = (v * 0x7fff) | 0;
  }
  return i;
};

// 서버 프로토콜에 맞게 is_final 플래그와 함께 오디오 전송
const sendAudioData = (ws: WebSocket, audioData: ArrayBuffer, isFinal: boolean = false) => {
  const finalFlag = new Uint8Array([isFinal ? 1 : 0]);
  const audioBytes = new Uint8Array(audioData);
  const combined = new Uint8Array(finalFlag.length + audioBytes.length);
  combined.set(finalFlag, 0);
  combined.set(audioBytes, finalFlag.length);
  ws.send(combined.buffer);
};

interface Params {
  selectedSttModel?: string;
  accessToken?: string | null;
  recipeId?: string;
  onVoiceStart?: () => void;
  onVoiceEnd?: () => void;
  onIntent?: (i: any) => void; // BasicIntent 쓰면 타입 교체
  onVolume?: (vol: number) => void;
}

export const useSimpleSpeech = ({
  selectedSttModel = 'CLOVA',
  accessToken,
  recipeId,
  onVoiceStart,
  onVoiceEnd,
  onIntent,
  onVolume,
}: Params) => {
  const [error, setError] = useState<string | null>(null);

  // WS
  const wsRef = useRef<WebSocket | null>(null);
  const isWSReady = useRef(false);
  const reconnectTimeoutRef = useRef<number | null>(null);

  // 오디오
  const audioCtxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<AudioWorkletNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // TEN VAD
  const vadInstanceRef = useRef<TenVADInstance | null>(null);

  // 상태
  const isMountedRef = useRef(true);
  const txLeftoverRef = useRef<Float32Array | null>(null);
  const preBufferRef = useRef<Float32Array[]>([]); // Pre-buffer for speech start protection

  // VAD 게이팅 상태
  const speechActiveRef = useRef(false);
  const lastOnRef = useRef(0);
  const lastOffRef = useRef(0);

  // 최신 값 refs
  const accessTokenRef = useRef(accessToken);
  const recipeIdRef = useRef(recipeId);
  const onIntentRef = useRef(onIntent);
  const selectedSttModelRef = useRef(selectedSttModel);

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

  // ------------------------
  // WebSocket
  // ------------------------
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
        isWSReady.current = true;
      };
      ws.onmessage = ({ data }) => {
        try {
          const j = JSON.parse(data as string);
          console.log('[WS] message', j);
          if (j.status === 200 && j.data?.intent) {
            onIntentRef.current?.(j.data.intent); // 필요 시 parseIntent
          }
        } catch {}
      };
      ws.onerror = e => {
        console.error('[WS] error', e);
        setError('WebSocket 오류');
      };
      ws.onclose = () => {
        if (isMountedRef.current) {
          reconnectTimeoutRef.current = window.setTimeout(openWS, 500) as unknown as number;
        }
      };
    };

    openWS();
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close(1000, 'page unmounted');
      }
    };
  }, []);

  // ------------------------
  // Audio + TEN VAD
  // ------------------------
  useEffect(() => {
    let destroyed = false;

    const start = async () => {
      try {
        console.log('[VAD] 모듈 로드 시작...');
        const module = await VADModuleLoader.getInstance().loadModule();
        console.log('[VAD] 모듈 로드 완료:', module);

        const hopSize = CHUNK_SIZE; // 10ms @ 16kHz
        const voiceThreshold = POS_TH;
        console.log(
          '[VAD] VAD 인스턴스 생성 중... hopSize:',
          hopSize,
          'threshold:',
          voiceThreshold,
        );
        const vad = new VADInstance(module, hopSize, voiceThreshold);
        vadInstanceRef.current = vad;
        console.log('[VAD] VAD 인스턴스 생성 완료:', vad);

        // 3) 마이크 오픈
        console.log('[VAD] 마이크 권한 요청 중...');
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            channelCount: 1,
            sampleRate: SAMPLE_RATE,
            echoCancellation: true,
            noiseSuppression: true, // 장치별 A/B 권장
            autoGainControl: false,
          } as any,
          video: false,
        });
        if (destroyed) return;
        streamRef.current = stream;
        console.log('[VAD] 마이크 스트림 획득 완료:', stream);

        const ctx = new AudioContext({ sampleRate: SAMPLE_RATE });
        audioCtxRef.current = ctx;
        console.log('[VAD] 오디오 컨텍스트 생성 완료. 샘플레이트:', ctx.sampleRate);

        const src = ctx.createMediaStreamSource(stream);

        // AudioWorklet 프로세서 로드 및 생성
        await ctx.audioWorklet.addModule('/vad-processor.js');
        const vadWorklet = new AudioWorkletNode(ctx, 'vad-processor');
        processorRef.current = vadWorklet as any;
        console.log('[VAD] AudioWorklet 프로세서 생성 완료');

        let processCount = 0;

        // AudioWorklet에서 오는 메시지 처리
        vadWorklet.port.onmessage = async event => {
          const { type, chunks, rms } = event.data;

          if (type === 'audioData') {
            processCount++;
            if (processCount % 100 === 0) {
              console.log('[VAD] 오디오 프로세싱 중... count:', processCount);
            }

            const inst = vadInstanceRef.current;
            if (!inst) return;

            // 볼륨 콜백
            onVolume?.(rms);

            const ws = wsRef.current;

            // 각 청크 처리
            for (const chunkArray of chunks) {
              const chunkF32 = new Float32Array(chunkArray);
              const i16 = f32ToI16(chunkF32);

              // 4) TEN VAD 실시간 프레임 처리
              const { probability } = await inst.processFrame(i16);

              if (processCount % 50 === 0) {
                console.log(
                  '[VAD] 확률:',
                  probability.toFixed(3),
                  '활성:',
                  speechActiveRef.current,
                );
              }

              // Pre-buffer 관리 (항상 최근 청크들을 보관)
              preBufferRef.current.push(chunkF32.slice()); // 복사본 저장
              if (preBufferRef.current.length > PRE_BUFFER_CHUNKS) {
                preBufferRef.current.shift(); // 오래된 청크 제거
              }

              // 5) 히스테리시스 게이팅
              const now = performance.now();
              let active = speechActiveRef.current;
              if (!active) {
                if (probability >= POS_TH) {
                  active = true;
                  speechActiveRef.current = true;
                  lastOnRef.current = now;
                  console.log(
                    '[VAD] 🎤 음성 시작 감지! 확률:',
                    probability.toFixed(3),
                    'pre-buffer 청크:',
                    preBufferRef.current.length,
                  );

                  // Pre-buffer부터 전송 시작
                  if (ws && ws.readyState === WebSocket.OPEN && isWSReady.current) {
                    console.log('[VAD] Pre-buffer 전송 시작');
                    for (const bufferedChunk of preBufferRef.current) {
                      // Pre-buffer 청크들을 30ms 단위로 전송
                      let tx: Float32Array;
                      if (txLeftoverRef.current) {
                        const mergedTx = new Float32Array(
                          txLeftoverRef.current.length + bufferedChunk.length,
                        );
                        mergedTx.set(txLeftoverRef.current);
                        mergedTx.set(bufferedChunk, txLeftoverRef.current.length);
                        tx = mergedTx;
                        txLeftoverRef.current = null;
                      } else {
                        tx = bufferedChunk;
                      }

                      for (let off = 0; off + SEND_SIZE <= tx.length; off += SEND_SIZE) {
                        const slice = tx.subarray(off, off + SEND_SIZE);
                        const payload = f32ToI16(slice).buffer;
                        sendAudioData(ws, payload, false); // Pre-buffer는 is_final=false
                      }
                      const txRest = tx.length % SEND_SIZE;
                      if (txRest) txLeftoverRef.current = tx.subarray(tx.length - txRest);
                    }
                    preBufferRef.current = []; // Pre-buffer 비우기
                  }

                  onVoiceStart?.();
                }
              } else {
                if (probability < NEG_TH && now - lastOnRef.current > ON_HOLD_MS) {
                  if (lastOffRef.current === 0) lastOffRef.current = now;
                  if (now - lastOffRef.current > OFF_HOLD_MS) {
                    active = false;
                    speechActiveRef.current = false;
                    lastOffRef.current = 0;
                    console.log('[VAD] 🔇 음성 종료 감지! 확률:', probability.toFixed(3));

                    // 음성 종료 신호 전송 (is_final=true)
                    if (ws && ws.readyState === WebSocket.OPEN && isWSReady.current) {
                      // 남은 데이터가 있다면 먼저 전송
                      if (txLeftoverRef.current && txLeftoverRef.current.length > 0) {
                        const finalPayload = f32ToI16(txLeftoverRef.current).buffer;
                        sendAudioData(ws, finalPayload, true);
                        txLeftoverRef.current = null;
                      } else {
                        // 빈 데이터로라도 is_final 신호 전송
                        sendAudioData(ws, new ArrayBuffer(0), true);
                      }
                      console.log('[VAD] 음성 종료 신호 전송 (is_final=true)');
                    }

                    preBufferRef.current = []; // Pre-buffer 초기화
                    onVoiceEnd?.();
                  }
                } else {
                  lastOffRef.current = 0;
                }
              }

              // 6) 발화 중일 때 현재 청크 전송 (pre-buffer는 이미 전송됨)
              if (!ws || ws.readyState !== WebSocket.OPEN || !isWSReady.current) continue;

              if (active) {
                // 음성 활성 상태에서는 현재 청크를 바로 전송 (pre-buffer 제외)
                let tx: Float32Array;
                if (txLeftoverRef.current) {
                  const mergedTx = new Float32Array(txLeftoverRef.current.length + chunkF32.length);
                  mergedTx.set(txLeftoverRef.current);
                  mergedTx.set(chunkF32, txLeftoverRef.current.length);
                  tx = mergedTx;
                  txLeftoverRef.current = null;
                } else {
                  tx = chunkF32;
                }

                for (let off = 0; off + SEND_SIZE <= tx.length; off += SEND_SIZE) {
                  const slice = tx.subarray(off, off + SEND_SIZE);
                  const payload = f32ToI16(slice).buffer;
                  sendAudioData(ws, payload, false); // 실시간 데이터는 is_final=false
                }
                const txRest = tx.length % SEND_SIZE;
                if (txRest) txLeftoverRef.current = tx.subarray(tx.length - txRest);

                // 활성 상태에서는 pre-buffer에 저장하지 않음 (실시간 전송)
                preBufferRef.current = [];
              } else {
                txLeftoverRef.current = null; // 무음은 전송 버퍼 초기화
              }
            }
          }
        };

        src.connect(vadWorklet).connect(ctx.destination);
        console.log('[VAD] 오디오 파이프라인 연결 완료');
      } catch (e: any) {
        console.error('[VAD] 초기화 실패:', e);
        setError(e?.message ?? '오디오 초기화 실패');
      }
    };

    start();

    return () => {
      destroyed = true;

      if (processorRef.current) {
        try {
          processorRef.current.disconnect();
          processorRef.current.port.onmessage = null;
        } catch {}
        processorRef.current = null;
      }
      if (audioCtxRef.current) {
        try {
          audioCtxRef.current.close();
        } catch {}
        audioCtxRef.current = null;
      }
      if (streamRef.current) {
        for (const t of streamRef.current.getTracks()) t.stop();
        streamRef.current = null;
      }
      if (vadInstanceRef.current) {
        try {
          vadInstanceRef.current.destroy();
        } catch {}
        vadInstanceRef.current = null;
      }
      // Pre-buffer 초기화
      preBufferRef.current = [];
      txLeftoverRef.current = null;
    };
  }, []);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    error,
    isListening: speechActiveRef.current,
    stop: () => {
      if (audioCtxRef.current) audioCtxRef.current.suspend();
    },
  };
};
