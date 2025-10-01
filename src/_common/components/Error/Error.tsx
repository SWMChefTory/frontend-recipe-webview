import '_common/components/Error/Error.css';
import { ErrorProps } from '_common/types';
import { sendBackPressed } from 'bridge/utils/webview';
import React from 'react';

/**
 * 에러 상태를 표시하는 컴포넌트
 * @param props - 에러 컴포넌트 props
 * @returns JSX 엘리먼트
 */
const Error: React.FC<ErrorProps> = ({ error }) => {
  const handleBackPressed = (): void => {
    sendBackPressed();
  };

  return (
    <div className="error-container">
      <h2>오류가 발생했습니다</h2>
      <p>{error}</p>
      <div className="error-actions" role="group" aria-label="에러 액션">
        <button onClick={handleBackPressed} type="button" aria-label="뒤로">
          뒤로
        </button>
      </div>
    </div>
  );
};

export default Error;
