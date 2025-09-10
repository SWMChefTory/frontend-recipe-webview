import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@radix-ui/react-collapsible';
import { ChevronDown } from 'lucide-react';
import React, { useState } from 'react';
import { scaleIngredients } from '../utils/ingredientUtils';
import { Ingredient } from '../types';

interface IngredientListProps {
  ingredients: Ingredient[];
  currentServings: number;
  originalServings: number;
  onOpenMeasurement: () => void;
  onCheckedSummaryChange: (checkedCount: number, total: number) => void;
}

const IngredientList: React.FC<IngredientListProps> = ({
                                                         ingredients,
                                                         currentServings,
                                                         originalServings,
                                                         onOpenMeasurement,
                                                         onCheckedSummaryChange,
                                                       }) => {
  const [open, setOpen] = useState(true);

  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());


  const total = ingredients.length;

  const notifyChange = (setObj: Set<number>) => {
    const checkedCount = setObj.size;
    onCheckedSummaryChange?.(checkedCount, total);
  };

  const scaledIngredients = scaleIngredients(ingredients, currentServings, originalServings);

  const toggleIngredient = (index: number) => {
    const next = new Set(checkedIngredients);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setCheckedIngredients(next);
    notifyChange(next);
  };

  const progressPercentage = ingredients.length > 0
    ? Math.round((checkedIngredients.size / ingredients.length) * 100)
    : 0;

  return (
    <section className="ingredient-section">
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="section-title-row">
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="section-title-toggle"
              aria-expanded={open}
              aria-controls="ingredient-list"
            >
              <h3 className="section-title">
                재료
              </h3>
            </button>
          </CollapsibleTrigger>

          <div className="section-right">
            <button
              className="measurement-button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenMeasurement();
              }}
            >
              계량법
            </button>

            <CollapsibleTrigger asChild>
              <button type="button" className="chevron-trigger" aria-label="열기/닫기">
                <ChevronDown className={`chevron-icon ${open ? 'is-open' : ''}`} size={16} />
              </button>
            </CollapsibleTrigger>
          </div>
        </div>

        {(
          <div style={{
            padding: '0 16px 8px',
            background: 'var(--card)'
          }}>
            <div style={{
              width: '100%',
              height: '4px',
              background: 'var(--bg)',
              borderRadius: '2px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${progressPercentage}%`,
                height: '100%',
                background: 'linear-gradient(90deg, var(--brand), var(--brand-dark))',
                transition: 'width 0.3s ease',
                borderRadius: '2px'
              }} />
            </div>
          </div>
        )}

        <CollapsibleContent id="ingredient-list" className="collapsible-content" data-state={open ? 'open' : 'closed'}>
          <ul className="ingredient-card-list">
            {scaledIngredients.map((ingredient, index) => (
              <li
                key={`${ingredient.name}-${index}`}
                className={`ingredient-card ${checkedIngredients.has(index) ? 'ingredient-checked' : ''}`}
              >
                <label className="ingredient-checkbox-label">
                  <input
                    type="checkbox"
                    className="ingredient-checkbox"
                    checked={checkedIngredients.has(index)}
                    onChange={() => toggleIngredient(index)}
                    aria-label={`${ingredient.name} 준비 완료`}
                  />
                  <span className="ingredient-name">{ingredient.name}</span>
                </label>
                {ingredient.amount && ingredient.amount !== 0 && ingredient.amount !== '0' && (
                  <span className="ingredient-amount">
                    {ingredient.amount} {ingredient.unit}
                  </span>
                )}
              </li>
            ))}
          </ul>

          {currentServings !== originalServings && (
            <div style={{
              padding: '8px 16px 16px',
              textAlign: 'center',
              fontSize: '12px',
              color: 'var(--muted)',
              fontStyle: 'italic'
            }}>
              * 원본 레시피 {originalServings}인분 기준으로 {currentServings}인분에 맞춰 조정되었습니다.
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </section>
  );
};

export default IngredientList;