import './StepCard.css';
interface StepCardProps {
  step: string;
  detail: string;
  index: number;
}

const StepCard = ({ step, detail, index }: StepCardProps) => (
  <div className="carousel-slide">
    <article className="step-card">
      <header className="step-header">
        <h3 className="step-number">{index}단계</h3>
        <div className="step-subtitle">{step}</div>
      </header>
      <div style={{ paddingBottom: '2rem' }}></div>
      <div className="step-content">
        <span className="step-description-text">{detail}</span>
      </div>
    </article>
  </div>
);

export default StepCard;
