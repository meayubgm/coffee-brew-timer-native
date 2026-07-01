/** @type {import('tailwindcss').Config} */
// テラコッタ・テーマ / ライト・ダーク2セット対応版
// 既存の darkMode:'class' はそのまま活かす。色の実値は global.css の
// CSS 変数に移し、ここはトークン名 → 変数のマッピングだけを持つ。
// これにより app/ 側の className（bg-coffee-bg 等）は変更不要で
// ライト/ダークが自動切替される。
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        coffee: {
          bg: 'rgb(var(--coffee-bg) / <alpha-value>)',
          surface: 'rgb(var(--coffee-surface) / <alpha-value>)',
          border: 'rgb(var(--coffee-border) / <alpha-value>)',
          text: 'rgb(var(--coffee-text) / <alpha-value>)',
          muted: 'rgb(var(--coffee-muted) / <alpha-value>)',
          accent: 'rgb(var(--coffee-accent) / <alpha-value>)',
          'accent-dark': 'rgb(var(--coffee-accent-dark) / <alpha-value>)',
          'accent-light': 'rgb(var(--coffee-accent-light) / <alpha-value>)',
          // アクセント上の文字色（白固定だがトークン化しておくと将来安全）
          'on-accent': 'rgb(var(--coffee-on-accent) / <alpha-value>)',
        },
      },
    },
  },
  plugins: [],
};
