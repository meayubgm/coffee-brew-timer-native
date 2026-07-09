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

---

### 9. ThemeToggle を設定画面に組み込み

- `src/components/ThemeToggle.tsx` のインポートパスの誤りを修正（claudeDesign バグ）
  - `'../src/theme/ThemeContext'` → `'../theme/ThemeContext'`
- `app/settings.tsx`（旧 presets.tsx）の ScrollView 末尾に「設定」セクションとして `ThemeToggle` を追加
- HomeScreen のボタン・PresetsScreen のヘッダー文言を「プリセット管理」→「設定」に変更

---

### 10. PresetsScreen → SettingScreen にリネーム

プリセット以外の設定（テーマ切替）も含む画面になったため名称を変更。

| 変更前 | 変更後 |
|---|---|
| `app/presets.tsx` | `app/settings.tsx` |
| `PresetsScreen` | `SettingScreen` |
| `router.push('/presets')` | `router.push('/settings')` |

> `presetStore.ts` のストレージキー（`'coffee-custom-presets'`）はユーザーデータに関わるため変更なし。

---

### 11. Stepper の数値入力が Section からはみ出る問題を修正

**原因:** `TextInput` が `minWidth` の制約を持たず、`flex-1` コンテナ内で縮小しきれなかった。

**対処:** `TextInput` の `style` に `minWidth: 0` を追加。

---

### 12. アラームオーバーレイのタップ挙動と自動クローズを修正

**問題1:** オーバーレイカード自身をタップしても閉じない。
- **原因:** 内側の `Pressable` がタップイベントを吸収していた。
- **対処:** 内側の `Pressable` を `View pointerEvents="none"` に変更し、外側の `Pressable`（`dismissAlarm`）にイベントが届くようにした。

**問題2:** タップしないと永続表示される。
- **対処:** alarm 表示時に `setTimeout(dismissAlarm, 5000)` を設定し、5秒で自動クローズ。手動で閉じた場合や次のアラームが来た場合は `clearTimeout` でクリーンアップ。

---

### 13. ビープ音が再生されない問題を修正（ネイティブ）

**原因:** `expo-file-system` の `writeAsStringAsync` が Expo SDK 56 で deprecated になり、エラーで再生が中断していた。

**対処:**
- `src/utils/sound.ts` のインポートを `expo-file-system` → `expo-file-system/legacy` に変更。
- 併せて広い try-catch を整理し、`setAudioModeAsync` の失敗が再生をブロックしないよう `ensureAudioMode()` に分離。

---

### 14. Web版の音声再生と keep-awake のエラーを修正

**問題1:** Web で音声再生エラー。
- **エラー:** `UnavailabilityError: The method or property expo-file-system.writeAsStringAsync is not available on web`
- **原因:** `expo-file-system` は Web 非対応。WAV をキャッシュに書き出す方式が Web では成立しない。
- **対処:** `Platform.OS === 'web'` の場合は Web Audio API（`AudioContext` + `OscillatorNode`）で 880Hz サイン波を直接合成して再生する分岐を追加。ファイル書き込み・`expo-audio`・`expo-haptics` はネイティブ側だけで呼ぶ。自動再生ポリシー対策として `suspended` 時は `resume()` を試みる。
- 併せて `setAudioModeAsync` のプロパティ名誤りを修正（`playsInSilentModeIOS` → `playsInSilentMode`）。

**問題2:** タイマー画面で「戻る」「リセット」押下時に Uncaught エラー。
- **エラー:** `CodedError: The wake lock with tag ExpoKeepAwakeDefaultTag has not activated yet`
- **原因:** Web の `expo-keep-awake` は Screen Wake Lock API を使う。wake lock が未アクティブの状態で `deactivateKeepAwake()` を呼ぶと Promise が reject される。
- **対処:** `src/stores/timerStore.ts` で activate / deactivate を `.catch(() => {})` で失敗を握りつぶすラッパー関数に包み、全 5 箇所の呼び出しをラッパー経由に変更。スリープ抑制は補助機能なので失敗してもタイマー動作に影響させない。
