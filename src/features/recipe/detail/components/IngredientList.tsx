import { Ingredient } from 'features/recipe/detail/types/recipe';

interface Props {
  ingredients: readonly Ingredient[];
}

const IngredientList = ({ ingredients }: Props): JSX.Element => {
  return (
    <section className="ingredients-section">
      <h3 className="section-title">재료</h3>
      <ul className="ingredients-list">
        {ingredients.map((ingredient, index) => (
          <li key={index} className="ingredient-item">
            {index + 1}. {ingredient.name} {ingredient.amount} {ingredient.unit}
          </li>
        ))}
      </ul>
    </section>
  );
};

export default IngredientList;
