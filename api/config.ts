// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
import { readFileSync } from 'fs';
import { Network } from './sui-utils';
import path from 'path';

/// We assume our config files are in the format: { "packageId": "0x..." }
const parseConfigurationFile = (fileName: string) => {
    try {
        const filePath = path.join(__dirname, `${fileName}.json`);
        return JSON.parse(readFileSync(filePath, 'utf8'));
    } catch (e) {
        throw new Error(`Missing config file ${fileName}.json`);
    }
};

/**
 * A default configuration
 * You need to call `publish-contracts.ts` before running any functionality
 * depends on it, or update our imports to not use these json files.
 * */
export const CONFIG = {
	/// Look for events every 1s
	POLLING_INTERVAL_MS: 1000,
	DEFAULT_LIMIT: 50,
	NETWORK: (process.env.NETWORK as Network) || 'testnet',
	MESSAGE_CONTRACT: parseConfigurationFile('message-contract'),
};
