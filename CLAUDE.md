# Coffee Brewing Timer App — CLAUDE.md

このファイルはプロジェクト全体の仕様・設計方針をまとめたものです。
Claude Codeはセッション開始時にこのファイルを参照してください。

---

## プロジェクト概要

コーヒーの抽出メソッドに応じたステップタイマーアプリ。
豆の量・人数を入力すると最適な湯量を自動計算し、各ステップのタイミングでアラームを鳴らしながら抽出をガイドする。

**ターゲットプラットフォーム:** iOS / Android（React Native）  
**MVP方針:** まずWebアプリ（React）でプロトタイプを作成し、動作確認後にReact Nativeへ移植する

---

## 技術スタック

| レイヤー | 技術 |
|---|---|
| フロントエンド（Web） | React + TypeScript + Vite |
| フロントエンド（Mobile） | React Native（Expo） |
| 状態管理 | Zustand |
| ローカル永続化 | localStorage（Web） / AsyncStorage（Mobile） |
| スタイリング | Tailwind CSS（Web） / NativeWind（Mobile） |
| テスト | Vitest + React Testing Library |

---

## ディレクトリ構成

```
src/
  components/       # 再利用可能なUIコンポーネント
  screens/          # 画面単位のコンポーネント
    HomeScreen      # メソッド選択・豆量入力
    TimerScreen     # タイマー・ステップガイド
    PresetsScreen   # プリセット管理
  stores/           # Zustandストア
    timerStore.ts
    presetStore.ts
  types/            # TypeScript型定義
    preset.ts
    step.ts
  utils/            # 計算ロジック
    waterCalc.ts    # 湯量計算
    stepBuilder.ts  # ステップ生成
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

> **実装メモ:** デフォルトプリセットは `BrewPresetTemplate` として定数定義し、`buildPresetFromTemplate(template, beansGrams, selectedGroupOptionIds?)` で全グループのオーバーライドをマージして `BrewPreset` に変換する。`selectedGroupOptionIds` は `Record<groupId, optionId>`。カスタムプリセットは `BrewPreset`（固定g数）として localStorage に保存する。

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
- 選択中オプションは `presetStore` の `selectedOptionIds`（`Record<presetId, Record<groupId, optionId>>`）で管理し localStorage に永続化

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
  - 音: Web Audio API（`AudioContext`）による880Hzサイン波ビープ
- **画面常時点灯:** タイマー実行中はスリープ抑制（モバイル）

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

3. **PresetsScreen（プリセット管理）**
   - プリセット一覧
   - 追加 / 編集 / 削除 / 複製
   - デフォルトプリセットは編集・削除ボタンを非表示

### デザイン方針
- **カラーテーマ:** ダークモード（コーヒーブラウン × アンバー）
- **フォント:** 数字は等幅（DM Mono等）、本文はシステムフォント
- ライトモードも将来的に対応予定

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

1. **Phase 1 (Web MVP):** React + Vite でコア機能を実装
   - デフォルト4プリセット
   - タイマー機能（カウントアップ + アラーム）
   - 湯量計算
   - カスタムプリセット作成・保存（localStorage）

2. **Phase 2:** UI/UXブラッシュアップ・テスト追加

3. **Phase 3:** React Native（Expo）へ移植
