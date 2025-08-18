import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@radix-ui/react-collapsible';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface RecipeStep {
  subtitle: string;
  details: readonly string[];
}

interface RecipeStepsProps {
  steps: readonly RecipeStep[];
}

const RecipeSteps = ({ steps }: RecipeStepsProps) => {
  const [open, setOpen] = useState(false);

  return (
    <section className="steps-section">
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="section-title-row">
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="section-title-toggle"
              aria-expanded={open}
              aria-controls="steps-collapsible"
            >
              <h3 className="section-title">조리 과정</h3>
              <ChevronDown className="chevron-icon" size={16} />
            </button>
          </CollapsibleTrigger>
          {/* 우측에 다른 버튼이 없다면 비워둠(정렬 유지용) */}
          <span style={{ width: 0, height: 40 }} aria-hidden />
        </div>

        <CollapsibleContent
          id="steps-collapsible"
          className="collapsible-content steps-collapsible"
        >
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
        </CollapsibleContent>
      </Collapsible>
    </section>
  );
};

export default RecipeSteps;
