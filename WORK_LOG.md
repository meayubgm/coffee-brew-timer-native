# WORK_LOG

このセッションで対応した内容の記録。

---

## 2026-07-01

### 1. Android実機（Expo Go）での起動確認

- `make start`（`npx expo start`）で開発サーバーを起動
- Android端末に Expo Go をインストールし、QRコードをスキャンして起動する手順を確認
- トンネルモード用に `make start-tunnel`（`npx expo start --tunnel --clear`）を Makefile に追加

---

### 2. Makefile にコマンド追加

```makefile
start-c:
    npx expo start --go --clear   # キャッシュクリア付き起動

start-tunnel:
    npx expo start --tunnel --clear  # 別ネットワーク接続用
```

---

### 3. Error 500 の修正 — `react-native-worklets/plugin` が見つからない

**原因:** NativeWind 4.2.4 が `react-native-worklets/plugin`（Babel プラグイン）を必要とするが未インストール。

**対処:**
- `npx expo install react-native-reanimated` を実行（`react-native-worklets` を含む）
- `babel.config.js` に `react-native-reanimated/plugin` を追加

```js
// babel.config.js
plugins: ['react-native-reanimated/plugin'],
```

---

### 4. `expo-av` → `expo-audio` への移行

**原因:** `expo-av`（`ExponentAV` ネイティブモジュール）が Expo Go の新アーキテクチャ（`newArchEnabled: true`）環境で動作しない。

**対処:**
- `src/utils/sound.ts` を `expo-av` から `expo-audio` + `expo-file-system` に書き換え
  - WAV バイト列を `expo-file-system` でキャッシュディレクトリに書き出し
  - `createAudioPlayer({ uri })` で再生
- `package.json` から `expo-av` を削除
- `app.json` の `expo-av` プラグイン設定を削除

---

### 5. Web版（`http://localhost:8081`）の表示エラー修正

**原因:** `react-native-web` および関連パッケージが未インストール。

**対処:**
```bash
npx expo install react-native-web react-dom @expo/metro-runtime
```

---

### 6. NativeWind ダークモード設定エラーの修正

**エラー:** `Cannot manually set color scheme, as dark mode is type 'media'.`

**原因:** `app.json` の `userInterfaceStyle: "dark"` と NativeWind のデフォルト `darkMode: 'media'` が競合。

**対処:** `tailwind.config.js` に `darkMode: 'class'` を追加。

---

### 7. claudeDesign によるカラーテーマ適用（ユーザー実施）

以下のファイルが更新・追加された：

| ファイル | 変更内容 |
|---|---|
| `tailwind.config.js` | カラー値を CSS 変数参照（`rgb(var(--coffee-*) / <alpha-value>)`）に変更。`on-accent` トークン追加 |
| `global.css` | `:root`（ライト）/ `.dark`（ダーク）の CSS カスタムプロパティ定義を追加。テラコッタテーマ |
| `app/_layout.tsx` | `ThemeProvider` で全体を包み、`StatusBar` スタイルをテーマに連動 |
| `src/theme/ThemeContext.tsx` | `light / dark / system` の 3 状態管理・AsyncStorage 永続化 |
| `src/components/ThemeToggle.tsx` | ライト/ダーク/自動 を切り替えるセグメントボタン UI |

**テーマ配色（テラコッタ）:**

| トークン | ライト | ダーク |
|---|---|---|
| bg | `#f7ece5` | `#120c0a` |
| surface | `#fffcf9` | `#201511` |
| border | `#eddcd1` | `#34221c` |
| text | `#301d15` | `#ece0d8` |
| muted | `#9c8074` | `#9c8579` |
| accent | `#b5512f` | `#cc6a45` |

> `ThemeToggle` コンポーネントはまだどの画面にも未配置。設定画面などに組み込む際に対応予定。

---

### 8. Android実機接続エラー（`Failed to download remote update`）

**原因:** PCとAndroid端末が別ネットワークに接続されていた。

**対処:** `make start-tunnel` でトンネルモード起動 → 解決。同じ Wi-Fi 環境では `make start-c` を使うこと。
