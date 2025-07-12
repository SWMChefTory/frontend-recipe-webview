import React from 'react';
import { SpeechRecognitionProps } from '../../../core/types';
import './SpeechRecognition.css';

/**
 * 실시간 음성 인식 상태를 표시하는 컴포넌트
 * @param props - 음성 인식 컴포넌트 props
 * @returns JSX 엘리먼트 또는 null
 */
const SpeechRecognition: React.FC<SpeechRecognitionProps> = ({ 
  isListening, 
  isVoiceDetected, 
  transcript,
  error, 
  isSupported 
}) => {
  if (!isSupported) {
    return null;
  }

  return (
    <div className="speech-recognition-section">
      <div className="speech-status">
        {isListening ? (
          <div className="listening-indicator">
            <span className={`listening-dot ${isVoiceDetected ? 'voice-detected' : ''}`}></span>
            실시간 음성 인식 중
          </div>
        ) : (
          <div className="not-listening">
            음성 인식 시작 중...
          </div>
        )}
      </div>
      
      {transcript && (
        <div className="speech-transcript">
          <div className="speech-text">
            <div className="speech-label">인식된 음성:</div>
            <div className="speech-content">{transcript}</div>
          </div>
        </div>
      )}
      
      {error && (
        <div className="speech-transcript">
          <div className="speech-error">
            <div className="speech-label">오류:</div>
            <div className="speech-content">{error}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpeechRecognition; 