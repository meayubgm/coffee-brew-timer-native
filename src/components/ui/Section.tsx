// 見出し（uppercase ミュートラベル）＋子要素の縦積みセクション。
// 3画面で反復していた見出しパターンを集約する。

import { View, Text } from 'react-native';

export function Section({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <View className={`mb-6 ${className ?? ''}`}>
      <Text className="text-xs uppercase tracking-widest text-coffee-muted mb-3">{label}</Text>
      {children}
    </View>
  );
}
