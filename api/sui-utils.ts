import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
//import { execSync } from 'child_process';



export type Network = 'mainnet' | 'testnet' | 'devnet' | 'localnet';

// Use environment variable if available, default to testnet
export const ACTIVE_NETWORK: Network = 'testnet'
//   (import.meta.env.VITE_NETWORK as Network) || 'testnet';

/*export const getActiveAddress = (): string => {
    const address = localStorage.getItem('active_wallet_address');
    if (!address) {
        throw new Error('No active wallet address found');
    }
    return address;
};
*/

export async function getActiveAddress(): Promise<string> {
    const response = await fetch('http://localhost:3001/active-address');
    const data = await response.json();
    return data.address;
};


/*
const SUI_BIN = 'sui';
export const getActiveAddress = () => {
    return execSync(`${SUI_BIN} client active-address`, { encoding: 'utf8' }).trim();
};
*/


/** Get the client for the specified network. */
export const getClient = (network: Network) => {
    return new SuiClient({ url: getFullnodeUrl(network) });
};

/** A helper to sign & execute a transaction using wallet. */
export const signAndExecute = async (
    tx: Transaction,
    network: Network,
    wallet: any  // Replace 'any' with your wallet type
) => {
    const client = getClient(network);

    return client.signAndExecuteTransaction({
        transaction: tx,
        signer: wallet,
        options: {
            showEffects: true,
            showObjectChanges: true,
        },
    });
};

export const validateNetwork = (network: Network) => {
    const validNetworks: Network[] = ['mainnet', 'testnet', 'devnet', 'localnet'];
    if (!validNetworks.includes(network)) {
        throw new Error(`Invalid network: ${network}. Must be one of: ${validNetworks.join(', ')}`);
    }
};

export const getNetworkConfig = (network: Network) => {
    validateNetwork(network);
    return {
        url: getFullnodeUrl(network),
    };
};

export const checkConnection = async (network: Network) => {
    try {
        const client = getClient(network);
        const address = await getActiveAddress();
        await client.getAllBalances({ owner: address });
        return true;
    } catch (error) {
        console.error(`Failed to connect to ${network}:`, error);
        return false;
    }
};

export const setActiveAddress = (address: string) => {
    localStorage.setItem('active_wallet_address', address);
};

export const clearWalletData = () => {
    localStorage.removeItem('active_wallet_address');
};

export const getNetworkFromEnv = (): Network => {
    return 'testnet';
    // return (import.meta.env.VITE_NETWORK as Network) || 'testnet';
};