// 既存の SafeAreaProvider 構成を保持しつつ ThemeProvider を追加。
// 変更点:
//  - <ThemeProvider> で全体を包む（システム追従＋手動切替＋永続化）
//  - StatusBar の style を resolved（実適用テーマ）に連動
//  - Stack の contentStyle 背景をテーマの coffee-border 色に連動
//    （Web で max-width 制限時に見える左右余白の帯を枠色で塗る）

import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import '../global.css';
import { ThemeProvider, useTheme } from '../src/theme/ThemeContext';
import { THEME_COLORS } from '../src/theme/colors';

function ThemedStack() {
  const { resolved } = useTheme();
  // 左右余白（Web の max-width 制限時に見える帯）をテーマの枠色で塗る。
  // contentStyle は className 不可のため coffee-border 実値を出し分ける。
  const gutter = THEME_COLORS[resolved].border;
  return (
    <>
      {/* 明るい背景→暗い文字 / 暗い背景→明るい文字 に反転 */}
      <StatusBar style={resolved === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: gutter },
        }}
      />
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <ThemedStack />
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
