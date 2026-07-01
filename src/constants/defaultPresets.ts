import { BrewPresetTemplate } from '../types/preset';

export const DEFAULT_PRESETS: BrewPresetTemplate[] = [
  {
    id: 'preset-46method',
    name: '4:6メソッド',
    ratio: 15,
    isDefault: true,
    memo: 'Tetsu Kasuya式。前半40%で酸味、後半60%で甘み・濃度を調整。',
    stepTemplates: [
      {
        id: 'step-46-1',
        label: '1投目',
        startTime: 0,
        endTime: 30,
        pourRatio: 0.2,  // 全体の40%の前半（40%÷2）
        instruction: '酸味調整。ゆっくり円を描くように注ぐ',
      },
      {
        id: 'step-46-2',
        label: '2投目',
        startTime: 30,
        endTime: 90,
        pourRatio: 0.2,  // 全体の40%の後半
        instruction: '甘み調整。前投目と同量を注ぐ',
      },
      {
        id: 'step-46-3to5',
        label: '3〜5投目',
        startTime: 90,
        endTime: 210,
        pourRatio: 0.6,  // 全体の60%（optionGroupsで回数・味わいを調整）
      },
    ],
    optionGroups: [
      {
        id: 'taste',
        label: '風味バランス',
        description: '1投目の湯量が変わります',
        defaultOptionId: 'balanced',
        options: [
          {
            id: 'sweet',
            label: '甘味',
            stepOverrides: {
              'step-46-1': { pourRatio: 2 / 15 },  // 1/3減（例: 30g→60g）
              'step-46-2': { pourRatio: 4 / 15 },  // 2投目で40%累計に補正（例: 30g→120g）
            },
          },
          {
            id: 'balanced',
            label: '普通',
            stepOverrides: {},
          },
          {
            id: 'acidic',
            label: '酸味',
            stepOverrides: {
              'step-46-1': { pourRatio: 4 / 15 },  // 1/3増（例: 30g→120g）
              'step-46-2': { pourRatio: 2 / 15 },  // 2投目で40%累計に補正（例: 30g→60g）
            },
          },
        ],
      },
      {
        id: 'pourCount',
        label: 'ボディ',
        description: '3投目以降の注湯回数が変わります',
        defaultOptionId: 'normal',
        options: [
          {
            id: 'normal',
            label: '普通',
            stepOverrides: {
              'step-46-3to5': {
                multiPourCount: 3,
                instruction: '濃度調整。お湯が落ち切ったら次を注ぐ（3:30までに3回注ぎきる）',
              },
            },
          },
          {
            id: 'light',
            label: '軽め',
            stepOverrides: {
              'step-46-3to5': {
                multiPourCount: 2,
                instruction: '濃度調整。お湯が落ち切ったら次を注ぐ（3:30までに2回注ぎきる）',
              },
            },
          },
        ],
      },
      {
        id: 'temperature',
        label: '温度',
        description: 'アイスは湯量が半分になり、残り半分が氷になります',
        defaultOptionId: 'hot',
        options: [
          {
            id: 'hot',
            label: 'ホット',
            stepOverrides: {},
          },
          {
            id: 'ice',
            label: 'アイス',
            hotWaterRatio: 0.5,
            stepOverrides: {},
          },
        ],
      },
    ],
  },
  {
    id: 'preset-immersion',
    name: '浸漬式',
    ratio: 15,
    isDefault: true,
    memo: 'Clever / Switch ドリッパー向け。バルブを閉じて全量浸漬。',
    stepTemplates: [
      {
        id: 'step-imm-1',
        label: '注湯',
        startTime: 0,
        endTime: 30,
        pourRatio: 1.0,  // 全量を注ぐ
        instruction: '全量を30秒以内に注ぐ（バルブ閉）',
      },
      {
        id: 'step-imm-2',
        label: '攪拌',
        startTime: 30,
        endTime: 60,
        pourRatio: 0,
        instruction: 'スプーンで4回ゆっくり回転',
      },
      {
        id: 'step-imm-3',
        label: '浸漬',
        startTime: 60,
        endTime: 210,
        pourRatio: 0,
        instruction: 'バルブを閉じたまま待機',
      },
      {
        id: 'step-imm-4',
        label: '抽出',
        startTime: 210,
        endTime: 300,
        pourRatio: 0,
        instruction: 'バルブを開放してカップに落とし切る',
      },
    ],
    optionGroups: [
      {
        id: 'temperature',
        label: '温度',
        description: 'アイスは湯量が半分になり、残り半分が氷になります',
        defaultOptionId: 'hot',
        options: [
          {
            id: 'hot',
            label: 'ホット',
            stepOverrides: {},
          },
          {
            id: 'ice',
            label: 'アイス',
            hotWaterRatio: 0.5,
            stepOverrides: {},
          },
        ],
      },
    ],
  },
  {
    id: 'preset-aeropress',
    name: 'エアロプレス',
    ratio: 12,
    isDefault: true,
    memo: 'スタンダードレシピ。プレス時は安定した力で押す。',
    stepTemplates: [
      {
        id: 'step-aero-1',
        label: '注湯',
        startTime: 0,
        endTime: 30,
        pourRatio: 1.0,
        instruction: '全量を30秒以内に注ぐ',
      },
      {
        id: 'step-aero-2',
        label: '攪拌',
        startTime: 30,
        endTime: 60,
        pourRatio: 0,
        instruction: '10回ほどしっかり攪拌',
      },
      {
        id: 'step-aero-3',
        label: '浸漬',
        startTime: 60,
        endTime: 120,
        pourRatio: 0,
        instruction: 'キャップを装着して待機',
      },
      {
        id: 'step-aero-4',
        label: 'プレス',
        startTime: 120,
        endTime: 150,
        pourRatio: 0,
        instruction: '安定した力で30秒かけてゆっくり押す',
      },
    ],
  },
  {
    id: 'preset-french-press',
    name: 'フレンチプレス',
    ratio: 16,
    isDefault: true,
    memo: '粗挽き推奨。プランジャーはゆっくり押す。',
    stepTemplates: [
      {
        id: 'step-fp-1',
        label: '注湯',
        startTime: 0,
        endTime: 30,
        pourRatio: 1.0,
        instruction: '全量を均一に注ぐ',
      },
      {
        id: 'step-fp-2',
        label: '浸漬',
        startTime: 30,
        endTime: 270,
        pourRatio: 0,
        instruction: '蓋を置いて（押さずに）4分待機',
      },
      {
        id: 'step-fp-3',
        label: 'プランジャー',
        startTime: 270,
        endTime: 300,
        pourRatio: 0,
        instruction: 'プランジャーをゆっくり押し下げる',
      },
    ],
  },
];
