import 'features/_common/components/Timer/TimerModal/TimerModal.css';
import { useState } from 'react';
import SwipeTimerInput from './SwipeTimerInput';

export interface TimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSetTimer: (minutes: number, seconds: number) => void;
}

/**
 * 타이머 설정 모달 컴포넌트
 * @param props - 타이머 모달 컴포넌트 props
 * @returns JSX 엘리먼트
 */
const TimerModal = ({ isOpen, onClose, onSetTimer }: TimerModalProps): JSX.Element | null => {
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  if (!isOpen) return null;

  const handleMinutesChange = (value: number) => {
    setMinutes(value);
  };

  const handleSecondsChange = (value: number) => {
    setSeconds(value);
  };

  const handleSetTimer = () => {
    if (minutes > 0 || seconds > 0) {
      onSetTimer(minutes, seconds);
      onClose();
      setMinutes(0);
      setSeconds(0);
    }
  };

  const handleCancel = () => {
    onClose();
    setMinutes(0);
    setSeconds(0);
  };

  return (
    <div className="timer-modal-overlay" onClick={handleCancel}>
      <div className="timer-modal" onClick={e => e.stopPropagation()}>
        <div className="timer-modal-header">
          <h2 className="timer-modal-title">타이머 설정</h2>
          <button className="timer-modal-close" onClick={handleCancel} aria-label="닫기">
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
        </div>

        <div className="timer-modal-content">
          <div className="timer-inputs">
            <SwipeTimerInput
              value={minutes}
              min={0}
              max={59}
              onChange={handleMinutesChange}
              label="분"
            />

            <div className="timer-separator">:</div>

            <SwipeTimerInput
              value={seconds}
              min={0}
              max={59}
              onChange={handleSecondsChange}
              label="초"
            />
          </div>

          <div className="timer-preset-buttons">
            <button
              className="timer-preset-btn"
              onClick={() => {
                setMinutes(5);
                setSeconds(0);
              }}
            >
              5분
            </button>
            <button
              className="timer-preset-btn"
              onClick={() => {
                setMinutes(10);
                setSeconds(0);
              }}
            >
              10분
            </button>
            <button
              className="timer-preset-btn"
              onClick={() => {
                setMinutes(20);
                setSeconds(0);
              }}
            >
              20분
            </button>
            <button
              className="timer-preset-btn"
              onClick={() => {
                setMinutes(30);
                setSeconds(0);
              }}
            >
              30분
            </button>
          </div>
        </div>

        <div className="timer-modal-actions">
          <button className="timer-modal-btn timer-modal-btn-cancel" onClick={handleCancel}>
            취소
          </button>
          <button
            className="timer-modal-btn timer-modal-btn-confirm"
            onClick={handleSetTimer}
            disabled={minutes === 0 && seconds === 0}
          >
            타이머 설정
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimerModal;
