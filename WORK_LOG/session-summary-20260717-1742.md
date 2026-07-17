# セッションサマリー: Web版のVercelデプロイ（手動・無料サブドメインで公開）

- 日時: 2026-07-17 17:42
- プロジェクト: coffee-brew-timer-native（/Users/meayu/development/coffee-brew-timer-native）

## 目的

Web版（Expo Web, `output: "single"` = SPA）を初めて外部公開する。前回セッションで
`public/index.html` に `lang="ja"` / `noindex, nofollow` を適用済みのため、その成果物を
実際にホスティングしてURLでアクセスできる状態にする。

方針（ユーザー確認済み）:
- ホスティング先: **Vercel**
- 自動化: **まず手動デプロイ**（CLIトリガー、GitHub連携の自動デプロイは入れない）
- ドメイン: **まずは無料サブドメイン**（`*.vercel.app`）

## 実施内容

### 追加・変更ファイル
- **`vercel.json`（新規）** — Vercelクラウド側のビルドとSPAルーティングを定義。
  - `buildCommand: "expo export --platform web"` / `outputDirectory: "dist"`
  - `rewrites: [{ "source": "/(.*)", "destination": "/" }]` — 全パスを `/`（index.html）へ
    フォールバック。`/timer` 等のディープリンク直アクセス・リロード時の404を防ぐ。
- **`package.json`** — `scripts` に `"build:web": "expo export --platform web"` を1行追加。
- **`README.md`** — 「Web版デプロイ」節を新設（Vercel手動デプロイ手順・URL・noindex中である旨）。

### デプロイ実行
- `npx vercel login`（デバイス認証フロー）でログイン完了。ユーザー: `meayubgm`。
- `npx vercel --yes` を**ユーザーがセッション内（`!`実行）で実行**し、新規プロジェクト
  `meayubgms-projects/coffee-brew-timer-native` を作成、Vercelクラウドでビルド→**本番公開まで完了**。
  - 本番URL（クリーンエイリアス）: **https://coffee-brew-timer-native.vercel.app**
  - 生成URL: https://coffee-brew-timer-native-9ijf1d4qc-meayubgms-projects.vercel.app
  - デプロイ時にGitHubリポジトリへの自動接続を試みて失敗（`Failed to connect...`）したが、
    **連携しない方針のため問題なし**。以降のデプロイは `npx vercel --prod` の手動実行。

> 補足: `npx vercel --yes`（Claude Code経由）は自動モード分類で拒否されたため、ユーザーが
> `! npx vercel --yes` としてセッション内で実行した。

## 主な決定事項

- **手動デプロイ運用**を採用し、GitHub連携の自動デプロイは今回入れない（将来のCI化は別途）。
- SPA（`output: "single"`）のため `vercel.json` の rewrite が必須と判断し設定。
- ホスティングはVercel、当面は無料サブドメイン。独自ドメイン・noindex解除は正式公開時に別途判断。

## 未完了・残タスク

- **独自ドメイン割当・DNS設定**（今回はスコープ外）。
- **noindex解除**（正式公開のタイミングで `public/index.html` の robots メタを外す）。
- **GitHub連携によるpush自動デプロイ化**（将来CI化する場合）。
- iOS/Androidのストア配信（EAS）。

## 動作確認の状況

- `npx tsc --noEmit`: エラー0。
- `npx expo export --platform web --clear`: 成功（`dist/` 生成、web bundle 2ファイル）。
- 本番URLをPlaywright MCPで検証（すべて合格）:
  - HomeScreen正常表示（メソッド選択・味わい・ステップ一覧）。
  - 「タイマー開始」→ `/timer` へ遷移。
  - **`/timer` を直接リロードしても404にならず表示・タイマー稼働**（rewrite成立を実証）。
  - `document.documentElement.lang === "ja"`、robots meta === `"noindex, nofollow"` を実測確認。
  - コンソール: エラー0。警告2件は `AudioContext was not allowed to start`（ブラウザ自動再生
    ポリシー由来の想定内挙動でバグではない）。
