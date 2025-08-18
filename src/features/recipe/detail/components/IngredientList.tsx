import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@radix-ui/react-collapsible';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

type Ingredient = { name: string; amount: number; unit: string };
type Props = {
  ingredients: ReadonlyArray<Ingredient>;
  onOpenMeasurement: () => void;
};

export default function IngredientList({ ingredients, onOpenMeasurement }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <section className="ingredient-section">
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="section-title-row">
          {/* 제목만 토글 트리거로 */}
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="section-title-toggle"
              aria-expanded={open}
              aria-controls="ingredient-list"
            >
              <h3 className="section-title">재료</h3>
              <ChevronDown className="chevron-icon" size={16} />
            </button>
          </CollapsibleTrigger>

          {/* 독립 버튼: 계량법 */}
          <button
            className="measurement-button"
            onClick={e => {
              e.stopPropagation();
              onOpenMeasurement();
            }}
          >
            계량법
          </button>
        </div>

        <CollapsibleContent id="ingredient-list" className="collapsible-content">
          <ul className="ingredient-card-list">
            {ingredients.map((ingredient, index) => (
              <li key={index} className="ingredient-card">
                <span className="ingredient-name">{ingredient.name}</span>
                {ingredient.amount > 0 && (
                  <span className="ingredient-amount">
                    {ingredient.amount}
                    {ingredient.unit}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </CollapsibleContent>
      </Collapsible>
    </section>
  );
}
