interface Environment {
    WALLET_MNEMONIC: string;
    NETWORK_URL: string;
}

export const env: Environment = {
    WALLET_MNEMONIC: import.meta.env.VITE_WALLET_MNEMONIC || '',
    NETWORK_URL: import.meta.env.VITE_NETWORK_URL || 'https://fullnode.testnet.sui.io:443',
};
