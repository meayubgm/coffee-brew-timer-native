# セッションサマリー: Web版（Vercel）公開の可否とデータ永続化の確認

- 日時: 2026-07-16 18:56
- プロジェクト: coffee-brew-timer-native（/Users/meayu/development/coffee-brew-timer-native）

## 目的

React Native（Expo）で開発した本アプリの Web版を Vercel 等で公開できるかを確認する。
あわせて、カスタムプリセット機能のデータ保存先と、Web版で AsyncStorage が問題なく動作するかを確認する。

## 実施内容

コード変更は行わず、既存実装の調査と質問への回答のみを実施した。

### 1. Web版公開の可否調査

- `package.json` / `app.json` / `Makefile` を確認。
- `react-native-web` が依存に含まれ、`expo-router` 構成であることを確認。
- 結論: `expo export --platform web` で静的サイト（`dist/`）を書き出し、Vercel 等にデプロイ可能。
- 公開に向けた準備として以下を案内（未適用・提案のみ）:
  - `app.json` の `expo` に `"web": { "bundler": "metro", "output": "static" }` を追加
  - ローカル確認: `npx expo export --platform web` → `npx serve dist`
  - Vercel 設定: Build Command `npx expo export --platform web` / Output Directory `dist` / SPA rewrite 用の `vercel.json`
- Web で挙動が変わりうる箇所を注意点として提示: `expo-audio`、`expo-keep-awake`、`expo-haptics`、`expo-file-system`。

### 2. データ永続化の調査

- `src/stores/presetStore.ts` を確認。
  - Zustand の `persist` ミドルウェア + `createJSONStorage(() => AsyncStorage)` でカスタムプリセット等を保存（`presetStore.ts:113`）。
  - `partialize` で保存対象は `customPresets` / `selectedTemplateId` / `selectedOptionIds` / `beansGrams` / `servings` / `inputMode`。
- `src/theme/ThemeContext.tsx` でもテーマ設定を AsyncStorage に保存していることを確認。
- 結論: `@react-native-async-storage/async-storage` は Web（react-native-web）環境では自動的に `localStorage` をバックエンドに使うため、Web版でもカスタムプリセット機能はそのまま正常動作する。
- 注意点として提示: localStorage の容量上限（約5MB、実用上問題なし）、保存はブラウザ・端末ローカル限定でクラウド同期は未実装。

## 主な決定事項

- 現時点ではコード変更・設定変更は行わず、調査結果の共有にとどめた（実装着手は次回以降）。

## 未完了・残タスク

- `app.json` への `web`（bundler/output）設定追加は未適用（提案のみ）。
- `expo export --platform web` によるローカルビルド確認、および「プリセット追加 → リロード → データ保持」の実機確認は未実施。
- Vercel へのデプロイ設定（`vercel.json` の SPA rewrite 等）は未着手。
- 参考: README「起動コマンド」に記載の `make start-c` は Makefile 上に存在せず（実際は `restart` / `start` / `start-tunnel`）。本セッションと無関係な既存の不整合のため未修正。次回対応候補として記載。

## 動作確認の状況

- コード変更なしのため、テスト・ビルド実行は未実施。
- 調査は該当ソース（`presetStore.ts` / `ThemeContext.tsx` / `package.json` / `app.json`）の内容確認により裏付け済み。
