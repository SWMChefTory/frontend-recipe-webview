import { Ingredient } from 'features/recipe/detail/types/recipe';

interface Props {
  ingredients: readonly Ingredient[];
  onOpenMeasurement?: () => void;
}

const IngredientList = ({ ingredients, onOpenMeasurement }: Props): JSX.Element => {
  return (
    <section className="ingredient-section">
      <div className="section-title-row">
        <h3 className="section-title">재료</h3>
        <button className="measurement-button" onClick={onOpenMeasurement}>
          계량법
        </button>
      </div>

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
    </section>
  );
};

export default IngredientList;
