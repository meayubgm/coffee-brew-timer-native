// ラベル＋数値入力＋増減ボタンの行。豆量/人数入力で使用。

import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { MONO_FONT_FAMILY } from '../../utils/format';

export function Stepper({
  label,
  value,
  unit,
  onDecrement,
  onIncrement,
  onChangeText,
}: {
  label: string;
  value: number;
  unit: string;
  onDecrement: () => void;
  onIncrement: () => void;
  onChangeText: (v: string) => void;
}) {
  return (
    <View className="flex-row items-center gap-3">
      <Text className="text-sm text-coffee-muted w-12">{label}</Text>
      <View className="flex-1 flex-row items-center gap-2">
        <TouchableOpacity
          onPress={onDecrement}
          className="w-9 h-9 rounded-lg bg-coffee-border items-center justify-center"
        >
          <Text className="text-coffee-text text-xl">−</Text>
        </TouchableOpacity>
        <TextInput
          value={String(value)}
          onChangeText={onChangeText}
          keyboardType="numeric"
          style={{ fontFamily: MONO_FONT_FAMILY, minWidth: 0 }}
          className="flex-1 bg-coffee-bg border border-coffee-border rounded-lg px-3 py-2 text-center text-lg text-coffee-text"
        />
        <TouchableOpacity
          onPress={onIncrement}
          className="w-9 h-9 rounded-lg bg-coffee-border items-center justify-center"
        >
          <Text className="text-coffee-text text-xl">＋</Text>
        </TouchableOpacity>
        <Text className="text-sm text-coffee-muted">{unit}</Text>
      </View>
    </View>
  );
}
