import { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, Pressable } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTimerStore } from '../src/stores/timerStore';
import { usePresetStore } from '../src/stores/presetStore';
import { playBeep } from '../src/utils/sound';
import { fmtTime, MONO_FONT_FAMILY } from '../src/utils/format';
import { SCREEN_CONTAINER } from '../src/theme/colors';

export default function TimerScreen() {
  const { elapsed, isRunning, currentStepIndex, alarm, start, pause, resume, reset, dismissAlarm } =
    useTimerStore();
  const { getBuiltPreset } = usePresetStore();
  const preset = getBuiltPreset();
  const steps = preset.steps;

  useEffect(() => {
    start(steps);
    return () => reset();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (alarm) {
      playBeep();
      // 5秒経過で自動的にオーバーレイを閉じる
      const timer = setTimeout(dismissAlarm, 5000);
      return () => clearTimeout(timer);
    }
  }, [alarm]);

  function handleToggle() {
    isRunning ? pause() : resume(steps);
  }

  function handleReset() {
    reset();
    router.back();
  }

  const totalDuration = steps[steps.length - 1]?.endTime ?? 1;
  const progressPct = Math.min((elapsed / totalDuration) * 100, 100);
  const isFinished = elapsed >= totalDuration && !isRunning;

  const currentStep = steps[currentStepIndex];
  const nextStep = steps[currentStepIndex + 1];
  const stepElapsed = currentStep ? elapsed - currentStep.startTime : 0;
  const stepDuration = currentStep ? currentStep.endTime - currentStep.startTime : 1;
  const stepPct = Math.min((stepElapsed / Math.max(stepDuration, 1)) * 100, 100);

  return (
    <SafeAreaView className={SCREEN_CONTAINER}>
      {/* ヘッダー */}
      <View className="flex-row items-center px-6 pt-4 pb-3 gap-4">
        <TouchableOpacity onPress={handleReset}>
          <Text className="text-coffee-muted">← 戻る</Text>
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-medium text-coffee-text">{preset.name}</Text>
        <View className="w-12" />
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* タイマー */}
        <View className="items-center py-6">
          <Text
            className="text-7xl text-coffee-text font-medium"
            style={{ fontFamily: MONO_FONT_FAMILY }}
          >
            {fmtTime(elapsed)}
          </Text>
          <Text className="text-sm text-coffee-muted mt-2">/ {fmtTime(totalDuration)}</Text>
        </View>

        {/* 全体進捗バー */}
        <View className="relative mb-6">
          <View className="h-2 bg-coffee-border rounded-full overflow-hidden">
            <View className="h-full bg-coffee-accent rounded-full" style={{ width: `${progressPct}%` }} />
          </View>
          {steps.map((step, i) => {
            if (i === 0) return null;
            const pos = (step.startTime / totalDuration) * 100;
            return (
              <View
                key={step.id}
                className="absolute top-0 w-px h-2 bg-coffee-bg"
                style={{ left: `${pos}%` }}
              />
            );
          })}
        </View>

        {/* 現在のステップ */}
        {currentStep && !isFinished && (
          <View className="bg-coffee-surface border border-coffee-accent rounded-xl p-5 mb-4">
            <View className="flex-row items-start justify-between gap-4">
              <View className="flex-1">
                <Text className="text-xs uppercase tracking-widest text-coffee-accent mb-1">
                  現在のステップ
                </Text>
                <Text className="text-xl font-bold text-coffee-text">{currentStep.label}</Text>
                {currentStep.instruction && (
                  <Text className="text-sm text-coffee-muted mt-1">{currentStep.instruction}</Text>
                )}
              </View>
              {currentStep.pourAmount > 0 && (
                <View className="items-end">
                  <Text
                    className="text-3xl font-bold text-coffee-accent"
                    style={{ fontFamily: MONO_FONT_FAMILY }}
                  >
                    {currentStep.cumulativeAmount}g
                  </Text>
                  <Text className="text-xs text-coffee-muted">スケール目標</Text>
                  {currentStep.cumulativeAmount !== currentStep.pourAmount && (
                    <Text className="text-xs text-coffee-muted mt-0.5">+{currentStep.pourAmount}g</Text>
                  )}
                </View>
              )}
            </View>
            {/* ステップ内進捗バー */}
            <View className="mt-3 h-1.5 bg-coffee-border rounded-full overflow-hidden">
              <View className="h-full bg-coffee-accent/60 rounded-full" style={{ width: `${stepPct}%` }} />
            </View>
            <View className="flex-row justify-between mt-1">
              <Text className="text-xs text-coffee-muted">{fmtTime(currentStep.startTime)}</Text>
              {nextStep && (
                <Text className="text-xs text-coffee-muted">
                  次: {nextStep.label} まで{' '}
                  {Math.max(0, Math.floor(nextStep.startTime - elapsed))}秒
                </Text>
              )}
              <Text className="text-xs text-coffee-muted">{fmtTime(currentStep.endTime)}</Text>
            </View>
          </View>
        )}

        {/* 完了 */}
        {isFinished && (
          <View className="bg-coffee-surface border border-coffee-accent/30 rounded-xl p-6 items-center mb-4">
            <Text className="text-4xl mb-3">☕</Text>
            <Text className="text-xl font-bold text-coffee-accent">抽出完了！</Text>
            <Text className="text-sm text-coffee-muted mt-2">美味しいコーヒーをお楽しみください</Text>
          </View>
        )}

        {/* ステップ一覧 */}
        <Text className="text-xs uppercase tracking-widest text-coffee-muted mb-2">ステップ一覧</Text>
        <View className="gap-2">
          {steps.map((step, i) => {
            const isDone = i < currentStepIndex || isFinished;
            const isCurrent = i === currentStepIndex && !isFinished;
            return (
              <View
                key={step.id}
                className={`flex-row items-center gap-3 rounded-lg px-4 py-2.5 border ${
                  isCurrent
                    ? 'border-coffee-accent bg-coffee-accent/10'
                    : isDone
                    ? 'border-coffee-border bg-coffee-surface opacity-50'
                    : 'border-coffee-border bg-coffee-surface'
                }`}
              >
                <View
                  className={`w-6 h-6 rounded-full items-center justify-center ${
                    isDone ? 'bg-coffee-accent/30' : isCurrent ? 'bg-coffee-accent' : 'bg-coffee-border'
                  }`}
                >
                  <Text
                    className={`text-xs font-mono ${
                      isDone ? 'text-coffee-accent' : isCurrent ? 'text-coffee-on-accent' : 'text-coffee-muted'
                    }`}
                  >
                    {isDone ? '✓' : i + 1}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium text-coffee-text">{step.label}</Text>
                  <Text className="text-xs text-coffee-muted">{fmtTime(step.startTime)}</Text>
                </View>
                {step.pourAmount > 0 && (
                  <Text className="text-sm font-mono text-coffee-accent">{step.cumulativeAmount}g</Text>
                )}
              </View>
            );
          })}
        </View>

        <View className="h-4" />
      </ScrollView>

      {/* 操作ボタン */}
      <View className="flex-row px-6 py-4 gap-3 border-t border-coffee-border">
        {!isFinished && (
          <TouchableOpacity
            onPress={handleToggle}
            className={`flex-1 py-4 rounded-xl items-center ${
              isRunning ? 'bg-coffee-border' : 'bg-coffee-accent'
            }`}
          >
            <Text className={`font-bold text-lg ${isRunning ? 'text-coffee-text' : 'text-coffee-on-accent'}`}>
              {isRunning ? '一時停止' : '再開'}
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={handleReset}
          className="px-6 py-4 rounded-xl border border-coffee-border items-center justify-center"
        >
          <Text className="text-coffee-muted">リセット</Text>
        </TouchableOpacity>
      </View>

      {/* アラームオーバーレイ */}
      <Modal visible={!!alarm} transparent animationType="fade" statusBarTranslucent>
        <Pressable
          className="flex-1 bg-coffee-bg/90 items-center justify-center px-8"
          onPress={dismissAlarm}
        >
          <View pointerEvents="none">
            <View className="bg-coffee-surface border border-coffee-accent rounded-2xl p-8 w-full min-w-[16rem] items-center">
              <Text className="text-5xl mb-4">🔔</Text>
              <Text className="text-2xl font-bold text-coffee-accent mb-1">{alarm?.step.label}</Text>
              {alarm?.step.instruction && (
                <Text className="text-coffee-muted text-sm mb-4 text-center">
                  {alarm.step.instruction}
                </Text>
              )}
              {alarm && alarm.step.pourAmount > 0 && (
                <View className="bg-coffee-bg rounded-xl p-4 mb-4 w-full items-center">
                  <Text
                    className="text-5xl font-bold text-coffee-accent"
                    style={{ fontFamily: MONO_FONT_FAMILY }}
                  >
                    {alarm.step.cumulativeAmount}g
                  </Text>
                  <Text className="text-coffee-muted text-sm mt-1">スケール目標</Text>
                  {alarm.step.cumulativeAmount !== alarm.step.pourAmount && (
                    <Text className="text-coffee-muted text-xs mt-1">
                      +{alarm.step.pourAmount}g（このステップ）
                    </Text>
                  )}
                </View>
              )}
              {alarm?.nextStep && (
                <Text className="text-coffee-muted text-sm">
                  次: {alarm.nextStep.label} まで {alarm.step.endTime - alarm.step.startTime}秒
                </Text>
              )}
              <Text className="text-coffee-muted text-xs mt-6">タップして閉じる</Text>
            </View>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
