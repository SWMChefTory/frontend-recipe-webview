import './Overlay.css';

export function LoadingOverlay() {
  console.log('LoadingOverlay');
    return (
      <div className="loading-overlay">
        <div className="loading-content">
          <div className="spinner"></div>
          <p className="loading-message">로딩중...</p>
        </div>
      </div>
    );
  }