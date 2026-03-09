interface ImportMetaEnv {
  readonly VITE_GATEWAY: string
  readonly DEV: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
