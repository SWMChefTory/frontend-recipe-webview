/**
 * VoiceProcessor v4  (16 kHz mono)
 *  • 120 Hz 하이패스
 *  • 4 kHz 1-pole 로우패스      → 음악·효과음 고역 감쇠
 *  • 소프트 AGC  (목표 RMS 0.25, attack 0.35, release 0.01)
 *  • Adaptive VAD
 *      – 캘리브레이션 0.4 s → noiseFloor
 *      – **voice 조건**
 *          rms > max(noiseFloor×2, 0.003)
 *          & flatness < 0.5
 *          & ZCR 0.02 ~ 0.25
 *      – 무음 4프레임(≈80 ms) 연속 → voice=false
 *  • 10 ms(160샘플)마다 {type:'pcm'|'vad'} 메세지 전송
 */
class VoiceProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    /* ---------- 상수 ---------- */
    this.N = 160; // 10 ms
    /* 120 Hz 하이패스 계수 */
    const rcHP = 1 / (2 * Math.PI * 120);
    this.aHP = rcHP / (rcHP + 1 / sampleRate);
    /* 4 kHz 로우패스 계수 */
    const rcLP = 1 / (2 * Math.PI * 4000);
    this.aLP = 1 / (rcLP * sampleRate + 1);

    /* 상태값 */
    this.xHP = this.yHP = 0;
    this.yLP = 0;

    /* AGC */
    this.tRms = 0.25;
    this.gMax = 12;
    this.g = 1;
    this.att = 0.35;
    this.rel = 0.01;

    /* Adaptive VAD */
    this.calib = sampleRate * 0.4; // 0.4 s
    this.nsAcc = 0;
    this.nsCnt = 0;
    this.noiseFloor = 0.002;
    this.voice = false;
    this.silCnt = 0;

    this.buf = new Float32Array(this.N);
    this.off = 0;
  }

  /* 간단한 64-pt DFT magnitude (naïve) → spectral flatness */
  flatness(frame) {
    const M = 64,
      TWO_PI = 2 * Math.PI;
    const len = frame.length;
    const mag = new Float32Array(M);
    for (let k = 0; k < M; k++) {
      let re = 0,
        im = 0;
      const w = (-TWO_PI * k) / len;
      for (let n = 0; n < len; n++) {
        const ph = n * w;
        re += frame[n] * Math.cos(ph);
        im += frame[n] * Math.sin(ph);
      }
      mag[k] = Math.hypot(re, im) / len;
    }
    /* 기하평균 / 산술평균 */
    let geo = 1e-12,
      sum = 0;
    for (let k = 1; k < M; k++) {
      // DC 제외
      geo *= mag[k] + 1e-12;
      sum += mag[k];
    }
    geo = Math.pow(geo, 1 / (M - 1));
    const arith = sum / (M - 1);
    return geo / arith; // 0 ~ 1
  }

  process(inputs) {
    const inp = inputs[0]?.[0];
    if (!inp) return true;

    let p = 0;
    while (p < inp.length) {
      const n = Math.min(this.N - this.off, inp.length - p);
      this.buf.set(inp.subarray(p, p + n), this.off);
      this.off += n;
      p += n;

      if (this.off === this.N) {
        const y = this.buf.slice();

        /* ---------- 1) 120 Hz HPF + 4 kHz LPF ---------- */
        const aHP = this.aHP,
          aLP = this.aLP;
        let xHP = this.xHP,
          yHP = this.yHP,
          yLP = this.yLP;
        for (let i = 0; i < y.length; i++) {
          /* HPF */
          const xi = y[i];
          const hpf = aHP * (yHP + xi - xHP);
          xHP = xi;
          yHP = hpf;
          /* LPF */
          yLP += aLP * (hpf - yLP);
          y[i] = yLP;
        }
        this.xHP = xHP;
        this.yHP = yHP;
        this.yLP = yLP;

        /* ---------- 2) RMS + AGC ---------- */
        let s2 = 0;
        for (const s of y) s2 += s * s;
        const rms = Math.sqrt(s2 / y.length) || 1e-6;
        const need = Math.min(this.gMax, Math.max(0.1, this.tRms / rms));
        const k = need > this.g ? this.att : this.rel;
        this.g += k * (need - this.g);
        const g = this.g;
        for (let i = 0; i < y.length; i++) y[i] = Math.max(-0.99, Math.min(0.99, y[i] * g));

        /* ---------- 3) Adaptive noiseFloor ---------- */
        if (this.calib > 0) {
          this.nsAcc += rms;
          this.nsCnt++;
          this.calib -= this.N;
          if (this.calib <= 0 && this.nsCnt) this.noiseFloor = this.nsAcc / this.nsCnt;
        }

        /* ---------- 4) VAD 판정 ---------- */
        /* ZCR */
        let zc = 0;
        for (let i = 1; i < y.length; i++) if (y[i] >= 0 !== y[i - 1] >= 0) zc++;
        const zcr = zc / y.length;

        /* Spectral flatness */
        const flat = this.flatness(y);

        const thresh = Math.max(this.noiseFloor * 2, 0.003);
        const isVoice = rms > thresh && flat < 0.5 && zcr > 0.02 && zcr < 0.25;

        if (isVoice) this.silCnt = 0;
        else this.silCnt++;

        const voiceNow = isVoice || this.silCnt <= 4; // 80 ms hysteresis

        if (voiceNow !== this.voice) {
          this.voice = voiceNow;
          this.port.postMessage({ type: 'vad', voice: voiceNow });
        }

        /* ---------- 5) PCM 전송 ---------- */
        this.port.postMessage({ type: 'pcm', data: y });
        this.off = 0;
      }
    }
    return true;
  }
}

registerProcessor('voice-processor', VoiceProcessor);
