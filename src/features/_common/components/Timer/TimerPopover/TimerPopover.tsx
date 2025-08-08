import 'features/_common/components/Timer/TimerPopover/TimerPopover.css';
import { useEffect } from 'react';

export interface TimerPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  timeLeft: number;
  isRunning: boolean;
  formatTime: (time: number) => string;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  initialTime?: number; // 초기 설정 시간 (진행률 계산용)
}

/**
 * 타이머 컨트롤 팝오버 컴포넌트
 * 원형 타이머와 일시정지/재개, 종료 버튼을 포함
 */
const TimerPopover = ({
  isOpen,
  onClose,
  timeLeft,
  isRunning,
  formatTime,
  onPause,
  onResume,
  onStop,
  initialTime = 0,
}: TimerPopoverProps): JSX.Element | null => {
  // 타이머가 00:00이 되면 자동으로 창 닫기
  useEffect(() => {
    if (isOpen && timeLeft === 0 && initialTime > 0) {
      // 타이머 완료 시 자동으로 모달 닫기
      onClose();
    }
  }, [timeLeft, isOpen, initialTime, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // 진행률 계산 (0에서 1 사이의 값) - 경과 시간 비율
  const progress = initialTime > 0 ? (initialTime - timeLeft) / initialTime : 0;

  // SVG 원의 둘레 계산 (반지름 86px 기준)
  const radius = 86;
  const circumference = 2 * Math.PI * radius;

  // 진행률에 따른 stroke-dashoffset 계산 (시간이 흐름에 따라 테두리가 차오름)
  // 전체 둘레에서 진행된 만큼을 빼서 남은 부분만 숨김
  const strokeDashoffset = circumference * (1 - progress);

  // 종료 버튼 핸들러 (타이머 리셋 + 모달 닫기)
  const handleStop = () => {
    onStop();
    onClose();
  };

  return (
    <div className="timer-popover-overlay" onClick={handleOverlayClick}>
      <div className="timer-popover">
        {/* 닫기 버튼 */}
        <button className="timer-popover-close" onClick={onClose} aria-label="닫기">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* 원형 타이머 */}
        <div className="timer-circle-container">
          <div className="timer-circle">
            {/* SVG 원형 진행바 */}
            <svg className="timer-circle-svg" viewBox="0 0 200 200">
              {/* 배경 원 (남은 시간 - 보라색) */}
              <circle cx="100" cy="100" r={radius} fill="none" stroke="#4f46e5" strokeWidth="8" />
              {/* 진행바 원 (경과 시간 - 회색) */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke="#e9ecef"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                transform="rotate(-90 100 100)"
                className={`timer-progress-circle ${isRunning ? 'running' : 'paused'}`}
              />
            </svg>
            <div className="timer-time-display">{formatTime(timeLeft)}</div>
          </div>
        </div>

        {/* 컨트롤 버튼들 */}
        <div className="timer-controls">
          {isRunning ? (
            <button
              className="timer-control-btn timer-pause-btn"
              onClick={onPause}
              aria-label="일시정지"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="6" y="4" width="4" height="16" fill="currentColor" />
                <rect x="14" y="4" width="4" height="16" fill="currentColor" />
              </svg>
            </button>
          ) : (
            <button
              className="timer-control-btn timer-resume-btn"
              onClick={onResume}
              aria-label="재개"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <polygon points="5,3 19,12 5,21" fill="currentColor" />
              </svg>
            </button>
          )}

          <button
            className="timer-control-btn timer-stop-btn"
            onClick={handleStop}
            aria-label="종료"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimerPopover;
