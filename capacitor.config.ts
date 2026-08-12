import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "family.mili.beads",
  appName: "米粒拼豆社",
  webDir: "native-web",
  server: {
    url: "https://mili-bead-studio.zonglin-xie.chatgpt.site",
    cleartext: false,
  },
  ios: { contentInset: "always" },
  android: { allowMixedContent: false },
};

export default config;
