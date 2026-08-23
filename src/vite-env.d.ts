/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE?: string
  readonly VITE_APP_URL?: string
  readonly VITE_CONTRACT_ENV?: string
  readonly VITE_CONTRACT_VERSION?: string
  readonly VITE_HORIZON_URL?: string
  readonly VITE_LOG_LEVEL?: string
  readonly VITE_LP_LOCKER_CONTRACT?: string
  readonly VITE_NETWORK?: string
  readonly VITE_PLAUSIBLE_API_HOST?: string
  readonly VITE_PLAUSIBLE_DOMAIN?: string
  readonly VITE_PLAUSIBLE_INTEGRITY?: string
  readonly VITE_RPC_URL?: string
  readonly VITE_SENTRY_DSN?: string
  readonly VITE_TOKEN_LOCKER_CONTRACT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
