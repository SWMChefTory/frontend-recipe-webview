import { TimerFinishModal } from 'features/_common/components';
import { useTimer, UseTimerReturn } from 'features/_common/hooks/useTimer';
import { createContext, ReactNode, useContext, useState } from 'react';

interface TimerContextType extends UseTimerReturn {}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

interface TimerProviderProps {
  children: ReactNode;
}

/**
 * 전역 타이머 상태를 제공하는 Provider
 */
export const TimerProvider = ({ children }: TimerProviderProps) => {
  const [showFinishModal, setShowFinishModal] = useState(false);

  const timerMethods = useTimer(() => {
    // 타이머 종료 시 모달 표시
    setShowFinishModal(true);
  });

  return (
    <TimerContext.Provider value={timerMethods}>
      {children}
      <TimerFinishModal isOpen={showFinishModal} onClose={() => setShowFinishModal(false)} />
    </TimerContext.Provider>
  );
};

/**
 * 전역 타이머 상태를 사용하는 훅
 */
export const useGlobalTimer = (): TimerContextType => {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useGlobalTimer must be used within a TimerProvider');
  }
  return context;
};
