import 'features/_common/components/Timer/TimerDisplay/TimerDisplay.css';
import { TimerState } from 'features/_common/hooks/useTimer';

export interface TimerDisplayProps {
  timer: TimerState;
  formatTime: (time: number) => string;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onClose: () => void;
}

/**
 * 실행 중인 타이머를 표시하는 컴포넌트
 * @param props - 타이머 디스플레이 props
 * @returns JSX 엘리먼트
 */
const TimerDisplay = ({
  timer,
  formatTime,
  onPause,
  onResume,
  onStop,
  onClose,
}: TimerDisplayProps): JSX.Element | null => {
  // 타이머가 설정되지 않았거나 종료되었으면 표시하지 않음
  if (timer.timeLeft === 0 && !timer.isRunning && timer.initialTime === 0) {
    return null;
  }

  const progress =
    timer.initialTime > 0 ? ((timer.initialTime - timer.timeLeft) / timer.initialTime) * 100 : 0;

  return (
    <div className="timer-display-overlay" onClick={onClose}>
      <div
        className={`timer-display ${timer.isFinished ? 'timer-finished' : ''}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="timer-display-content">
          <div className="timer-display-time">{formatTime(timer.timeLeft)}</div>
          <div className="timer-display-controls">
            {timer.isRunning ? (
              <button
                className="timer-control-btn timer-pause-btn"
                onClick={onPause}
                aria-label="타이머 일시정지"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <rect x="6" y="4" width="4" height="16" fill="currentColor" />
                  <rect x="14" y="4" width="4" height="16" fill="currentColor" />
                </svg>
              </button>
            ) : (
              <button
                className="timer-control-btn timer-play-btn"
                onClick={onResume}
                aria-label="타이머 재개"
                disabled={timer.isFinished || timer.timeLeft === 0}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <polygon points="5,3 19,12 5,21" fill="currentColor" />
                </svg>
              </button>
            )}
            <button
              className="timer-control-btn timer-stop-btn"
              onClick={onStop}
              aria-label="타이머 중지"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" fill="currentColor" />
              </svg>
            </button>
          </div>
        </div>

        {/* 진행률 바 */}
        <div className="timer-progress-bar">
          <div className="timer-progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
};

export default TimerDisplay;
