// 既存の SafeAreaProvider 構成を保持しつつ ThemeProvider を追加。
// 変更点:
//  - <ThemeProvider> で全体を包む（システム追従＋手動切替＋永続化）
//  - StatusBar の style を resolved（実適用テーマ）に連動
//  - Stack の contentStyle のハードコード #0e0b08 を撤去
//    （背景は各画面の bg-coffee-bg が描くので transparent で良い）

import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import '../global.css';
import { ThemeProvider, useTheme } from '../src/theme/ThemeContext';

function ThemedStack() {
  const { resolved } = useTheme();
  return (
    <>
      {/* 明るい背景→暗い文字 / 暗い背景→明るい文字 に反転 */}
      <StatusBar style={resolved === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: 'transparent' },
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
