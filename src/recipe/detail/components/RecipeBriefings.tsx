import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@radix-ui/react-collapsible';
import { ChevronDown } from 'lucide-react';
import React, { useState } from 'react';
import 'recipe/detail/components/RecipeBriefings.css';

type RecipeBriefingsProps = {
  briefings: string[];
};

const RecipeBriefings: React.FC<RecipeBriefingsProps> = ({ briefings }) => {
  const [open, setOpen] = useState(true);
  const isEmpty = !Array.isArray(briefings) || briefings.length === 0;
  if (isEmpty) return null;

  return (
    <section className="briefings" aria-labelledby="briefings-title">
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="section-title-row">
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="section-title-toggle"
              aria-expanded={open}
              aria-controls="briefings-collapsible"
            >
              <h3 id="briefings-title" className="section-title">
                AI 브리핑
              </h3>
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

        <CollapsibleContent id="briefings-collapsible" className="collapsible-content">
          <ul className="ingredient-card-list">
            {briefings.map((text, idx) => (
              <li key={`${idx}-${text?.slice?.(0, 12) || 'briefing'}`} className="ingredient-card">
                <span className="briefings__dot" aria-hidden="true" />
                <span className="briefings__text">{text}</span>
              </li>
            ))}
          </ul>
        </CollapsibleContent>
      </Collapsible>
    </section>
  );
};

export default RecipeBriefings;
