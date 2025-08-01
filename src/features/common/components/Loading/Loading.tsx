import 'features/common/components/Loading/Loading.css';
import { LoadingProps } from 'features/common/types';

/**
 * 로딩 상태를 표시하는 컴포넌트
 * @param props - 로딩 컴포넌트 props
 * @returns JSX 엘리먼트
 */
const Loading = ({ className }: LoadingProps): JSX.Element => {
  return (
    <div className={`loading-container ${className || ''}`}>
      <div className="loading-spinner"></div>
      <p>레시피를 불러오는 중...</p>
    </div>
  );
};

export default Loading;
