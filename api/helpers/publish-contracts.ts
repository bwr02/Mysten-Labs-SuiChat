import { publishPackage } from '../sui-utils';

/// A demo showing how we could publish the escrow contract
/// and our DEMO objects contract.
///
/// We're publishing both as part of our demo.
(async () => {
	await publishPackage({
		packagePath: __dirname + '/../../contracts',
		network: 'testnet',
		exportFileName: 'message-contract',
	});
})();