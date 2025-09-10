// 재료 스케일링을 위한 유틸리티 함수들

import { Ingredient } from '../types';


const decimalToFraction = (decimal: number): string => {
  const commonFractions: { [key: string]: string } = {
    '0.25': '1/4',
    '0.33': '1/3',
    '0.5': '1/2',
    '0.67': '2/3',
    '0.75': '3/4',
    '1.25': '1 1/4',
    '1.33': '1 1/3',
    '1.5': '1 1/2',
    '1.67': '1 2/3',
    '1.75': '1 3/4',
    '2.5': '2 1/2',
    '2.25': '2 1/4',
    '2.75': '2 3/4',
  };

  // 정확히 일치하는 분수가 있으면 사용
  const rounded = Math.round(decimal * 100) / 100;
  const key = rounded.toFixed(2);

  if (commonFractions[key]) {
    return commonFractions[key];
  }

  if (decimal % 1 === 0) {
    return decimal.toString();
  }

  return decimal.toFixed(1);
};

export const scaleIngredientAmount = (amount: number, ratio: number): string => {
  // 숫자로 전달된 경우
  const scaled = amount * ratio;
  return decimalToFraction(scaled);
};

export const scaleIngredients = (
  ingredients: Ingredient[],
  currentServings: number,
  originalServings: number
) => {
  console.log(ingredients)
  if (originalServings <= 0) return ingredients;

  const ratio = currentServings / originalServings;

  return ingredients.map(ingredient => ({
    ...ingredient,
    amount: scaleIngredientAmount(ingredient.amount, ratio),
  }));
};
