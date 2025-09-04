export type VoiceCommand =
  | 'NEXT'
  | 'PREV'
  | 'STEP1'
  | 'STEP2'
  | 'STEP3'
  | 'STEP4'
  | 'STEP5'
  | 'STEP6'
  | 'STEP7'
  | 'STEP8'
  | 'STEP9'
  | 'STEP10'
  | 'TIMESTAMP';

export type VoiceCommandCallback = (command: VoiceCommand, stepNumber?: number) => void;
