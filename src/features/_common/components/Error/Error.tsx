import 'features/_common/components/Error/Error.css';
import { ErrorProps } from 'features/_common/types';
import React from 'react';

/**
 * 에러 상태를 표시하는 컴포넌트
 * @param props - 에러 컴포넌트 props
 * @returns JSX 엘리먼트
 */
const Error: React.FC<ErrorProps> = ({ error }) => {
  const handleRetry = (): void => {
    window.location.reload();
  };

  return (
    <div className="error-container">
      <h2>오류가 발생했습니다</h2>
      <p>{error}</p>
      <button onClick={handleRetry} type="button" aria-label="다시 시도">
        다시 시도
      </button>
    </div>
  );
};

export default Error;
