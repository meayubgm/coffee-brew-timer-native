// ラベル＋入力要素の縦積みフィールド。プリセット編集フォームで使用。

import { View, Text } from 'react-native';

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View>
      <Text className="text-xs text-coffee-muted mb-1">{label}</Text>
      {children}
    </View>
  );
}
