import { RecipeStep } from '../../detail/types/recipe';

interface StepCardProps {
  step: RecipeStep;
  index: number;
  totalSteps: number;
}

const StepCard = ({ step, index, totalSteps }: StepCardProps) => (
  <div className="carousel-slide">
    <article className="step-card">
      <header className="step-header">
        <h3 className="step-title">Step {index + 1}</h3>
        <div className="step-indicator">
          {index + 1} / {totalSteps}
        </div>
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
