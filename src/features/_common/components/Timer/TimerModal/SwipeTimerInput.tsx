import { useEffect, useRef, useState } from 'react';
import './SwipeTimerInput.css';

interface SwipeTimerInputProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  label: string;
}

/**
 * 스와이프로 조절 가능한 타이머 입력 컴포넌트
 */
const SwipeTimerInput = ({ value, min, max, onChange, label }: SwipeTimerInputProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startValue, setStartValue] = useState(0);

  const formatValue = (val: number) => val.toString().padStart(2, '0');

  const handleStart = (clientY: number) => {
    setIsDragging(true);
    setStartY(clientY);
    setStartValue(value);
  };

  const handleMove = (clientY: number) => {
    if (!isDragging) return;

    const deltaY = startY - clientY; // 위로 스와이프하면 양수
    const sensitivity = 5; // 5픽셀당 1씩 변경 (더 부드럽게)
    const delta = Math.round(deltaY / sensitivity);
    let newValue = startValue + delta;

    // 값 순환 처리
    const range = max - min + 1;
    if (newValue > max) {
      newValue = min + ((newValue - min) % range);
    } else if (newValue < min) {
      newValue = max - ((min - newValue - 1) % range);
    }

    if (newValue !== value) {
      onChange(newValue);
    }
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  // 마우스 이벤트
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientY);
  };

  const handleMouseMove = (e: MouseEvent) => {
    handleMove(e.clientY);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  // 터치 이벤트
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleStart(touch.clientY);
  };

  const handleTouchMove = (e: TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleMove(touch.clientY);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  // 전역 이벤트 리스너 등록/해제
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
    return undefined;
  }, [isDragging, startY, startValue, value]);

  return (
    <div className="swipe-timer-input">
      <label className="swipe-timer-label">{label}</label>
      <div
        ref={containerRef}
        className={`swipe-timer-container ${isDragging ? 'dragging' : ''}`}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* 위쪽 화살표 */}
        <div className="swipe-timer-arrow swipe-timer-arrow-up">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 15L12 9L6 15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* 값 표시 */}
        <div className="swipe-timer-value">{formatValue(value)}</div>

        {/* 아래쪽 화살표 */}
        <div className="swipe-timer-arrow swipe-timer-arrow-down">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M6 9L12 15L18 9"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
      <div className="swipe-timer-hint">위아래로 드래그</div>
    </div>
  );
};

export default SwipeTimerInput;
