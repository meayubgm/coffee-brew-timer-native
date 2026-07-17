import { Platform } from 'react-native';

// 秒数を m:ss 形式に整形する（小数は切り捨て）
export function fmtTime(secs: number): string {
  const s = Math.floor(secs);
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}

// 数字表示用の等幅フォント。iOS は 'monospace' 指定が効かないため Courier New を使う
export const MONO_FONT_FAMILY = Platform.OS === 'ios' ? 'Courier New' : 'monospace';
