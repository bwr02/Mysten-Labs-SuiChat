// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import { homedir } from "os";
import path from "path";
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Transaction } from "@mysten/sui/transactions";
import { fromB64 } from "@mysten/sui/utils";
import { bcs } from "@mysten/sui/bcs";
import { getActiveAddress } from "./utils/activeAddressManager";

export type Network = "mainnet" | "testnet" | "devnet" | "localnet";

export const ACTIVE_NETWORK = (process.env.NETWORK as Network) || "testnet";

export const SUI_BIN = `sui`;

/** Returns a signer based on the active address of system's sui. */
export const getSigner = () => {
  const sender = getActiveAddress();

  const keystore = JSON.parse(
    readFileSync(path.join(homedir(), ".sui", "sui_config", "sui.keystore"), "utf8"),
  );

  for (const priv of keystore) {
    const raw = fromB64(priv);
    if (raw[0] !== 0) {
      continue;
    }

    const pair = Ed25519Keypair.fromSecretKey(raw.slice(1));
    if (pair.getPublicKey().toSuiAddress() === sender) {
      return pair;
    }
  }

  throw new Error(`keypair not found for sender: ${sender}`);
};

/** Get the client for the specified network. */
export const getClient = (network: Network) => {
  return new SuiClient({ url: getFullnodeUrl(network) });
};

/** A helper to sign & execute a transaction. */
export const signAndExecute = async (tx: Transaction, network: Network) => {
  const client = getClient(network);
  const signer = getSigner();

  return client.signAndExecuteTransaction({
    transaction: tx,
    signer,
    options: {
      showEffects: true,
      showObjectChanges: true,
    },
  });
};

/** Publishes a package and saves the package id to a specified json file. */
export const publishPackage = async ({
  packagePath,
  network,
  exportFileName = "contract",
}: {
  packagePath: string;
  network: Network;
  exportFileName: string;
}) => {
  const tx = new Transaction();

  const { modules, dependencies } = JSON.parse(
    execSync(`${SUI_BIN} move build --dump-bytecode-as-base64 --path ${packagePath}`, {
      encoding: "utf-8",
    }),
  );

  const [upgradeCap] = tx.publish({
    modules,
    dependencies,
  });

  // Transfer the upgrade capability to the sender so they can upgrade the package later if they want.
  tx.transferObjects([upgradeCap], tx.pure(bcs.Address.serialize(getActiveAddress())));

  const results = await signAndExecute(tx, network);

  const packageId = results.objectChanges?.find((x) => x.type === "published")?.packageId;

  if (!packageId) {
    throw new Error("Failed to get package ID from transaction results");
  }

  // save to an env file
  writeFileSync(
    `${exportFileName}.json`,
    JSON.stringify({
      packageId,
    }),
    { encoding: "utf8", flag: "w" },
  );

  return packageId;
};

// Add some utility functions for error handling and validation
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

// Add a function to check connection
export const checkConnection = async (network: Network) => {
  try {
    const client = getClient(network);
    await client.getAllBalances({ owner: getActiveAddress() });
    return true;
  } catch (error) {
    console.error(`Failed to connect to ${network}:`, error);
    return false;
  }
};
