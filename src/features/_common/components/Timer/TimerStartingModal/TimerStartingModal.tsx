import './TimerStartingModal.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCancel: () => void;
  countdown: number;
  timerTime: string; // formatTime으로 포맷된 타이머 시간
}

const TimerStartingModal = ({ isOpen, onClose, onCancel, countdown, timerTime }: Props) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="timer-starting-modal-overlay" onClick={onClose}>
      <div className="timer-starting-modal" onClick={e => e.stopPropagation()}>
        <h2 className="timer-starting-title">{timerTime} 타이머 시작 알림</h2>
        <p className="timer-starting-message">잠시 후 타이머가 시작됩니다</p>
        <div className="timer-countdown">{countdown}</div>
        <div className="timer-starting-actions">
          <button className="timer-starting-cancel-btn" onClick={onCancel} type="button">
            취소
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimerStartingModal;
