# Coffee Brewing Timer App — CLAUDE.md

このファイルはプロジェクト全体の仕様・設計方針をまとめたものです。
Claude Codeはセッション開始時にこのファイルを参照してください。

---

## プロジェクト概要

コーヒーの抽出メソッドに応じたステップタイマーアプリ。
豆の量・人数を入力すると最適な湯量を自動計算し、各ステップのタイミングでアラームを鳴らしながら抽出をガイドする。

**ターゲットプラットフォーム:** iOS / Android / Web（React Native + Expo、react-native-web で Web も配信）  
**開発経緯:** Web MVP（React/Vite）でプロトタイプ後、Expo（React Native）へ移植済み。現在は単一の Expo コードベースで iOS / Android / Web を賄う。

---

## 技術スタック

| レイヤー | 技術 |
|---|---|
| フレームワーク | React Native（Expo SDK 56） |
| ルーティング | Expo Router v4（`app/` ディレクトリ） |
| 状態管理 | Zustand（`persist` ミドルウェアで永続化） |
| ローカル永続化 | AsyncStorage（Web も含め全プラットフォーム共通） |
| スタイリング | NativeWind v4（Tailwind CSS 記法・`global.css` の CSS 変数でテーマ管理） |
| 音声 | Web=Web Audio API / ネイティブ=expo-audio＋動的WAV生成 |
| テーマ管理 | React Context（light / dark / system、AsyncStorage 永続化） |

> テストランナーは未導入（旧仕様の Vitest は使用していない）。型安全性は `tsc --noEmit` で担保。

---

## ディレクトリ構成

```
app/                # Expo Router の画面（ファイルベースルーティング）
  _layout.tsx       # ルートレイアウト（ThemeProvider / SafeAreaProvider）
  index.tsx         # HomeScreen（メソッド選択・豆量/人数入力・味わいオプション・開始）
  timer.tsx         # TimerScreen（カウントアップ・ステップガイド・アラーム）
  settings.tsx      # SettingScreen（プリセット一覧・カスタム作成/編集/複製/削除・外観設定）

src/
  components/
    ThemeToggle.tsx # ライト/ダーク/自動 切替
  stores/           # Zustandストア
    timerStore.ts
    presetStore.ts
  theme/
    ThemeContext.tsx # テーマ設定管理（AsyncStorage 永続化）
    colors.ts        # className で扱えない色実値（gutter/placeholder）と共通コンテナクラス
  types/            # TypeScript型定義
    preset.ts       # BrewStep / BrewPreset / BrewStepTemplate 等を集約
  utils/            # ロジック・ユーティリティ
    waterCalc.ts    # 湯量計算
    stepBuilder.ts  # テンプレート → BrewPreset 変換（optionGroup オーバーライド）
    sound.ts        # ビープ音生成・再生
    format.ts       # 時間整形（fmtTime）・等幅フォント定数
  constants/
    defaultPresets.ts  # デフォルトプリセット定義
```

---

## データ型定義

```typescript
// 1ステップの定義（実行時・カスタムプリセット保存用）
type BrewStep = {
  id: string;
  label: string;          // 例: "1投目 (酸味調整)"
  startTime: number;      // 秒
  endTime: number;        // 秒
  pourAmount: number;     // このステップで注ぐ量 (g)
  cumulativeAmount: number; // 累計注湯量 (g) ── UI上の「スケール目標」として表示
  instruction?: string;   // 追加ガイドテキスト
};

// プリセット定義（実行時・カスタムプリセット保存用）
type BrewPreset = {
  id: string;
  name: string;
  ratio: number;          // 湯量倍率 例: 15 (豆1gに対し15g)
  steps: BrewStep[];
  isDefault: boolean;     // trueの場合は編集不可
  memo?: string;
};

// ステップテンプレート（デフォルトプリセット定義用。豆量に依存しない割合で保持）
type BrewStepTemplate = {
  id: string;
  label: string;
  startTime: number;      // 秒
  endTime: number;        // 秒
  pourRatio: number;      // 総湯量に対する割合（0〜1）。注湯なしのステップは 0
  instruction?: string;
  multiPourCount?: number; // 複数回に分けて注ぐ回数。指定時は各注湯の累計目標をinstructionに付加
};

// プリセットオプション（同一プリセット内でステップ設定を切り替える）
type BrewPresetOption = {
  id: string;
  label: string;                                        // 例: "普通", "軽め"
  stepOverrides: Record<string, Partial<BrewStepTemplate>>;  // stepId → 上書き内容
};

// オプショングループ（独立して選択できる軸、例: 風味バランス / ボディ）
type BrewPresetOptionGroup = {
  id: string;
  label: string;       // 例: "風味バランス", "ボディ"
  description?: string; // 例: "1投目の湯量が変わります"
  defaultOptionId: string;
  options: BrewPresetOption[];
};

// プリセットテンプレート（デフォルトプリセット定義用）
type BrewPresetTemplate = {
  id: string;
  name: string;
  ratio: number;
  stepTemplates: BrewStepTemplate[];
  isDefault: boolean;
  memo?: string;
  optionGroups?: BrewPresetOptionGroup[];
};
```

> **実装メモ:** デフォルトプリセットは `BrewPresetTemplate` として定数定義し、`buildPresetFromTemplate(template, beansGrams, selectedGroupOptionIds?)` で全グループのオーバーライドをマージして `BrewPreset` に変換する。`selectedGroupOptionIds` は `Record<groupId, optionId>`。カスタムプリセットは `BrewPreset`（固定g数）として AsyncStorage に保存する。

---

## デフォルトプリセット仕様

### 4:6メソッド（ペーパードリップ）
- **比率:** 豆:湯 = 1:15
- **ステップ:**

| # | 開始 | 終了 | 注湯割合 | メモ |
|---|---|---|---|---|
| 1投目 | 0:00 | 0:30 | 全体の40%の前半 | 酸味調整 |
| 2投目 | 0:30 | 1:30 | 全体の40%の後半 | 甘み調整 |
| 3〜5投目 | 1:30 | 3:30 | 全体の60% | 濃度調整。お湯が落ち切ったら次を注ぐ（オプションで回数選択） |

> **3〜5投目の注ぎ方:** 時間で区切らず、お湯が落ち切るたびに均等に注ぐ。3:30 までに注ぎきる。

**「味わい」セクション（HomeScreen）の設定グループ:**

#### 風味バランス（説明: 1投目の湯量が変わります）
2投目の累計は味わい選択に関わらず常に総湯量の40%で固定。

| 選択肢 | 1投目 pourRatio | 2投目 pourRatio | 豆量30gの場合 |
|---|---|---|---|
| 甘味 | 2/15 | 4/15 | 1投目 60g → 2投目 180g |
| 普通（デフォルト） | 0.2 | 0.2 | 1投目 90g → 2投目 180g |
| 酸味 | 4/15 | 2/15 | 1投目 120g → 2投目 180g |

#### ボディ（説明: 3投目以降の注湯回数が変わります）

| 選択肢 | 回数 | 豆量30gの場合の目標 |
|---|---|---|
| 普通（デフォルト） | 3回 | 270g → 360g → 450g |
| 軽め | 2回 | 315g → 450g |

- 各注湯の累計目標は `buildPresetFromTemplate` がビルド時に `instruction` へ動的に付加する
- 選択中オプションは `presetStore` の `selectedOptionIds`（`Record<presetId, Record<groupId, optionId>>`）で管理し AsyncStorage に永続化

#### 温度（説明: アイスは湯量が半分になり、残り半分が氷になります）

4:6メソッド・浸漬式に共通の温度オプション（`defaultPresets.ts` の `TEMPERATURE_OPTION_GROUP` を共有）。

| 選択肢 | hotWaterRatio | 挙動 |
|---|---|---|
| ホット（デフォルト） | 1（未指定） | 総湯量をすべてお湯で注ぐ |
| アイス | 0.5 | お湯を総湯量の半分にし、残り半分を氷で補う |

- `buildPresetFromTemplate` は `hotWaterRatio` で `effectiveTotalWater = round(totalWater × hotWaterRatio)` を算出し、各ステップの注湯量に反映。氷量 `iceGrams = totalWater − effectiveTotalWater` を（>0 のときのみ）`BrewPreset.iceGrams` に付与
- HomeScreen の計算結果は `iceGrams > 0` のとき「湯量」と「氷」を分けて表示

### 浸漬式ドリッパー（Clever / Switch）
- **比率:** 豆:湯 = 1:15
- **ステップ:**

| # | 開始 | 終了 | 内容 |
|---|---|---|---|
| 注湯 | 0:00 | 0:30 | 全量を注ぐ |
| 攪拌 | 0:30 | 1:00 | スプーンで4回転 |
| 浸漬 | 1:00 | 3:30 | 待機（バルブ閉） |
| 抽出 | 3:30 | 5:00 | バルブ開放・落とし切り |

### エアロプレス（スタンダード）
- **比率:** 豆:湯 = 1:12
- **ステップ:** 注湯(0:00-0:30) → 攪拌(0:30-1:00) → 浸漬(1:00-2:00) → プレス(2:00-2:30)

### フレンチプレス
- **比率:** 豆:湯 = 1:16
- **ステップ:** 注湯(0:00-0:30) → 浸漬(0:30-4:30) → プランジャー(4:30-5:00)

> **注意:** デフォルトプリセットは `isDefault: true` とし、編集・削除不可。複製して編集のみ可能。

---

## 湯量計算ロジック

```
// 人数指定の場合
豆量(g) = 人数 × 15g（デフォルト、変更可）
総湯量(g) = 豆量(g) × ratio

// 豆量直接指定の場合
総湯量(g) = 豆量(g) × ratio
```

各ステップの注湯量は `総湯量 × ステップの割合(%)` で計算する。

---

## タイマー機能仕様

- **方式:** カウントアップ（0秒スタート）
- **操作:** 開始 / 一時停止 / リセット
- **アラーム:** 各ステップ開始タイミングで発火（タイマー開始時は1投目のアラームを即座に表示）
  - 表示:
    - メイン: `cumulativeAmount`（スケール目標）── スケールで確認すべき累計値
    - サブ: `+pourAmount`g（このステップ）── 2投目以降のみ表示
    - 次のステップ名と残り秒数
  - 音: 880Hzサイン波ビープ。Web は Web Audio API（`AudioContext`）で直接合成、ネイティブは expo-audio で動的生成した WAV を再生（`src/utils/sound.ts`）。ネイティブでは expo-haptics による触覚フィードバックも併発
- **画面常時点灯:** タイマー実行中はスリープ抑制（expo-keep-awake、Web は wake lock 未対応時に握りつぶし）

---

## UI/UX 仕様

### 画面構成

1. **HomeScreen（メソッド選択・設定）**
   - プリセット一覧からメソッドを選択
   - 人数 or 豆量をインプット
   - 算出された総湯量・比率を表示
   - **「味わい」セクション**（選択中プリセットに `optionGroups` がある場合のみ表示）
     - 各グループをラベル＋説明文＋選択ボタンで横並び表示
     - 例: 風味バランス（甘味/普通/酸味）、ボディ（普通/軽め）
   - 「開始」ボタンでTimerScreenへ遷移

2. **TimerScreen（タイマー）**
   - 大きなカウントアップ表示
   - 現在のステップ名・注湯量ガイド
   - 進捗バー（ステップ境界を表示）
   - 全ステップのリスト（完了/現在/未来を色分け）
   - アラームオーバーレイ（タップで解除）

3. **SettingScreen（プリセット管理・外観設定、`app/settings.tsx`）**
   - プリセット一覧
   - 追加 / 編集 / 削除 / 複製
   - デフォルトプリセットは複製のみ可（編集・削除ボタンは非表示）
   - 外観（ライト / ダーク / 自動）の切替（ThemeToggle）

### デザイン方針
- **カラーテーマ:** テラコッタ基調のライト / ダーク 2セットを実装済み（`global.css` の CSS 変数＋NativeWind トークン、システム追従に対応）。詳細は `docs/THEME_DESIGN.md`
- **フォント:** 数字は等幅（`MONO_FONT_FAMILY`: iOS=Courier New / その他=monospace）、本文はシステムフォント

---

## カスタムプリセット仕様

ユーザーが自由に作成・保存できるプリセット。

| 設定項目 | 内容 |
|---|---|
| プリセット名 | 任意の文字列（必須） |
| 豆:湯 比率 | 例: 15（1:15） |
| ステップ数 | 1〜10ステップ |
| 各ステップの開始時間 | 秒単位 |
| 各ステップの注湯割合 | 全体の%、または固定g数 |
| メモ | 豆の種類・挽き目など自由記述（任意） |

- ローカルに保存（将来的にクラウド同期も検討）

---

## 将来的な拡張候補（MVPには含めない）

- 抽出ログの記録（酸味・甘み・苦みのメモ）
- グラインダー設定・豆の銘柄との紐付け
- タイマー進行中のアニメーション（注湯イメージ）
- Apple Watch / Wear OS 連携
- レシピのSNSシェア機能
- クラウド同期

---

## 開発の進め方

- [x] **Phase 1 (Web MVP):** React + Vite でコア機能をプロトタイプ（デフォルト4プリセット・タイマー・湯量計算・カスタムプリセット保存）
- [x] **Phase 2:** Expo（React Native）へ移植。Expo Router + NativeWind + AsyncStorage で iOS / Android / Web を単一コードベース化。ライト/ダークテーマ・温度（ホット/アイス）オプションを追加
- [ ] **Phase 3:** UI/UXブラッシュアップ・テスト追加・Web公開
- [ ] **Phase 4:** Apple Watch / Wear OS 連携・クラウド同期（検討中）
