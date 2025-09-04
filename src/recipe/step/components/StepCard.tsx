import { RecipeStep } from '../../detail/types/recipe';

interface StepCardProps {
  step: RecipeStep;
  index: number;
}

const StepCard = ({ step, index }: StepCardProps) => (
  <div className="carousel-slide">
    <article className="step-card">
      <header className="step-header">
        <h3 className="step-number">Step {index + 1}</h3>
        <div className="step-subtitle">{step.subtitle}</div>
      </header>
      <div className="step-content">
        <ul className="step-description-list">
          {step.details.map((detail, detailIndex) => (
            <li key={`detail-${index}-${detailIndex}`} className="step-description-item">
              {detail}
            </li>
          ))}
        </ul>
      </div>
    </article>
  </div>
);

export default StepCard;
