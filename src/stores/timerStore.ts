import { create } from 'zustand';
import * as KeepAwake from 'expo-keep-awake';
import { BrewStep } from '../types/preset';

// Webでは wake lock が未アクティブのまま解除するとrejectされる（HTTP環境や
// ブラウザ非対応時など）。スリープ抑制は補助機能なので失敗は握りつぶす。
function activateKeepAwake(): void {
  Promise.resolve(KeepAwake.activateKeepAwakeAsync()).catch(() => {});
}

function deactivateKeepAwake(): void {
  Promise.resolve(KeepAwake.deactivateKeepAwake()).catch(() => {});
}

type AlarmInfo = {
  step: BrewStep;
  nextStep: BrewStep | null;
};

type TimerState = {
  elapsed: number;
  isRunning: boolean;
  currentStepIndex: number;
  alarm: AlarmInfo | null;
  intervalId: ReturnType<typeof setInterval> | null;

  start: (steps: BrewStep[]) => void;
  pause: () => void;
  resume: (steps: BrewStep[]) => void;
  reset: () => void;
  dismissAlarm: () => void;
  tick: (steps: BrewStep[]) => void;
};

export const useTimerStore = create<TimerState>((set, get) => {
  // 実行中の interval を停止する（各操作で共通利用）
  function clearTimer(): void {
    const { intervalId } = get();
    if (intervalId) {
      clearInterval(intervalId);
    }
  }

  return {
  elapsed: 0,
  isRunning: false,
  currentStepIndex: 0,
  alarm: null,
  intervalId: null,

  start: (steps) => {
    clearTimer();
    activateKeepAwake();

    const firstAlarm: AlarmInfo = {
      step: steps[0],
      nextStep: steps[1] ?? null,
    };

    const id = setInterval(() => {
      get().tick(steps);
    }, 100);

    set({
      elapsed: 0,
      isRunning: true,
      currentStepIndex: 0,
      alarm: firstAlarm,
      intervalId: id,
    });
  },

  pause: () => {
    clearTimer();
    deactivateKeepAwake();
    set({ isRunning: false, intervalId: null });
  },

  resume: (steps) => {
    clearTimer();
    activateKeepAwake();
    const id = setInterval(() => {
      get().tick(steps);
    }, 100);
    set({ isRunning: true, intervalId: id });
  },

  reset: () => {
    clearTimer();
    deactivateKeepAwake();
    set({
      elapsed: 0,
      isRunning: false,
      currentStepIndex: 0,
      alarm: null,
      intervalId: null,
    });
  },

  dismissAlarm: () => {
    set({ alarm: null });
  },

  tick: (steps) => {
    const { elapsed, currentStepIndex } = get();
    const newElapsed = elapsed + 0.1;
    const currentStep = steps[currentStepIndex];

    if (!currentStep) {
      clearTimer();
      deactivateKeepAwake();
      set({ elapsed: newElapsed, isRunning: false, intervalId: null });
      return;
    }

    const nextStepIndex = currentStepIndex + 1;
    const nextStep = steps[nextStepIndex];

    if (nextStep && newElapsed >= nextStep.startTime) {
      set({
        elapsed: newElapsed,
        currentStepIndex: nextStepIndex,
        alarm: { step: nextStep, nextStep: steps[nextStepIndex + 1] ?? null },
      });
      return;
    }

    set({ elapsed: newElapsed });
  },
  };
});
