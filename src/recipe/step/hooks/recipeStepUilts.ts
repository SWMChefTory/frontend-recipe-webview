import { RecipeData } from "recipe/detail/types/recipe";

export const flatSteps = (recipeData: RecipeData) => {
  return recipeData.recipe_steps.flatMap((step, stepIdx) =>
    step.details.map((detail, detailIdx) => ({
      stepIdx,
      detailIdx,
      text: detail.text,
      start: detail.start,
      subtitle: step.subtitle,
    })),
  );
};


//recipeDetails에서 각 step의 시작 시간을 순서로 보장하여 배열로 변환
export const converToTimelineStarts = (recipeData: RecipeData) => {
  return flatSteps(recipeData).map(step => step.start);
};

export const count = (recipeData: RecipeData) => {
  return flatSteps(recipeData).length;
};