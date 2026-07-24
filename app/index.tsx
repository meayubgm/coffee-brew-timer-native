import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePresetStore } from '../src/stores/presetStore';
import { calcTotalWater } from '../src/utils/waterCalc';
import { fmtTime } from '../src/utils/format';
import { SCREEN_CONTAINER } from '../src/theme/colors';
import { Section, SegmentedControl, Stepper, SummaryItem } from '../src/components/ui';

export default function HomeScreen() {
  const {
    defaultTemplates,
    customPresets,
    selectedTemplateId,
    selectedOptionIds,
    beansGrams,
    servings,
    inputMode,
    selectTemplate,
    setOptionForPreset,
    setBeansGrams,
    setServings,
    setInputMode,
    getBuiltPreset,
  } = usePresetStore();

  const allItems = [...defaultTemplates, ...customPresets];
  const selectedItem = allItems.find((p) => p.id === selectedTemplateId) ?? defaultTemplates[0];
  const ratio = selectedItem.ratio;
  const totalWater = calcTotalWater(beansGrams, ratio);
  const builtPreset = getBuiltPreset();
  const iceGrams = builtPreset.iceGrams ?? 0;
  const hotWater = totalWater - iceGrams;

  return (
    <SafeAreaView className={SCREEN_CONTAINER}>
      {/* ヘッダー */}
      <View className="flex-row items-center justify-between px-6 pt-4 pb-3">
        <Text className="text-2xl font-bold text-coffee-accent">☕ Coffee Brew Timer</Text>
        <TouchableOpacity onPress={() => router.push('/settings')}>
          <Text className="text-sm text-coffee-muted">設定</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* プリセット選択 */}
        <Section label="抽出メソッド">
          <View className="flex-row flex-wrap gap-3">
            {allItems.map((item) => {
              const isSelected = item.id === selectedTemplateId;
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => selectTemplate(item.id)}
                  className={`flex-1 min-w-[44%] p-4 rounded-xl border ${
                    isSelected
                      ? 'border-coffee-accent bg-coffee-accent/10'
                      : 'border-coffee-border bg-coffee-surface'
                  }`}
                >
                  <Text className={`text-sm font-medium ${isSelected ? 'text-coffee-text' : 'text-coffee-muted'}`}>
                    {item.name}
                  </Text>
                  <Text className="text-xs text-coffee-muted mt-1">1:{item.ratio}</Text>
                  {'steps' in item && !item.isDefault && (
                    <Text className="text-xs text-coffee-accent mt-1">カスタム</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </Section>

        {/* 設定（豆量 / 人数） */}
        <Section label="設定">
          <View className="bg-coffee-surface border border-coffee-border rounded-xl p-4 gap-4">
            {/* 入力モード切替 */}
            <SegmentedControl
              options={[
                { value: 'beans', label: '豆量で指定' },
                { value: 'servings', label: '人数で指定' },
              ]}
              value={inputMode}
              onChange={setInputMode}
            />

            {/* 数値入力 */}
            {inputMode === 'beans' ? (
              <Stepper
                label="豆量"
                value={beansGrams}
                unit="g"
                onDecrement={() => setBeansGrams(Math.max(5, beansGrams - 5))}
                onIncrement={() => setBeansGrams(beansGrams + 5)}
                onChangeText={(v) => setBeansGrams(Math.max(5, Number(v) || 5))}
              />
            ) : (
              <Stepper
                label="人数"
                value={servings}
                unit="人"
                onDecrement={() => setServings(Math.max(1, servings - 1))}
                onIncrement={() => setServings(servings + 1)}
                onChangeText={(v) => setServings(Math.max(1, Number(v) || 1))}
              />
            )}
          </View>
        </Section>

        {/* 計算結果 */}
        <View className="bg-coffee-surface border border-coffee-border rounded-xl p-4 mb-6">
          <View className={`flex-row ${iceGrams > 0 ? 'justify-between' : 'justify-around'}`}>
            <SummaryItem value={`${beansGrams}g`} label="豆量" accent />
            <SummaryItem value={`1:${ratio}`} label="比率" />
            <SummaryItem value={`${hotWater}g`} label={iceGrams > 0 ? '湯量' : '総湯量'} accent />
            {iceGrams > 0 && <SummaryItem value={`${iceGrams}g`} label="氷" color="text-blue-400" />}
          </View>
        </View>

        {/* 味わいオプション */}
        {(() => {
          const tmpl = defaultTemplates.find((t) => t.id === selectedTemplateId);
          const groups = tmpl?.optionGroups;
          if (!groups?.length) return null;
          const groupOptionIds = selectedOptionIds[selectedTemplateId] ?? {};
          return (
            <Section label="味わい">
              <View className="bg-coffee-surface border border-coffee-border rounded-xl divide-y divide-coffee-border">
                {groups.map((group) => {
                  const currentOptionId = groupOptionIds[group.id] ?? group.defaultOptionId;
                  return (
                    <View key={group.id} className="px-4 py-3 gap-2">
                      <View>
                        <Text className="text-sm font-medium text-coffee-text">{group.label}</Text>
                        {group.description && (
                          <Text className="text-xs text-coffee-muted mt-0.5">{group.description}</Text>
                        )}
                      </View>
                      <SegmentedControl
                        options={group.options.map((opt) => ({ value: opt.id, label: opt.label }))}
                        value={currentOptionId}
                        onChange={(optId) => setOptionForPreset(selectedTemplateId, group.id, optId)}
                      />
                    </View>
                  );
                })}
              </View>
            </Section>
          );
        })()}

        {/* ステップ一覧プレビュー */}
        <Section label="ステップ">
          <View className="gap-2">
            {builtPreset.steps.map((step, i) => (
              <View
                key={step.id}
                className="flex-row items-center gap-3 bg-coffee-surface border border-coffee-border rounded-lg px-4 py-2.5"
              >
                <View className="w-6 h-6 rounded-full bg-coffee-border items-center justify-center">
                  <Text className="text-xs font-mono text-coffee-muted">{i + 1}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium text-coffee-text">{step.label}</Text>
                  <Text className="text-xs text-coffee-muted">
                    {fmtTime(step.startTime)} → {fmtTime(step.endTime)}
                  </Text>
                </View>
                {step.pourAmount > 0 && (
                  <Text className="text-sm font-mono text-coffee-accent">{step.cumulativeAmount}g</Text>
                )}
              </View>
            ))}
          </View>
        </Section>

        <View className="h-4" />
      </ScrollView>

      {/* 開始ボタン */}
      <View className="px-6 py-4 border-t border-coffee-border">
        <TouchableOpacity
          onPress={() => router.push('/timer')}
          className="bg-coffee-accent rounded-xl py-4 items-center"
        >
          <Text className="text-coffee-on-accent font-bold text-lg">タイマー開始</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
