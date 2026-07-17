// className では表現できない箇所（Stack の contentStyle / TextInput の
// placeholderTextColor など）向けに、global.css のテーマトークン実値を
// light/dark で保持する。値は global.css と一致させること。
// あわせて全画面共通のコンテナ用 className もここで一元管理する。

type Resolved = 'light' | 'dark';

// border: 画面余白（gutter）用の枠色 / placeholder: 入力プレースホルダ用のミュート色
export const THEME_COLORS: Record<Resolved, { border: string; placeholder: string }> = {
  light: { border: '#eddcd1', placeholder: '#9c8074' },
  dark: { border: '#34221c', placeholder: '#9c8579' },
};

// 各画面ルート（SafeAreaView）共通のコンテナクラス。
// Web の max-width 制限＋中央寄せを全画面で統一する。
export const SCREEN_CONTAINER = 'flex-1 w-full bg-coffee-bg max-w-4xl mx-auto';
