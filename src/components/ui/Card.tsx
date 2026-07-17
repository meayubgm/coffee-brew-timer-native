// surface 背景＋border＋角丸のカードコンテナ。
// パディングや flex / gap / mb などレイアウトは className で呼び出し側が付与する
// （NativeWind はクラス後勝ちのため rounded / border 色の上書きも className で可能）。

import { View } from 'react-native';

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <View className={`bg-coffee-surface border border-coffee-border rounded-xl ${className ?? ''}`}>
      {children}
    </View>
  );
}
