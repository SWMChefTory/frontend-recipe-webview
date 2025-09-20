import '_common/components/Header/Header.css';
import React, { useMemo } from 'react';
import { IconType } from 'react-icons';

// 헤더 컴포넌트 Props
export interface HeaderProps {
  title: string;
  currentStep?: number;
  totalSteps?: number;
  onBack: () => void;
  onTimerClick?: () => void;
  rightSection?: React.ReactNode;
}

export interface HeaderRightSectionProps {
  action: () => void;
  icon: IconType;
}

export interface HeaderRightSectionComponentProps {
  childrens: HeaderRightSectionProps[];
}

export function HeaderRightSection({ childrens }: HeaderRightSectionComponentProps): JSX.Element {
  return (
    <div className="header-right-section">
      {childrens.map((child, index) => {
        const Icon = child.icon as React.ComponentType<any>;
        return (
          <button key={index} onClick={child.action} style={{
            background: 'none',
            border: 'none',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            width: '32px',
            height: '32px',
            color: 'black',
          }}>
            <Icon 
              size={24}           // 크기 설정 (픽셀)
              color="black"        // 색상 설정
            />
          </button>
        );
      })}
    </div>
  );
}

/**
 * 헤더 컴포넌트
 * @param props - 헤더 컴포넌트 props
 * @returns JSX 엘리먼트
 */
const Header = ({
  title,
  currentStep,
  totalSteps,
  onBack,
  rightSection,
}: HeaderProps): JSX.Element => {
  const displayTitle = useMemo(() => {
    return currentStep && totalSteps ? `${title}(${currentStep}/${totalSteps})` : title;
  }, [title, currentStep, totalSteps]);

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
      <h1 className="header-title">{displayTitle}</h1>
      {rightSection}
    </header>
  );
};

export default Header;
