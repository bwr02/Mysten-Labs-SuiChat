import { SuinsClient } from '@mysten/suins';
import { suiClient } from './suiClient';
 
export const suinsClient = new SuinsClient({
	client: suiClient,
	network: 'testnet',
});