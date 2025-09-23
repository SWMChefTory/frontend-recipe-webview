import './StepCard.css';
import { useOrientation } from '_common/orientation/useOrientation';
import { MdOutlineScreenRotation } from "react-icons/md";

import React from 'react';

interface StepCardProps {
  step: string;
  detail: string;
  index: number;
  isKwsActive?: boolean;
}
function RotateButton(){
  const { handlePortrait } = useOrientation();
  return (
    <button onClick={handlePortrait} style={{
      background: 'none',
      border: 'none',
      justifyContent: 'center',
      alignItems: 'center',
      cursor: 'pointer',
      width: '32px',
      height: '32px',
      color: 'black',
    }}>
      {React.createElement(MdOutlineScreenRotation as React.ComponentType<any>, { size: 24, color: "black" })}    
    </button>
  )
}

const StepCard = ({ step, detail, index, }: StepCardProps) => {
  const { isPortrait } = useOrientation();
  // const {bottom} = useSafeArea();

  return (
    <div className="carousel-slide">
      <article className={isPortrait() ? 'step-card' : 'step-card-landscape'}>
        <header className={isPortrait() ? 'step-header' : 'step-header-landscape'}>
          <h3 className={isPortrait() ? 'step-number' : 'step-number-landscape'}>{index}단계</h3>
          <div style={{ width: '0.5rem' }}></div>
          <div className={isPortrait() ? 'step-subtitle' : 'step-subtitle-landscape'}>{step}</div>
          <div style={{ width: '0.5rem' }}></div>
          {!isPortrait() && <RotateButton />}
        </header>
        <div style={{ paddingBottom: '2rem'}}></div>
        <div className="step-content" style={{paddingLeft: isPortrait() ? '0rem' : '0.5rem'}}>
          <span className="step-description-text">{detail}</span>
        </div>
      </article>
    </div>
  );
};

export default StepCard;
