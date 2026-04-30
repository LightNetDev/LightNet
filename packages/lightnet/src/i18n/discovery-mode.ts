export const isTranslationDiscoveryEnabled = () =>
  !import.meta.env.DEV && process.env.LIGHTNET_TRANSLATION_DISCOVERY === "1"
