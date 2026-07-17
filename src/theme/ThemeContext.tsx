// src/theme/ThemeContext.tsx
// ライト/ダーク/自動(システム追従) の 3 状態を管理し、選択を永続化する。
// NativeWind v4 の useColorScheme().setColorScheme() が root の .dark を
// 付け外しするので、画面側は className を変えるだけで配色が切り替わる。

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'nativewind';

export type ThemePref = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'coffee.themePref';

type ThemeContextValue = {
  /** ユーザーの選択（light / dark / system） */
  pref: ThemePref;
  /** 実際に適用中の配色（system のときは解決後の light / dark） */
  resolved: 'light' | 'dark';
  setPref: (p: ThemePref) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // colorScheme: 解決後の 'light'|'dark' / setColorScheme: 'light'|'dark'|'system'
  const { colorScheme, setColorScheme } = useColorScheme();
  const [pref, setPrefState] = useState<ThemePref>('system');
  const [hydrated, setHydrated] = useState(false);

  // 起動時：保存済みの選択を読み込んで適用
  useEffect(() => {
    (async () => {
      try {
        const saved = (await AsyncStorage.getItem(STORAGE_KEY)) as ThemePref | null;
        if (saved === 'light' || saved === 'dark' || saved === 'system') {
          setPrefState(saved);
          setColorScheme(saved);
        } else {
          setColorScheme('system');
        }
      } finally {
        setHydrated(true);
      }
    })();
  }, [setColorScheme]);

  const setPref = useCallback(
    (p: ThemePref) => {
      setPrefState(p);
      setColorScheme(p);
      AsyncStorage.setItem(STORAGE_KEY, p).catch(() => {});
    },
    [setColorScheme]
  );

  // ちらつき防止：永続値の読込が終わるまで描画を遅らせたい場合はここで null を返す
  if (!hydrated) return null;

  return (
    <ThemeContext.Provider
      value={{ pref, resolved: colorScheme ?? 'light', setPref }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within <ThemeProvider>');
  return ctx;
}
