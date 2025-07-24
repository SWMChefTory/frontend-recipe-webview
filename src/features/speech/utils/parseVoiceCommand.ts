import { VoiceCommand, VoiceCommandCallback } from '../types/voice';

export const parseVoiceCommand = (
  intent: string,
  callback: VoiceCommandCallback
): void => {
  if (intent === 'NEXT' || intent === 'PREV') {
    callback(intent);
    return;
  }

  const stepMatch = intent.match(/^STEP(\d+)$/);
  if (stepMatch) {
    const step = parseInt(stepMatch[1], 10);
    if (step >= 1 && step <= 10) {
      callback(`STEP${step}` as VoiceCommand, step);
      return;
    }
  }

  const timestampMatch = intent.match(/^TIMESTAMP\s*(\d+)$/);
  if (timestampMatch) {
    const seconds = parseInt(timestampMatch[1], 10);
    callback('TIMESTAMP', seconds);
    return;
  }
};