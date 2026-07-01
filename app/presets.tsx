import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePresetStore } from '../src/stores/presetStore';
import { BrewPreset, BrewStep } from '../src/types/preset';

type EditingStep = {
  id: string;
  label: string;
  startTime: number;
  endTime: number;
  pourRatio: number;
  instruction: string;
};

type EditingPreset = {
  id: string;
  name: string;
  ratio: number;
  memo: string;
  steps: EditingStep[];
};

export default function PresetsScreen() {
  const { defaultTemplates, customPresets, addCustomPreset, updateCustomPreset, deleteCustomPreset, duplicateTemplate } =
    usePresetStore();

  const [editing, setEditing] = useState<EditingPreset | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  function openNew() {
    setIsCreating(true);
    setEditing({
      id: `custom-${Date.now()}`,
      name: '新しいプリセット',
      ratio: 15,
      memo: '',
      steps: [{ id: `step-${Date.now()}`, label: 'ステップ1', startTime: 0, endTime: 60, pourRatio: 1, instruction: '' }],
    });
  }

  function openEdit(preset: BrewPreset) {
    const totalWater = preset.steps.reduce((s, p) => s + p.pourAmount, 0);
    setIsCreating(false);
    setEditing({
      id: preset.id,
      name: preset.name,
      ratio: preset.ratio,
      memo: preset.memo ?? '',
      steps: preset.steps.map((s) => ({
        id: s.id,
        label: s.label,
        startTime: s.startTime,
        endTime: s.endTime,
        pourRatio: totalWater > 0 ? s.pourAmount / totalWater : 0,
        instruction: s.instruction ?? '',
      })),
    });
  }

  function confirmDelete(id: string) {
    Alert.alert('削除確認', 'このプリセットを削除しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      { text: '削除', style: 'destructive', onPress: () => deleteCustomPreset(id) },
    ]);
  }

  function handleSave() {
    if (!editing) return;
    if (!editing.name.trim()) {
      Alert.alert('エラー', 'プリセット名を入力してください');
      return;
    }
    const totalWater = editing.ratio * 20;
    let cumulative = 0;
    const steps: BrewStep[] = editing.steps.map((s) => {
      const pourAmount = Math.round(totalWater * s.pourRatio);
      cumulative += pourAmount;
      return { id: s.id, label: s.label, startTime: s.startTime, endTime: s.endTime, pourAmount, cumulativeAmount: cumulative, instruction: s.instruction || undefined };
    });
    const preset: BrewPreset = { id: editing.id, name: editing.name, ratio: editing.ratio, steps, isDefault: false, memo: editing.memo || undefined };
    isCreating ? addCustomPreset(preset) : updateCustomPreset(preset);
    setEditing(null);
  }

  function addStep() {
    if (!editing) return;
    const last = editing.steps[editing.steps.length - 1];
    setEditing({
      ...editing,
      steps: [...editing.steps, { id: `step-${Date.now()}`, label: `ステップ${editing.steps.length + 1}`, startTime: last?.endTime ?? 0, endTime: (last?.endTime ?? 0) + 60, pourRatio: 0, instruction: '' }],
    });
  }

  function updateStep(stepId: string, updates: Partial<EditingStep>) {
    if (!editing) return;
    setEditing({ ...editing, steps: editing.steps.map((s) => (s.id === stepId ? { ...s, ...updates } : s)) });
  }

  function removeStep(stepId: string) {
    if (!editing) return;
    setEditing({ ...editing, steps: editing.steps.filter((s) => s.id !== stepId) });
  }

  return (
    <SafeAreaView className="flex-1 bg-coffee-bg">
      {/* ヘッダー */}
      <View className="flex-row items-center px-6 pt-4 pb-3 gap-4">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-coffee-muted">← 戻る</Text>
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-medium text-coffee-text">プリセット管理</Text>
        <TouchableOpacity onPress={openNew}>
          <Text className="text-coffee-accent font-medium">＋ 新規</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* デフォルトプリセット */}
        <Text className="text-xs uppercase tracking-widest text-coffee-muted mb-3">デフォルト</Text>
        <View className="gap-2 mb-6">
          {defaultTemplates.map((tmpl) => (
            <View key={tmpl.id} className="bg-coffee-surface border border-coffee-border rounded-xl px-4 py-3 flex-row items-center gap-3">
              <View className="flex-1">
                <Text className="font-medium text-coffee-text">{tmpl.name}</Text>
                <Text className="text-xs text-coffee-muted mt-0.5">1:{tmpl.ratio} · {tmpl.stepTemplates.length}ステップ</Text>
                {tmpl.memo ? <Text className="text-xs text-coffee-muted mt-1" numberOfLines={1}>{tmpl.memo}</Text> : null}
              </View>
              <TouchableOpacity
                onPress={() => duplicateTemplate(tmpl.id)}
                className="border border-coffee-accent/30 rounded-lg px-2 py-1"
              >
                <Text className="text-xs text-coffee-accent">複製</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* カスタムプリセット */}
        <Text className="text-xs uppercase tracking-widest text-coffee-muted mb-3">カスタム</Text>
        {customPresets.length === 0 ? (
          <View className="items-center py-10">
            <Text className="text-3xl mb-3">📋</Text>
            <Text className="text-coffee-muted text-sm">カスタムプリセットがありません</Text>
            <TouchableOpacity onPress={openNew} className="mt-3">
              <Text className="text-coffee-accent">作成する</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="gap-2 mb-6">
            {customPresets.map((preset) => (
              <View key={preset.id} className="bg-coffee-surface border border-coffee-border rounded-xl px-4 py-3 flex-row items-center gap-3">
                <View className="flex-1">
                  <Text className="font-medium text-coffee-text">{preset.name}</Text>
                  <Text className="text-xs text-coffee-muted mt-0.5">1:{preset.ratio} · {preset.steps.length}ステップ</Text>
                </View>
                <View className="flex-row gap-2">
                  <TouchableOpacity onPress={() => duplicateTemplate(preset.id)} className="border border-coffee-border rounded-lg px-2 py-1">
                    <Text className="text-xs text-coffee-muted">複製</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => openEdit(preset)} className="border border-coffee-accent/30 rounded-lg px-2 py-1">
                    <Text className="text-xs text-coffee-accent">編集</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => confirmDelete(preset.id)} className="border border-red-400/30 rounded-lg px-2 py-1">
                    <Text className="text-xs text-red-400">削除</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* 編集モーダル */}
      <Modal visible={!!editing} animationType="slide" presentationStyle="pageSheet">
        {editing && (
          <SafeAreaView className="flex-1 bg-coffee-bg">
            <View className="flex-row items-center px-6 pt-4 pb-3 gap-4">
              <TouchableOpacity onPress={() => setEditing(null)}>
                <Text className="text-coffee-muted">キャンセル</Text>
              </TouchableOpacity>
              <Text className="flex-1 text-center text-lg font-medium text-coffee-text">
                {isCreating ? 'プリセット作成' : '編集'}
              </Text>
              <TouchableOpacity onPress={handleSave}>
                <Text className="text-coffee-accent font-medium">保存</Text>
              </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
              {/* 基本情報 */}
              <View className="bg-coffee-surface border border-coffee-border rounded-xl p-4 gap-3 mb-5">
                <Field label="プリセット名">
                  <TextInput
                    value={editing.name}
                    onChangeText={(v) => setEditing({ ...editing, name: v })}
                    className="w-full bg-coffee-bg border border-coffee-border rounded-lg px-3 py-2 text-coffee-text"
                    placeholderTextColor="#8a7a6e"
                    placeholder="プリセット名"
                  />
                </Field>
                <Field label="比率（1:X）">
                  <TextInput
                    value={String(editing.ratio)}
                    onChangeText={(v) => setEditing({ ...editing, ratio: Number(v) || 15 })}
                    keyboardType="numeric"
                    className="w-full bg-coffee-bg border border-coffee-border rounded-lg px-3 py-2 text-coffee-text font-mono"
                  />
                </Field>
                <Field label="メモ">
                  <TextInput
                    value={editing.memo}
                    onChangeText={(v) => setEditing({ ...editing, memo: v })}
                    multiline
                    numberOfLines={2}
                    className="w-full bg-coffee-bg border border-coffee-border rounded-lg px-3 py-2 text-coffee-text"
                    placeholderTextColor="#8a7a6e"
                    placeholder="豆の種類・挽き目など"
                  />
                </Field>
              </View>

              {/* ステップ */}
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-xs uppercase tracking-widest text-coffee-muted">ステップ</Text>
                <TouchableOpacity onPress={addStep}>
                  <Text className="text-sm text-coffee-accent">＋ 追加</Text>
                </TouchableOpacity>
              </View>
              <View className="gap-3 mb-6">
                {editing.steps.map((step, i) => (
                  <View key={step.id} className="bg-coffee-surface border border-coffee-border rounded-xl p-4 gap-3">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-xs text-coffee-muted">ステップ {i + 1}</Text>
                      {editing.steps.length > 1 && (
                        <TouchableOpacity onPress={() => removeStep(step.id)}>
                          <Text className="text-xs text-red-400">削除</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    <View className="flex-row gap-2">
                      <View className="flex-1">
                        <Text className="text-xs text-coffee-muted mb-1">ラベル</Text>
                        <TextInput
                          value={step.label}
                          onChangeText={(v) => updateStep(step.id, { label: v })}
                          className="bg-coffee-bg border border-coffee-border rounded-lg px-2 py-1.5 text-sm text-coffee-text"
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="text-xs text-coffee-muted mb-1">注湯割合 (%)</Text>
                        <TextInput
                          value={String(Math.round(step.pourRatio * 100))}
                          onChangeText={(v) => updateStep(step.id, { pourRatio: (Number(v) || 0) / 100 })}
                          keyboardType="numeric"
                          className="bg-coffee-bg border border-coffee-border rounded-lg px-2 py-1.5 text-sm text-coffee-text font-mono"
                        />
                      </View>
                    </View>
                    <View className="flex-row gap-2">
                      <View className="flex-1">
                        <Text className="text-xs text-coffee-muted mb-1">開始 (秒)</Text>
                        <TextInput
                          value={String(step.startTime)}
                          onChangeText={(v) => updateStep(step.id, { startTime: Number(v) || 0 })}
                          keyboardType="numeric"
                          className="bg-coffee-bg border border-coffee-border rounded-lg px-2 py-1.5 text-sm text-coffee-text font-mono"
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="text-xs text-coffee-muted mb-1">終了 (秒)</Text>
                        <TextInput
                          value={String(step.endTime)}
                          onChangeText={(v) => updateStep(step.id, { endTime: Number(v) || 0 })}
                          keyboardType="numeric"
                          className="bg-coffee-bg border border-coffee-border rounded-lg px-2 py-1.5 text-sm text-coffee-text font-mono"
                        />
                      </View>
                    </View>
                    <View>
                      <Text className="text-xs text-coffee-muted mb-1">ガイドテキスト（任意）</Text>
                      <TextInput
                        value={step.instruction}
                        onChangeText={(v) => updateStep(step.id, { instruction: v })}
                        className="bg-coffee-bg border border-coffee-border rounded-lg px-2 py-1.5 text-sm text-coffee-text"
                        placeholderTextColor="#8a7a6e"
                        placeholder="例: ゆっくり円を描くように注ぐ"
                      />
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>
    </SafeAreaView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View>
      <Text className="text-xs text-coffee-muted mb-1">{label}</Text>
      {children}
    </View>
  );
}
