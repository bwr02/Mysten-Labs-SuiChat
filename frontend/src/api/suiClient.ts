import { SuiClient } from '@mysten/sui.js/client';

export const suiClient = new SuiClient({
    url: import.meta.env.VITE_NETWORK_URL || 'https://fullnode.testnet.sui.io:443'
});