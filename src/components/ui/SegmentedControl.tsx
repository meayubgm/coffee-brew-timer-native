// セグメント選択トグル（ThemeToggle デザイン基準）。
// 外枠 p-1 ＋内側ピル型 rounded-lg、選択中は bg-coffee-accent / text-coffee-on-accent。
// 入力モード切替・味わいオプション・外観切替（ThemeToggle）で共有する。

import { View, Text, TouchableOpacity } from 'react-native';

export type SegmentOption<T extends string> = {
  value: T;
  label: string;
  icon?: string;
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <View className="flex-row rounded-xl border border-coffee-border bg-coffee-surface p-1">
      {options.map((opt) => {
        const active = value === opt.value;
        const textColor = active ? 'text-coffee-on-accent' : 'text-coffee-muted';
        return (
          <TouchableOpacity
            key={opt.value}
            onPress={() => onChange(opt.value)}
            activeOpacity={0.8}
            className={`flex-1 flex-row items-center justify-center gap-1.5 rounded-lg py-2.5 ${
              active ? 'bg-coffee-accent' : ''
            }`}
          >
            {opt.icon && <Text className={`text-sm ${textColor}`}>{opt.icon}</Text>}
            <Text className={`text-sm font-semibold ${textColor}`}>{opt.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
