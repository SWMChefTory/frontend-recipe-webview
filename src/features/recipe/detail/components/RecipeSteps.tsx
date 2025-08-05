interface RecipeStep {
  subtitle: string;
  details: readonly string[];
}

interface RecipeStepsProps {
  steps: readonly RecipeStep[];
}

const RecipeSteps = ({ steps }: RecipeStepsProps) => {
  return (
    <div className="recipe-steps">
      {steps.map((step, idx) => (
        <div key={`step-${idx}`} className="recipe-step-card">
          <div className="step-header">
            <span className="step-number">STEP {idx + 1}</span>
            <span className="step-subtitle">{step.subtitle}</span>
          </div>
          <ul className="step-details">
            {step.details.map((detail, detailIdx) => (
              <li key={`detail-${idx}-${detailIdx}`} className="step-detail-item">
                {detail}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default RecipeSteps;
