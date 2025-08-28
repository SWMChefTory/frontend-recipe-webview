import 'features/_common/components/Loading/Loading.css';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

/**
 * 로딩 상태를 표시하는 컴포넌트
 * @param props - 로딩 컴포넌트 props
 * @returns JSX 엘리먼트
 */
const Loading = (): JSX.Element => {
  return (
    <div className="loading-container">
      {/* 상단 헤더 자리 (sticky) */}
      <div className="skeleton-header">
        <Skeleton className="skeleton-button" borderRadius={12} />
      </div>

      {/* YouTube 영역 (16:9 블럭) */}
      <div className="skeleton-video">
        <Skeleton className="skeleton-box skeleton-box-lg" borderRadius={0} />
      </div>

      {/* 제목, 재료, 조리 과정 블럭 */}
      <div className="skeleton-content">
        {/* 제목 카드 블럭 */}
        <div className="skeleton-block">
          <Skeleton className="skeleton-box skeleton-box-sm" borderRadius={12} />
        </div>

        {/* 재료 블럭 */}
        <div className="skeleton-section">
          <Skeleton className="skeleton-box skeleton-box-sm" borderRadius={12} />
        </div>

        {/* 조리 과정 블럭 */}
        <div className="skeleton-section">
          <Skeleton className="skeleton-box skeleton-box-sm" borderRadius={12} />
        </div>
      </div>

      {/* 하단 고정 버튼 바 */}
      <div className="skeleton-bottom-bar">
        <Skeleton className="skeleton-button" borderRadius={12} />
      </div>
    </div>
  );
};

export default Loading;
