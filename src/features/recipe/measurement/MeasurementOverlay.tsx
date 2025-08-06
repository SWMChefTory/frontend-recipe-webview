import './MeasurementOverlay.css';
import MeasurementSection from './components/MeasurementSection';

interface Props {
  onClose: () => void;
}

const MeasurementOverlay = ({ onClose }: Props) => {
  return (
    <div className="measurement-overlay active">
      <div className="overlay-content">
        <button className="back-button" onClick={onClose}>
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

        <h1 className="guide-title">계량하기</h1>
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

export default MeasurementOverlay;
