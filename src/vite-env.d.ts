interface ImportMetaEnv {
  readonly VITE_GATEWAY: string
  readonly DEV: boolean
  readonly PROD: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
