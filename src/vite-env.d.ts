/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optionaler kostenloser API-Key für xeno-canto.org (Gesangsaufnahmen). */
  readonly VITE_XENO_CANTO_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
