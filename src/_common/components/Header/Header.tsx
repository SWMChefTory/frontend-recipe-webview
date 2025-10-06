import '_common/components/Header/Header.css';
import { HeaderProps } from '_common/types';

/**
 * 헤더 컴포넌트
 * @param props - 헤더 컴포넌트 props
 * @returns JSX 엘리먼트
 */
const Header = ({ 
  title, 
  onBack, 
  darkMode = false, 
  isVisible = true, 
  className = '',
  onHeaderToggle
}: HeaderProps): JSX.Element => {
  return (
    <header 
      className={`header ${darkMode ? 'header-dark' : ''} ${!isVisible ? 'header-hidden' : ''} ${className}`}
    >
      <button className="header-back-btn" onClick={onBack} aria-label="뒤로 가기" type="button">
        {darkMode ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 18L9 12L15 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
      <h1 className="header-title">{title}</h1>
      {darkMode && className.includes('landscape') && (
        <div 
          className="header-handle"
          onClick={() => {
            if (!isVisible && onHeaderToggle) {
              onHeaderToggle();
            }
          }}
        >
          <div className="header-handle-bar"></div>
        </div>
      )}
    </header>
  );
};

export default Header;
