// 設定画面などに置く 3-way セグメントトグル（ライト / ダーク / 自動）
// 既存の className 規約（bg-coffee-* / text-coffee-*）だけで作れる。

import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme, type ThemePref } from '../src/theme/ThemeContext';

const OPTIONS: { key: ThemePref; label: string; icon: string }[] = [
  { key: 'light', label: 'ライト', icon: '☀' },
  { key: 'dark', label: 'ダーク', icon: '☾' },
  { key: 'system', label: '自動', icon: '◐' },
];

export function ThemeToggle() {
  const { pref, setPref } = useTheme();

  return (
    <View>
      <Text className="text-xs font-bold uppercase tracking-widest text-coffee-muted mb-2">
        外観
      </Text>
      <View className="flex-row rounded-xl border border-coffee-border bg-coffee-surface p-1">
        {OPTIONS.map((opt) => {
          const active = pref === opt.key;
          return (
            <TouchableOpacity
              key={opt.key}
              onPress={() => setPref(opt.key)}
              activeOpacity={0.8}
              className={`flex-1 flex-row items-center justify-center gap-1.5 rounded-lg py-2.5 ${
                active ? 'bg-coffee-accent' : ''
              }`}
            >
              <Text
                className={`text-sm ${
                  active ? 'text-coffee-on-accent' : 'text-coffee-muted'
                }`}
              >
                {opt.icon}
              </Text>
              <Text
                className={`text-sm font-semibold ${
                  active ? 'text-coffee-on-accent' : 'text-coffee-muted'
                }`}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
