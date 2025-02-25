// const { registerPublicKeyOnChain, fetchUserPublicKey } = require("./pubKeyService.cjs");
const { getWalletProvider } = require("@mysten/wallet-adapter");

async function connectWallet() {
    console.log("🔄 Connecting to the wallet...");

    // Initialize wallet adapter manually
    const wallet = await getWalletProvider();
    if (!wallet) {
        throw new Error("❌ No wallet found. Please connect a wallet.");
    }

    // Ensure the wallet is connected
    const accounts = await wallet.getAccounts();
    if (!accounts.length) {
        throw new Error("❌ No active wallet account found.");
    }

    return { wallet, senderAddress: accounts[0] };
}

/**
 * Registers a public key on-chain and then retrieves it to verify.
 * @param {Object} wallet - The wallet instance from @suiet/wallet-kit.
 * @param {string} senderAddress - The sender's Sui address.
 */
// async function registerAndFetchPublicKey() {
//     try {
//         const address = "0x52e9546226cc1d1616d78f3324dc76e972d5de62e0bdb357d4865a4b9c139379";
//         const publicKey = new Uint8Array([
//         127,  38,  71,  51, 217, 114,  46,  70,
//         80,  12, 134,  16, 236, 172,  73, 153,
//         200, 220, 148,  42,  72,  54, 189,  41,
//         13, 240,  56, 120, 132, 190, 143,  47
//         ]);


//         const txDigest = await registerPublicKeyOnChain(wallet, normalizedAddress, publicKey);
//         console.log(`✅ Public key registered successfully! Transaction Digest: ${txDigest}`);

//         // Wait for some time to ensure on-chain registration (optional)
//         await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds

//         // Fetch the stored public key from the blockchain
//         console.log(`Fetching public key for address: ${normalizedAddress}...`);
//         const retrievedKey = await fetchUserPublicKey(normalizedAddress);

//         if (retrievedKey) {
//             console.log("✅ Retrieved Public Key:", retrievedKey);
//             console.log(
//                 "✅ Public key matches:",
//                 Buffer.from(retrievedKey).toString("hex") === Buffer.from(publicKey).toString("hex")
//             );
//         } else {
//             console.log("❌ Public key not found on-chain.");
//         }
//     } catch (error) {
//         console.error("🚨 Error in registering or fetching public key:", error);
//     }
// }

connectWallet();