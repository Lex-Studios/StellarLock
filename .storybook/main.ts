import type { StorybookConfig } from "@storybook/react-vite"

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx|js|jsx)"],
  addons: [
    "@storybook/addon-onboarding",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "@storybook/addon-a11y",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  docs: {
    autodocs: "tag",
  },
  viteFinal: (config) => {
    // Vite's loadEnv merges process.env VITE_* vars into import.meta.env, so setting
    // these here prevents the ENV module from throwing when no .env file is present.
    process.env.VITE_NETWORK ??= "testnet"
    process.env.VITE_RPC_URL ??= "https://soroban-testnet.stellar.org"
    process.env.VITE_HORIZON_URL ??= "https://horizon-testnet.stellar.org"
    process.env.VITE_CONTRACT_ENV ??= "testnet"
    process.env.VITE_CONTRACT_VERSION ??= "v1"
    process.env.VITE_TOKEN_LOCKER_CONTRACT ??= "CBFCKEOQRQIXKLGU4QBUQVOINOKFBOXJ37LXEKLKNUO6TW4FNGDU26AW"
    process.env.VITE_LP_LOCKER_CONTRACT ??= "CA3WYETNIF5IAF3VUNQ3SYKZFV45TOFBF7CEZ46I7QEBPWTRM73WLEI4"
    return config
  },
}
export default config
