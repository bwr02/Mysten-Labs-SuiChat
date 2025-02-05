import { Transaction } from "@mysten/sui/transactions";
import { CONFIG } from "../config";
import { checkBalance } from "./walletService";
import { normalizeSuiAddress } from "@mysten/sui/utils";
import { bcs } from "@mysten/sui/bcs";
import {
  deriveKeysFromSignature,
  generateSharedSecret,
  encrypt,
  getOrCreateSignature,
} from "./cryptoService";
import { WalletContextState } from "@suiet/wallet-kit";
import { SendMessageParams } from "../../types/types";

export const sendMessage = async ({
  senderAddress,
  recipientAddress,
  recipientPub,
  content,
  wallet,
}: SendMessageParams & { wallet: WalletContextState }) => {
  try {
    const normalizedSenderAddress = normalizeSuiAddress(senderAddress);
    const balanceInfo = await checkBalance(normalizedSenderAddress);
    if (
      BigInt(balanceInfo.totalBalance) === BigInt(0) ||
      balanceInfo.coins.length === 0
    ) {
      throw new Error(
        "Insufficient balance. Please request tokens from the faucet.",
      );
    }

    const signature = await getOrCreateSignature(wallet);
    const { privateKey: senderPriv } = deriveKeysFromSignature(signature);
    const sharedSecret = generateSharedSecret(senderPriv, recipientPub);
    // console.log("SENDER SHARED SECRET: " + sharedSecret);
    const encryptedContent = encrypt(content, sharedSecret);

    const tx = new Transaction();
    const timestamp = Date.now();

    tx.moveCall({
      target: `${CONFIG.MESSAGE_CONTRACT.packageId}::send_message::send_message`,
      arguments: [
        tx.pure(bcs.Address.serialize(senderAddress)),
        tx.pure(bcs.Address.serialize(recipientAddress)),
        tx.pure(bcs.String.serialize(encryptedContent)),
        tx.pure(bcs.U64.serialize(timestamp)),
      ],
    });

    const result = await wallet.signAndExecuteTransaction({
      transaction: tx,
    });

    return {
      success: true,
      txId: result.digest,
      timestamp,
      result,
    };
  } catch (error) {
    console.error("Failed to send message:", error);
    throw error;
  }
};
