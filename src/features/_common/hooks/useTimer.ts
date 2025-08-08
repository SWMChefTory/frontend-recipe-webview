import { useCallback, useEffect, useRef, useState } from 'react';

export interface TimerState {
  isRunning: boolean;
  timeLeft: number; // seconds
  initialTime: number; // seconds
  isFinished: boolean;
}

export interface UseTimerReturn {
  timer: TimerState;
  startTimer: (minutes: number, seconds: number) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
  formatTime: (time: number) => string;
}

/**
 * 타이머 관리를 위한 커스텀 훅
 * @param onFinish - 타이머 종료 시 호출될 콜백 함수 (옵션)
 * @returns 타이머 상태와 제어 함수들
 */
export const useTimer = (onFinish?: () => void): UseTimerReturn => {
  const [timer, setTimer] = useState<TimerState>({
    isRunning: false,
    timeLeft: 0,
    initialTime: 0,
    isFinished: false,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onFinishRef = useRef(onFinish);

  // onFinish 콜백을 최신 상태로 유지
  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  // 타이머 카운트다운 로직
  useEffect(() => {
    if (timer.isRunning && timer.timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimer(prev => {
          const newTimeLeft = prev.timeLeft - 1;

          if (newTimeLeft <= 0) {
            // 타이머 종료
            return {
              ...prev,
              timeLeft: 0,
              isRunning: false,
              isFinished: true,
            };
          }

          return {
            ...prev,
            timeLeft: newTimeLeft,
          };
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [timer.isRunning, timer.timeLeft]);

  // 타이머 종료 시 콜백 실행
  useEffect(() => {
    if (timer.isFinished && timer.timeLeft === 0 && onFinishRef.current) {
      onFinishRef.current();
    }
  }, [timer.isFinished, timer.timeLeft]);

  /**
   * 타이머 시작
   * @param minutes - 분
   * @param seconds - 초
   */
  const startTimer = useCallback((minutes: number, seconds: number) => {
    const totalSeconds = minutes * 60 + seconds;

    if (totalSeconds > 0) {
      setTimer({
        isRunning: true,
        timeLeft: totalSeconds,
        initialTime: totalSeconds,
        isFinished: false,
      });
    }
  }, []);

  /**
   * 타이머 일시정지
   */
  const pauseTimer = useCallback(() => {
    setTimer(prev => ({
      ...prev,
      isRunning: false,
    }));
  }, []);

  /**
   * 타이머 재개
   */
  const resumeTimer = useCallback(() => {
    setTimer(prev => {
      if (prev.timeLeft > 0 && !prev.isFinished) {
        return {
          ...prev,
          isRunning: true,
        };
      }
      return prev;
    });
  }, []);

  /**
   * 타이머 중지 (초기화)
   */
  const stopTimer = useCallback(() => {
    setTimer({
      isRunning: false,
      timeLeft: 0,
      initialTime: 0,
      isFinished: false,
    });
  }, []);

  /**
   * 타이머 리셋 (초기 시간으로 되돌림)
   */
  const resetTimer = useCallback(() => {
    setTimer(prev => ({
      isRunning: false,
      timeLeft: prev.initialTime,
      initialTime: prev.initialTime,
      isFinished: false,
    }));
  }, []);

  /**
   * 시간을 MM:SS 형식으로 포맷팅
   * @param time - 초 단위 시간
   * @returns 포맷된 시간 문자열
   */
  const formatTime = useCallback((time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  return {
    timer,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    resetTimer,
    formatTime,
  };
};
