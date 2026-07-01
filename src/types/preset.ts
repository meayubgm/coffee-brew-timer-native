export type BrewStep = {
  id: string;
  label: string;
  startTime: number;
  endTime: number;
  pourAmount: number;
  cumulativeAmount: number;
  instruction?: string;
};

export type BrewPreset = {
  id: string;
  name: string;
  ratio: number;
  steps: BrewStep[];
  isDefault: boolean;
  memo?: string;
  iceGrams?: number;  // アイス時の氷量（g）。0またはundefinedはホット
};

export type BrewStepTemplate = {
  id: string;
  label: string;
  startTime: number;
  endTime: number;
  pourRatio: number;
  instruction?: string;
  multiPourCount?: number;
};

export type BrewPresetOption = {
  id: string;
  label: string;
  stepOverrides: Record<string, Partial<BrewStepTemplate>>;
  hotWaterRatio?: number;  // 総湯量に対するお湯の割合（0〜1）。アイスは0.5、未指定は1
};

// 独立して選択できるオプショングループ（例: 味わい / 回数）
export type BrewPresetOptionGroup = {
  id: string;
  label: string;
  description?: string;
  defaultOptionId: string;
  options: BrewPresetOption[];
};

export type BrewPresetTemplate = {
  id: string;
  name: string;
  ratio: number;
  stepTemplates: BrewStepTemplate[];
  isDefault: boolean;
  memo?: string;
  optionGroups?: BrewPresetOptionGroup[];
};
