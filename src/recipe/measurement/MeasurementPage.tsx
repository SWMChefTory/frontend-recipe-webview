import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './MeasurementPage.css';
import MeasurementSection from './components/MeasurementSection';

const MeasurementPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const handleBack = (): void => {
    navigate(`/recipes/${id}`, { replace: true });
  };

  // 네이티브 BACK_PRESSED 처리
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
  }, [id, navigate]);

  return (
    <div className="measurement-page active">
      <div className="overlay-content">
        <button className="back-button" onClick={handleBack}>
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

        <h1 className="guide-title">계량법</h1>
        <div className="unit-table">
          <div className="unit-row">
            <span>1큰술 (1Tbsp)</span>
            <span className="equal">=</span>
            <span className="value">15ml</span>
          </div>
          <div className="unit-row">
            <span>1작은술 (1tsp)</span>
            <span className="equal">=</span>
            <span className="value">5ml</span>
          </div>
          <div className="unit-row">
            <span>1컵 (1cup)</span>
            <span className="equal">=</span>
            <span className="value">200ml</span>
          </div>
        </div>

        <MeasurementSection
          title="가루류 계량"
          groups={[
            {
              categoryLabel: '1큰술',
              images: [
                {
                  src: '/images/measurement/dry/tbsp/measuring.png',
                  caption: '계량스푼',
                },
                {
                  src: '/images/measurement/dry/tbsp/spoon.png',
                  caption: '1숟가락 소복이',
                },
              ],
            },
            {
              categoryLabel: '1작은술',
              images: [
                {
                  src: '/images/measurement/dry/tsp/measuring.png',
                  caption: '계량스푼',
                },
                {
                  src: '/images/measurement/dry/tsp/spoon.png',
                  caption: '½ 숟가락',
                },
              ],
            },
          ]}
        />
      </div>
    </div>
  );
};

export default MeasurementPage;
