import { Transaction } from "@mysten/sui/transactions";
import { SuiClient } from "@mysten/sui/client";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { CONFIG } from "../config";
import { ACTIVE_NETWORK, signAndExecute } from "../sui-utils";
import { getActiveAddress } from "../utils/activeAddressManager";

import { bcs } from "@mysten/sui/bcs";

const client = new SuiClient({
  url: "https://fullnode.testnet.sui.io:443",
});

const MNEMONIC = "";
const keypair = Ed25519Keypair.deriveKeypair(MNEMONIC);
const myAddress = keypair.getPublicKey().toSuiAddress();

// const myAddress = getActiveAddress()

async function getCoins() {
  try {
    const coins = await client.getCoins({
      owner: myAddress,
      coinType: "0x2::sui::SUI",
    });
    return coins.data;
  } catch (error) {
    console.error("Error fetching coins:", error);
    throw new Error("Failed to fetch coins");
  }
}

async function checkBalance() {
  try {
    const coins = await getCoins();
    const totalBalance = coins.reduce((acc, coin) => acc + BigInt(coin.balance), BigInt(0));
    return {
      coins,
      totalBalance: totalBalance.toString(),
      formattedBalance: `${Number(totalBalance) / 1000000000} SUI`,
    };
  } catch (error) {
    console.error("Error checking balance:", error);
    throw new Error("Failed to check balance");
  }
}

async function executeSendMessage(
  senderAddress: string,
  recipientAddress: string,
  content: Uint8Array,
  timestamp: number,
) {
  try {
    const balanceInfo = await checkBalance();
    if (BigInt(balanceInfo.totalBalance) === BigInt(0)) {
      throw new Error("No balance available. Please request tokens from the faucet.");
    }

    if (balanceInfo.coins.length === 0) {
      throw new Error("No coin objects found. Please request tokens from the faucet.");
    }

    const tx = new Transaction();

    tx.moveCall({
      target: `${CONFIG.MESSAGE_CONTRACT.packageId}::send_message::send_message`,
      arguments: [
        tx.pure(bcs.Address.serialize(senderAddress)),
        tx.pure(bcs.Address.serialize(recipientAddress)),
        tx.pure(content),
        tx.pure(bcs.U64.serialize(timestamp)),
      ],
    });

    // Chloe's sign and execute using keypair derived from MNEMONIC
    const result = await client.signAndExecuteTransaction({
      signer: keypair,
      transaction: tx,
      options: {
        showEvents: true,
        showEffects: true,
      },
    });

    // sign and execute helper doing the same thing without MNEMONIC
    // const result = await signAndExecute(tx, ACTIVE_NETWORK)

    console.log("Transaction result:", result);
    return result;
  } catch (error) {
    console.error("Transaction failed:", error);
    throw error;
  }
}

async function main() {
  try {
    console.log("My address:", myAddress);

    // Check balance first
    const balanceInfo = await checkBalance();
    console.log("Available balance:", balanceInfo.formattedBalance);
    console.log("Number of coins:", balanceInfo.coins.length);

    if (BigInt(balanceInfo.totalBalance) === BigInt(0)) {
      console.log("Please request tokens from the faucet first!");
      return;
    }

    const sender = myAddress;
    const recipient = "0xc5b4d28027c266bf80603617796513f9b7afc0f66957ead0a94b4d78e1b9671f";
    const content = new TextEncoder().encode("message 1");
    const timestamp = Date.now();

    console.log("\nSending message:");
    console.log("From:", sender);
    console.log("To:", recipient);
    console.log("Content:", new TextDecoder().decode(content));
    console.log("Timestamp:", timestamp);

    await executeSendMessage(sender, recipient, content, timestamp);
  } catch (error) {
    console.error("\nProgram failed:", error instanceof Error ? error.message : "Unknown error");
    process.exit(1);
  }
}

main().catch(console.error);
