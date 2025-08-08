import './TimerFinishModal.css';

export interface TimerFinishModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 타이머 종료 시 표시되는 알림 모달
 */
const TimerFinishModal = ({ isOpen, onClose }: TimerFinishModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="timer-finish-overlay" onClick={onClose}>
      <div className="timer-finish-modal" onClick={e => e.stopPropagation()}>
        <div className="timer-finish-icon">
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <path
              d="M8 12l2 2 4-4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h2 className="timer-finish-title">타이머 종료</h2>
        <p className="timer-finish-message">설정한 시간이 완료되었습니다!</p>

        <button className="timer-finish-btn" onClick={onClose}>
          확인
        </button>
      </div>
    </div>
  );
};

export default TimerFinishModal;
