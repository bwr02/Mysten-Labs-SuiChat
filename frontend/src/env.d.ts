/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_WALLET_MNEMONIC: string
    readonly VITE_NETWORK_URL: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
