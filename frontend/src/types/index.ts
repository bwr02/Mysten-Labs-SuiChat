export interface SuietWallet {
    connect(): Promise<void>;
    getAccounts(): Promise<string[]>;
    signMessage(params: { message: Uint8Array }): Promise<string>;
    signAndExecuteTransaction(params: { transaction: any }): Promise<any>;
}

declare global {
    interface Window {
        suiet?: SuietWallet;
    }
}
