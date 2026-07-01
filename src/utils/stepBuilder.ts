import { BrewStep, BrewStepTemplate, BrewPresetTemplate, BrewPreset } from '../types/preset';
import { calcTotalWater } from './waterCalc';

// テンプレートと豆量からBrewPreset（実際の注湯量入り）を生成する
export function buildPresetFromTemplate(
  template: BrewPresetTemplate,
  beansGrams: number,
  selectedGroupOptionIds?: Record<string, string>,  // groupId -> optionId
): BrewPreset {
  const totalWater = calcTotalWater(beansGrams, template.ratio);
  let cumulative = 0;

  // 全グループのオーバーライドをstepIdごとにマージし、hotWaterRatioも取得する
  const mergedOverrides: Record<string, Partial<BrewStepTemplate>> = {};
  let hotWaterRatio = 1.0;
  for (const group of template.optionGroups ?? []) {
    const optionId = selectedGroupOptionIds?.[group.id] ?? group.defaultOptionId;
    const option = group.options.find((o) => o.id === optionId);
    if (option) {
      if (option.hotWaterRatio !== undefined) {
        hotWaterRatio = option.hotWaterRatio;
      }
      for (const [stepId, override] of Object.entries(option.stepOverrides)) {
        mergedOverrides[stepId] = { ...mergedOverrides[stepId], ...override };
      }
    }
  }

  const effectiveTotalWater = Math.round(totalWater * hotWaterRatio);
  const iceGrams = totalWater - effectiveTotalWater;

  const steps: BrewStep[] = template.stepTemplates.map((tmpl) => {
    const effective = mergedOverrides[tmpl.id]
      ? { ...tmpl, ...mergedOverrides[tmpl.id] }
      : tmpl;

    const pourAmount = Math.round(effectiveTotalWater * effective.pourRatio);
    const prevCumulative = cumulative;
    cumulative += pourAmount;

    let instruction = effective.instruction;
    if (effective.multiPourCount && effective.multiPourCount > 1 && pourAmount > 0) {
      const perPour = pourAmount / effective.multiPourCount;
      const targets = Array.from({ length: effective.multiPourCount }, (_, i) =>
        Math.round(prevCumulative + perPour * (i + 1)),
      );
      instruction = `${instruction ?? ''}　目標: ${targets.join('g → ')}g`;
    }

    return {
      id: effective.id,
      label: effective.label,
      startTime: effective.startTime,
      endTime: effective.endTime,
      pourAmount,
      cumulativeAmount: cumulative,
      instruction,
    };
  });

  return {
    id: template.id,
    name: template.name,
    ratio: template.ratio,
    steps,
    isDefault: template.isDefault,
    memo: template.memo,
    ...(iceGrams > 0 ? { iceGrams } : {}),
  };
}
