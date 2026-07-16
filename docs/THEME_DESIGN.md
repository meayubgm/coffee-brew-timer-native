# テラコッタ・テーマ — ライト/ダーク 2セット実装（統合版）

アップロードいただいた現行ファイル（`darkMode: 'class'` 追加済み / `SafeAreaProvider` 構成）に合わせてマージした差分一式です。アクセントはテラコッタ（素焼きのレンガ色）。

## 仕組み

色の実値を `global.css` の **CSS 変数**に移し、`tailwind.config.js` はトークン名 → 変数のマッピングだけにします。NativeWind v4 の `useColorScheme().setColorScheme()` が root に `.dark` を付け外しするので、

- **画面側の className（`bg-coffee-bg`, `text-coffee-text`, `bg-coffee-accent/10` …）は変更不要**
- システム外観に**自動追従** ＋ 設定での**手動トグル（ライト/ダーク/自動）**
- 選択は AsyncStorage に永続化

`rgb(var(--token) / <alpha-value>)` 方式なので `/10` `/40` の透明度付きクラスもそのまま効きます。

## 現行からの変更点

- **`tailwind.config.js`** … `coffee` の各値を `#xxxxxx` → `rgb(var(--coffee-*) / <alpha-value>)` に。`darkMode: 'class'` は既存のまま。`on-accent` トークンを追加（任意）。
- **`global.css`** … `@layer base` に `:root`（ライト）/`.dark`（ダーク）の変数定義を追加。
- **`app/_layout.tsx`** … `SafeAreaProvider` を保持しつつ `ThemeProvider` で外側を包み、`StatusBar` を `resolved` に連動。`Stack` の `contentStyle` のハードコード `#0e0b08` を `transparent` に（背景は `bg-coffee-bg` が描画）。
- **新規** … `src/theme/ThemeContext.tsx`, `src/components/ThemeToggle.tsx`。

## 配色値（テラコッタ）

| トークン | ライト | ダーク |
|---|---|---|
| bg | `#f7ece5` | `#120c0a` |
| surface | `#fffcf9` | `#201511` |
| border | `#eddcd1` | `#34221c` |
| text | `#301d15` | `#ece0d8` |
| muted | `#9c8074` | `#9c8579` |
| accent | `#b5512f` | `#cc6a45` |
| accent-dark | `#933f24` | `#a4502f` |
| accent-light | `#d4734d` | `#e28b65` |
| on-accent | `#ffffff` | `#ffffff` |

ライトのアクセントはコントラスト確保のため一段濃いめ、ダークは暗背景で映えるよう明るめ。

## 適用手順

1. `tailwind.config.js` を置換。
2. `global.css` を置換。
3. `app/_layout.tsx` を置換（または差分を反映）。
4. `src/theme/ThemeContext.tsx` を追加。
5. 設定画面に `<ThemeToggle />` を配置。
6. 依存追加: `npx expo install @react-native-async-storage/async-storage`
7. Metro キャッシュをクリアして再起動: `npx expo start -c`（tailwind/CSS 変数の反映に確実）。

## 補足

- StatusBar が常に `style="light"` だったのを `resolved` 連動に変えています。ライト時に文字が見えなくなるのを防ぐためです。
- アクセント上の `text-white` 直書きを `text-coffee-on-accent` に置換しておくと将来安全ですが、テラコッタは白でOKなので必須ではありません。
- `app/_layout.tsx` 以外に背景色をハードコードしている箇所（`#0e0b08` 等）が残っていれば、`bg-coffee-bg` 等のクラスに置き換えてください。残っていると片モードで背景が固定されてしまいます。
