import { Ingredient } from 'features/recipe/detail/types/recipe';

interface Props {
  ingredients: readonly Ingredient[];
}

const IngredientList = ({ ingredients }: Props): JSX.Element => {
  return (
    <section className="ingredient-section">
      <h3 className="section-title">재료</h3>
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
