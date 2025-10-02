import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MeasurementPage.css';
import MeasurementSection from './components/MeasurementSection';
import { Header } from '../../_common';

type MeasurementCategory = 'dry' | 'liquid' | 'jang';

export const MeasurementPage = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<MeasurementCategory>('dry');

  const handleBack = (): void => {
    navigate(-1);
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      let msg: unknown;
      try {
        msg = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      } catch (e) {
        return;
      }

      if (
        typeof msg === 'object' &&
        msg !== null &&
        'type' in msg &&
        (msg as any).type === 'BACK_PRESSED'
      ) {
        navigate(-1);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [navigate]);

  const measurementData = {
    dry: [
      {
        categoryLabel: '1큰술',
        images: [
          { src: '/images/measurement/dry/tbsp/measuring.png', caption: '계량스푼' },
          { src: '/images/measurement/dry/tbsp/spoon.png', caption: '1숟가락 소복이' },
        ],
      },
      {
        categoryLabel: '1작은술',
        images: [
          { src: '/images/measurement/dry/tsp/measuring.png', caption: '계량스푼' },
          { src: '/images/measurement/dry/tsp/spoon.png', caption: '½ 숟가락' },
        ],
      },
    ],
    liquid: [
      {
        categoryLabel: '1큰술',
        images: [
          { src: '/images/measurement/liquid/tbsp/measuring.png', caption: '계량스푼' },
          { src: '/images/measurement/liquid/tbsp/spoon.png', caption: '1숟가락 가득' },
        ],
      },
      {
        categoryLabel: '1작은술',
        images: [
          { src: '/images/measurement/liquid/tsp/measuring.png', caption: '계량스푼' },
          { src: '/images/measurement/liquid/tsp/spoon.png', caption: '½ 숟가락' },
        ],
      },
    ],
    jang: [
      {
        categoryLabel: '1큰술',
        images: [
          { src: '/images/measurement/jang/tbsp/measuring.png', caption: '계량스푼' },
          { src: '/images/measurement/jang/tbsp/spoon.png', caption: '1+ 1/2숟가락 수북이' },
        ],
      },
      {
        categoryLabel: '1작은술',
        images: [
          { src: '/images/measurement/jang/tsp/measuring.png', caption: '계량스푼' },
          { src: '/images/measurement/jang/tsp/spoon.png', caption: '2/3 숟가락' },
        ],
      },
    ],
  };

  return (
    <div className="measurement-page active">
      <Header title={"계량법"} onBack={handleBack} />

      <div className="measurement-overlay-content">
        <div className="measurement-unit-table">
          <div className="measurement-unit-row">
            <span>1큰술 (1Tbsp)</span>
            <span className="measurement-equal">=</span>
            <span className="measurement-value">15ml</span>
          </div>
          <div className="measurement-unit-row">
            <span>1작은술 (1tsp)</span>
            <span className="measurement-equal">=</span>
            <span className="measurement-value">5ml</span>
          </div>
          <div className="measurement-unit-row">
            <span>1컵 (1cup)</span>
            <span className="measurement-equal">=</span>
            <span className="measurement-value">200ml</span>
          </div>
        </div>

        <div className="measurement-tabs">
          <button
            className={`measurement-tab ${activeCategory === 'dry' ? 'active' : ''}`}
            onClick={() => setActiveCategory('dry')}
          >
            가루류
            {activeCategory === 'dry' && <div className="measurement-tab-indicator" />}
          </button>
          <button
            className={`measurement-tab ${activeCategory === 'liquid' ? 'active' : ''}`}
            onClick={() => setActiveCategory('liquid')}
          >
            액체류
            {activeCategory === 'liquid' && <div className="measurement-tab-indicator" />}
          </button>
          <button
            className={`measurement-tab ${activeCategory === 'jang' ? 'active' : ''}`}
            onClick={() => setActiveCategory('jang')}
          >
            장류
            {activeCategory === 'jang' && <div className="measurement-tab-indicator" />}
          </button>
        </div>

        <MeasurementSection title="" groups={measurementData[activeCategory]} />
      </div>
    </div>
  );
};
