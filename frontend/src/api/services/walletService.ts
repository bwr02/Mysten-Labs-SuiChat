import { suiClient } from '../suiClient';

export interface BalanceInfo {
    coins: any[];
    totalBalance: string;
    formattedBalance: string;
}

export const getUserCoins = async (address: string) => {
    try {
        const coins = await suiClient.getCoins({
            owner: address,
            coinType: '0x2::sui::SUI'
        });
        return coins.data;
    } catch (error) {
        console.error('Error fetching coins:', error);
        throw new Error('Failed to fetch coins');
    }
};


export const checkBalance = async (address: string): Promise<BalanceInfo> => {
    try {
        const coins = await getUserCoins(address);
        const totalBalance = coins.reduce((acc, coin) => acc + BigInt(coin.balance), BigInt(0));
        if (BigInt(totalBalance) === BigInt(0) || coins.length === 0) {
            throw new Error('Insufficient balance. Please request tokens from the faucet.');
        }
        return {
            coins,
            totalBalance: totalBalance.toString(),
            formattedBalance: `${Number(totalBalance) / 1000000000} SUI`
        };
    } catch (error) {
        console.error('Error checking balance:', error);
        throw new Error('Failed to check balance');
    }
};