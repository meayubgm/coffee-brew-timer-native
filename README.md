# Coffee Brew Timer

コーヒーの抽出メソッドに応じたステップタイマーアプリ。  
豆の量・人数を入力すると最適な湯量を自動計算し、各ステップのタイミングでアラームを鳴らしながら抽出をガイドする。

---

## 技術スタック

| レイヤー | 技術 |
|---|---|
| フロントエンド（Mobile） | React Native（Expo SDK 56） |
| ルーティング | Expo Router v4 |
| 状態管理 | Zustand |
| ローカル永続化 | AsyncStorage |
| スタイリング | NativeWind v4（Tailwind CSS） |
| 音声 | expo-audio + expo-file-system（WAV生成・再生） |
| ハプティクス | expo-haptics |
| テーマ管理 | React Context（light / dark / system） |

---

## ディレクトリ構成

```
app/
  _layout.tsx        # ルートレイアウト（ThemeProvider / SafeAreaProvider）
  index.tsx          # HomeScreen（メソッド選択・豆量入力・タイマー開始）
  timer.tsx          # TimerScreen（カウントアップ・ステップガイド・アラーム）
  presets.tsx        # PresetsScreen（プリセット一覧・カスタム作成・編集）

src/
  components/
    ThemeToggle.tsx  # ライト/ダーク/自動 切替ボタン
  constants/
    defaultPresets.ts  # デフォルト4プリセットのテンプレート定義
  stores/
    timerStore.ts    # タイマー状態（経過時間・ステップ・アラーム）
    presetStore.ts   # プリセット選択・豆量・カスタムプリセット永続化
  theme/
    ThemeContext.tsx  # テーマ設定管理（AsyncStorage 永続化）
  types/
    preset.ts        # BrewStep / BrewPreset / BrewPresetTemplate 等の型定義
  utils/
    waterCalc.ts     # 湯量計算ロジック
    stepBuilder.ts   # テンプレート → BrewPreset 変換（optionGroup オーバーライド含む）
    sound.ts         # 880Hz ビープ音生成・再生（expo-audio）
```

---

## デフォルトプリセット

| メソッド | 比率 | 特徴 |
|---|---|---|
| 4:6メソッド | 1:15 | 風味バランス（甘味/普通/酸味）、ボディ（普通/軽め）をオプション選択 |
| 浸漬式 | 1:15 | Clever / Switch ドリッパー向け。注湯→攪拌→浸漬→抽出 |
| エアロプレス | 1:12 | 注湯→攪拌→浸漬→プレス |
| フレンチプレス | 1:16 | 注湯→浸漬→プランジャー |

---

## 開発環境のセットアップ

```bash
npm install
```

---

## 起動コマンド

```bash
# 通常起動（Expo Go）
make start

# キャッシュクリアして起動（エラー時に使う）
make restart

# トンネルモード（別ネットワークのAndroid実機で確認する場合）
make start-tunnel
```

Android実機での確認には [Expo Go](https://expo.dev/go) アプリが必要。

---

## カラーテーマ

テラコッタベースのライト / ダーク 2セット対応。  
詳細は `docs/THEME_DESIGN.md` を参照。

| トークン | ライト | ダーク |
|---|---|---|
| bg | `#f7ece5` | `#120c0a` |
| surface | `#fffcf9` | `#201511` |
| border | `#eddcd1` | `#34221c` |
| text | `#301d15` | `#ece0d8` |
| muted | `#9c8074` | `#9c8579` |
| accent | `#b5512f` | `#cc6a45` |

---

## 開発フェーズ

- [x] **Phase 1 – Web MVP:** React（Vite）でコア機能をプロトタイプ
- [x] **Phase 2 – React Native 移植:** Expo Router + NativeWind で Mobile 版実装
- [ ] **Phase 3 – UI/UX ブラッシュアップ・テスト追加**
- [ ] **Phase 4 – Apple Watch / Wear OS 連携・クラウド同期（検討中）**
