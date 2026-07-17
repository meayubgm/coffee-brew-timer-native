// 大きな数値＋下ラベルの集計項目。HomeScreen の計算結果表示で使用。

import { View, Text } from 'react-native';

export function SummaryItem({
  value,
  label,
  accent,
  color,
}: {
  value: string;
  label: string;
  accent?: boolean;
  color?: string;
}) {
  return (
    <View className="items-center">
      <Text className={`text-2xl font-mono font-medium ${color ?? (accent ? 'text-coffee-accent' : 'text-coffee-text')}`}>
        {value}
      </Text>
      <Text className="text-xs text-coffee-muted mt-1">{label}</Text>
    </View>
  );
}
