interface Environment {
    NETWORK_URL: string;
}

export const env: Environment = {
    NETWORK_URL: import.meta.env.VITE_NETWORK_URL || 'https://fullnode.testnet.sui.io:443',
};
