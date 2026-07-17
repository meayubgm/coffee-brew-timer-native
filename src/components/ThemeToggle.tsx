// 設定画面などに置く 3-way セグメントトグル（ライト / ダーク / 自動）
// 描画は共通の SegmentedControl に委譲する。

import { View, Text } from 'react-native';
import { useTheme, type ThemePref } from '../theme/ThemeContext';
import { SegmentedControl, type SegmentOption } from './ui';

const OPTIONS: SegmentOption<ThemePref>[] = [
  { value: 'light', label: 'ライト', icon: '☀' },
  { value: 'dark', label: 'ダーク', icon: '☾' },
  { value: 'system', label: '自動', icon: '◐' },
];

export function ThemeToggle() {
  const { pref, setPref } = useTheme();

  return (
    <View>
      <Text className="text-xs font-bold uppercase tracking-widest text-coffee-muted mb-2">
        外観
      </Text>
      <SegmentedControl options={OPTIONS} value={pref} onChange={setPref} />
    </View>
  );
}
