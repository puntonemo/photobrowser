/// <reference types="vite/client" /> // Puedes omitir si no usas Vite

export {};

declare global {
    interface ImportMetaEnv {
        readonly CLIENT_BASE_URL?: string;
        readonly CONFIG_NAME?: string;
    }

    interface ImportMeta {
        readonly env: ImportMetaEnv;
    }
}
