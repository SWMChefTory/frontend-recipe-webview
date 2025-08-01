import { SpeechRecognitionProps } from '../../../common/types';
import './SpeechRecognition.css';

interface ListeningStatusProps {
  isListening: boolean;
}

const ListeningStatus = ({ isListening }: ListeningStatusProps): JSX.Element => (
  <div className="speech-status">
    {isListening ? (
      <div className="listening-indicator">
        <span className={`listening-dot`}></span>
        실시간 음성 인식 중
      </div>
    ) : (
      <div className="not-listening">음성 인식 시작 중...</div>
    )}
  </div>
);

const TranscriptBox = ({ transcript }: { transcript: string }): JSX.Element => (
  <div className="speech-transcript">
    <div className="speech-text">
      <div className="speech-label">인식된 음성:</div>
      <div className="speech-content">{transcript}</div>
    </div>
  </div>
);

const ErrorBox = ({ error }: { error: string }): JSX.Element => (
  <div className="speech-transcript">
    <div className="speech-error">
      <div className="speech-label">오류:</div>
      <div className="speech-content">{error}</div>
    </div>
  </div>
);

/**
 * 실시간 음성 인식 상태를 표시하는 컴포넌트
 */
const SpeechRecognition = ({
  isListening,
  transcript,
  error,
}: SpeechRecognitionProps): JSX.Element | null => {
  return (
    <div className="speech-recognition-section" role="status" aria-live="polite">
      <ListeningStatus isListening={isListening} />
      {transcript && <TranscriptBox transcript={transcript} />}
      {error && <ErrorBox error={error} />}
    </div>
  );
};

export default SpeechRecognition;
