import { StepDotsProps } from '../../../common/types';

/**
 * 조리 단계 인디케이터 컴포넌트
 */
const StepDots = ({ totalSteps, currentStep, onStepClick }: StepDotsProps): JSX.Element => {
  return (
    <div className="step-dots" role="tablist" aria-label="조리 단계">
      {Array.from({ length: totalSteps }, (_, index) => (
        <button
          key={`step-dot-${index}`}
          type="button"
          className={`step-dot ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
          onClick={() => onStepClick(index)}
          aria-label={`${index + 1}단계로 이동`}
        />
      ))}
    </div>
  );
};

export default StepDots;
