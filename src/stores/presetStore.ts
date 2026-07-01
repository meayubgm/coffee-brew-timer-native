import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BrewPreset, BrewPresetTemplate } from '../types/preset';
import { DEFAULT_PRESETS } from '../constants/defaultPresets';
import { buildPresetFromTemplate } from '../utils/stepBuilder';

const STORAGE_KEY = 'coffee-custom-presets';

type PresetStore = {
  defaultTemplates: BrewPresetTemplate[];
  customPresets: BrewPreset[];
  selectedTemplateId: string;
  selectedOptionIds: Record<string, Record<string, string>>;
  beansGrams: number;
  servings: number;
  inputMode: 'beans' | 'servings';

  selectTemplate: (id: string) => void;
  setOptionForPreset: (presetId: string, groupId: string, optionId: string) => void;
  setBeansGrams: (grams: number) => void;
  setServings: (count: number) => void;
  setInputMode: (mode: 'beans' | 'servings') => void;
  getBuiltPreset: () => BrewPreset;
  addCustomPreset: (preset: BrewPreset) => void;
  updateCustomPreset: (preset: BrewPreset) => void;
  deleteCustomPreset: (id: string) => void;
  duplicateTemplate: (templateId: string) => BrewPreset;
  getAllPresets: () => (BrewPreset | BrewPresetTemplate)[];
};

export const usePresetStore = create<PresetStore>()(
  persist(
    (set, get) => ({
      defaultTemplates: DEFAULT_PRESETS,
      customPresets: [],
      selectedTemplateId: DEFAULT_PRESETS[0].id,
      selectedOptionIds: {},
      beansGrams: 20,
      servings: 2,
      inputMode: 'beans',

      selectTemplate: (id) => set({ selectedTemplateId: id }),

      setOptionForPreset: (presetId, groupId, optionId) => {
        set((state) => ({
          selectedOptionIds: {
            ...state.selectedOptionIds,
            [presetId]: { ...state.selectedOptionIds[presetId], [groupId]: optionId },
          },
        }));
      },

      setBeansGrams: (grams) => set({ beansGrams: grams }),
      setServings: (count) => set({ servings: count, beansGrams: count * 15 }),
      setInputMode: (mode) => set({ inputMode: mode }),

      getBuiltPreset: () => {
        const { selectedTemplateId, beansGrams, defaultTemplates, customPresets, selectedOptionIds } = get();
        const custom = customPresets.find((p) => p.id === selectedTemplateId);
        if (custom) return custom;
        const template = defaultTemplates.find((t) => t.id === selectedTemplateId);
        if (template) return buildPresetFromTemplate(template, beansGrams, selectedOptionIds[template.id]);
        return buildPresetFromTemplate(defaultTemplates[0], beansGrams);
      },

      addCustomPreset: (preset) =>
        set((state) => ({ customPresets: [...state.customPresets, preset] })),

      updateCustomPreset: (preset) =>
        set((state) => ({
          customPresets: state.customPresets.map((p) => (p.id === preset.id ? preset : p)),
        })),

      deleteCustomPreset: (id) =>
        set((state) => ({ customPresets: state.customPresets.filter((p) => p.id !== id) })),

      duplicateTemplate: (templateId) => {
        const { defaultTemplates, customPresets, beansGrams, selectedOptionIds } = get();
        const template = defaultTemplates.find((t) => t.id === templateId);
        if (template) {
          const newPreset = buildPresetFromTemplate(template, beansGrams, selectedOptionIds[template.id]);
          const duplicate: BrewPreset = {
            ...newPreset,
            id: `custom-${Date.now()}`,
            name: `${newPreset.name}（コピー）`,
            isDefault: false,
          };
          set((state) => ({ customPresets: [...state.customPresets, duplicate] }));
          return duplicate;
        }
        const custom = customPresets.find((p) => p.id === templateId);
        if (custom) {
          const duplicate: BrewPreset = {
            ...custom,
            id: `custom-${Date.now()}`,
            name: `${custom.name}（コピー）`,
            isDefault: false,
          };
          set((state) => ({ customPresets: [...state.customPresets, duplicate] }));
          return duplicate;
        }
        throw new Error(`Preset ${templateId} not found`);
      },

      getAllPresets: () => {
        const { defaultTemplates, customPresets } = get();
        return [...defaultTemplates, ...customPresets];
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        customPresets: state.customPresets,
        selectedTemplateId: state.selectedTemplateId,
        selectedOptionIds: state.selectedOptionIds,
        beansGrams: state.beansGrams,
        servings: state.servings,
        inputMode: state.inputMode,
      }),
    },
  ),
);
