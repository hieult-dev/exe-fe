interface ImportMetaEnv {
  readonly VITE_GATEWAY: string
  readonly VITE_PROXY_TARGET?: string
  readonly DEV: boolean
  readonly PROD: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
