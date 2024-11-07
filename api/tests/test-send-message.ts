import { TransactionBlock } from '@mysten/sui.js/transactions';
import { SuiClient } from '@mysten/sui.js/client';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';

const PACKAGE_ID = '0x6f06ff51a46a11e1eacb086822eb42405a1c4636971a4d8b8eccdf55c3b39a9d';

const client = new SuiClient({
    url: 'https://fullnode.testnet.sui.io:443',
});

const MNEMONIC = "";
const keypair = Ed25519Keypair.deriveKeypair(MNEMONIC);
const myAddress = keypair.getPublicKey().toSuiAddress();

async function getCoins() {
    try {
        const coins = await client.getCoins({
            owner: myAddress,
            coinType: '0x2::sui::SUI'
        });
        return coins.data;
    } catch (error) {
        console.error('Error fetching coins:', error);
        throw new Error('Failed to fetch coins');
    }
}

async function checkBalance() {
    try {
        const coins = await getCoins();
        const totalBalance = coins.reduce((acc, coin) => acc + BigInt(coin.balance), BigInt(0));
        return {
            coins,
            totalBalance: totalBalance.toString(),
            formattedBalance: `${Number(totalBalance) / 1000000000} SUI`
        };
    } catch (error) {
        console.error('Error checking balance:', error);
        throw new Error('Failed to check balance');
    }
}

async function executeSendMessage(
    senderAddress: string,
    recipientAddress: string,
    content: Uint8Array,
    timestamp: number
) {
    try {
        const balanceInfo = await checkBalance();
        if (BigInt(balanceInfo.totalBalance) === BigInt(0)) {
            throw new Error('No balance available. Please request tokens from the faucet.');
        }

        if (balanceInfo.coins.length === 0) {
            throw new Error('No coin objects found. Please request tokens from the faucet.');
        }
        
        const tx = new TransactionBlock();
        
        tx.moveCall({
            target: `${PACKAGE_ID}::send_message::send_message`,
            arguments: [
                tx.pure(senderAddress),
                tx.pure(recipientAddress),
                tx.pure(Array.from(content)),
                tx.pure(BigInt(timestamp))
            ],
        });

        const result = await client.signAndExecuteTransactionBlock({
            signer: keypair,
            transactionBlock: tx,
            options: {
                showEvents: true,
                showEffects: true,
            },
        });

        console.log("Transaction result:", result);
        return result;
    } catch (error) {
        console.error("Transaction failed:", error);
        throw error;
    }
}

async function main() {
    try {
        console.log('My address:', myAddress);
        
        // Check balance first
        const balanceInfo = await checkBalance();
        console.log('Available balance:', balanceInfo.formattedBalance);
        console.log('Number of coins:', balanceInfo.coins.length);

        if (BigInt(balanceInfo.totalBalance) === BigInt(0)) {
            console.log('Please request tokens from the faucet first!');
            return;
        }

        const sender = myAddress;
        const recipient = '0xc5b4d28027c266bf80603617796513f9b7afc0f66957ead0a94b4d78e1b9671f';
        const content = new TextEncoder().encode("Hello, world!");
        const timestamp = Date.now();

        console.log('\nSending message:');
        console.log('From:', sender);
        console.log('To:', recipient);
        console.log('Content:', new TextDecoder().decode(content));
        console.log('Timestamp:', timestamp);

        await executeSendMessage(sender, recipient, content, timestamp);
    } catch (error) {
        console.error('\nProgram failed:', error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
    }
}

main().catch(console.error);