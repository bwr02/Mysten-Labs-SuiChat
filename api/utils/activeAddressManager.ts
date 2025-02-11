// activeAddressStore.ts

import { writeFileSync, readFileSync, existsSync } from 'fs';
import path from 'path';

const ACTIVE_ADDRESS_FILE = path.join(__dirname, 'activeAddress.json');

export const setActiveAddress = (address: string): void => {
    const trimmed = address.trim();
    writeFileSync(ACTIVE_ADDRESS_FILE, JSON.stringify({ activeAddress: trimmed }), { encoding: 'utf8' });
};

export const getActiveAddress = (): string => {
    if (!existsSync(ACTIVE_ADDRESS_FILE)) return '';
    const data = JSON.parse(readFileSync(ACTIVE_ADDRESS_FILE, { encoding: 'utf8' }));
    return data.activeAddress || '';
};