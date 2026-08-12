import { registerPlugin } from "@capacitor/core";
import { Preferences } from "@capacitor/preferences";

export type DurableStorePlugin = {
  get(options: { key: string }): Promise<{ value: string | null }>;
  set(options: { key: string; value: string }): Promise<void>;
  remove(options: { key: string }): Promise<void>;
  getLegacy(options: { key: string }): Promise<{ value: string | null }>;
  clearLegacy(): Promise<void>;
};

export const DurableStore = registerPlugin<DurableStorePlugin>("DurableStore", {
  web: () => Promise.resolve({
    get: (options: { key: string }) => Preferences.get(options),
    set: (options: { key: string; value: string }) => Preferences.set(options),
    remove: (options: { key: string }) => Preferences.remove(options),
    getLegacy: (options: { key: string }) => Preferences.get(options),
    clearLegacy: () => Preferences.clear(),
  }),
});
