import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@radix-ui/react-collapsible';
import { ChevronDown, Clock, Play } from 'lucide-react';
import { useRef, useState } from 'react';
import { RecipeStepDetail } from '../types';
import { formatTime } from '../utils/stepUtils';

interface RecipeStep { subtitle: string; details: readonly RecipeStepDetail[]; }
interface RecipeStepsProps { steps: readonly RecipeStep[]; onTimeClick?: (time: number) => void; }


const RecipeSteps = ({ steps, onTimeClick }: RecipeStepsProps) => {
  const [open, setOpen] = useState(true);
  const sectionRef = useRef<HTMLElement | null>(null);

  return (
    <section className="steps" ref={sectionRef as any}>
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="section-title-row">
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="steps__trigger"
              aria-expanded={open}
              aria-controls="steps-collapsible"
            >
              <h3 className="steps__title">조리 과정</h3>
              <span className="steps__meta">{steps.length} 단계</span>
            </button>
          </CollapsibleTrigger>

          <div className="section-right">
            <CollapsibleTrigger asChild>
              <button type="button" className="chevron-trigger" aria-label="열기/닫기">
                <ChevronDown className={`chevron-icon ${open ? 'is-open' : ''}`} size={16} />
              </button>
            </CollapsibleTrigger>
          </div>
        </div>

        <CollapsibleContent id="steps-collapsible" className="steps__content">
          <ol className="timeline">
            {steps.map((step, idx) => (
              <li key={`step-${idx}`} className="timeline__item">
                <div className="timeline__pin">{idx + 1}</div>
                <article className="step">
                  <header className="step__header">
                    <h4 className="step__subtitle">{step.subtitle}</h4>
                  </header>
                  <ul className="step__details">
                    {step.details.map((detail, i) => (
                      <li key={`detail-${idx}-${i}`} className="detail">
                        <span className="detail__text">{detail.text}</span>
                        {detail.start > 0 && (
                          <button
                            type="button"
                            className="detail__timechip"
                            onClick={() => onTimeClick?.(detail.start)}
                            title={`${formatTime(detail.start)}로 이동`}
                            aria-label={`동영상 ${formatTime(detail.start)} 시점으로 이동`}
                          >
                            <Clock size={12} className="timechip__icon" />
                            <span className="timechip__time">{formatTime(detail.start)}</span>
                            <Play size={10} className="timechip__play" />
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </article>
              </li>
            ))}
          </ol>
        </CollapsibleContent>
      </Collapsible>
    </section>
  );
};
export default RecipeSteps;