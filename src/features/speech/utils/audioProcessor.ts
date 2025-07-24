/**
 * Float32Array → Int16Array 변환
 * -1.0 ~ 1.0 범위의 실수 값을 -32768 ~ 32767 정수 값으로 매핑
 */
export const float32ToInt16 = (float32Array: Float32Array): Int16Array => {
  return Int16Array.from(float32Array.map(sample => {
    const clamped = Math.max(-1, Math.min(1, sample));
    return clamped * 32767;
  }));
};

/**
 * 44.1kHz 등 고주파수를 16kHz로 다운샘플링
 * (간단한 nearest neighbor 기반)
 */
export const resampleTo16kHz = (input: Float32Array, inputSampleRate: number): Float32Array => {
  const TARGET_SAMPLE_RATE = 16000;

  if (inputSampleRate === TARGET_SAMPLE_RATE) {
    return input;
  }

  const ratio = inputSampleRate / TARGET_SAMPLE_RATE;
  const outputLength = Math.round(input.length / ratio);
  const output = new Float32Array(outputLength);

  for (let i = 0; i < outputLength; i++) {
    const index = Math.min(Math.round(i * ratio), input.length - 1);
    output[i] = input[index];
  }

  return output;
};