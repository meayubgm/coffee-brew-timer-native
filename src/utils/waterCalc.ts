// 人数から豆量を計算（1人あたりデフォルト15g）
export function calcBeansFromServings(servings: number, gramsPerServing = 15): number {
  return servings * gramsPerServing;
}

// 豆量と比率から総湯量を計算
export function calcTotalWater(beansGrams: number, ratio: number): number {
  return Math.round(beansGrams * ratio);
}
