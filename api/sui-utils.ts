import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { getActiveAddress } from './utils/activeAddressManager';

export type Network = "mainnet" | "testnet" | "devnet" | "localnet";

// Use environment variable if available, default to testnet
export const ACTIVE_NETWORK: Network = 'testnet'
//  TODO: remove hardcoded active network (import.meta.env.VITE_NETWORK as Network) || 'testnet';

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
  const validNetworks: Network[] = ["mainnet", "testnet", "devnet", "localnet"];
  if (!validNetworks.includes(network)) {
    throw new Error(`Invalid network: ${network}. Must be one of: ${validNetworks.join(", ")}`);
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
        const address = getActiveAddress();
        await client.getAllBalances({ owner: address });
        return true;
    } catch (error) {
        console.error(`Failed to connect to ${network}:`, error);
        return false;
    }
};

