module chat::public_keys {
    public struct UserPublicKey has key, store {
        id: object::UID,
        wallet_address: address,
        public_key: vector<u8>,
        timestamp: u64,
    }

    public entry fun publish_key(
        wallet_address: address,
        public_key: vector<u8>,
        ctx: &mut tx_context::TxContext
    ) {
        transfer::transfer(
            UserPublicKey {
                id: object::new(ctx),
                wallet_address,
                public_key,
                timestamp: tx_context::epoch(ctx),
            },
            tx_context::sender(ctx)
        );
    }
}
