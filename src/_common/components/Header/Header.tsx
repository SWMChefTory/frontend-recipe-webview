import '_common/components/Header/Header.css';
import { HeaderProps } from '_common/types';

/**
 * 헤더 컴포넌트
 * @param props - 헤더 컴포넌트 props
 * @returns JSX 엘리먼트
 */
const Header = ({ title, onBack }: HeaderProps): JSX.Element => {
  return (
    <header className="header">
      <button className="header-back-btn" onClick={onBack} aria-label="뒤로 가기" type="button">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M15 18L9 12L15 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <h1 className="header-title">{title}</h1>
    </header>
  );
};

export default Header;
