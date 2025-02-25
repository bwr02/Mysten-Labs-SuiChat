module chat::public_keys {
    public struct UserPublicKey has key, store {
        id: object::UID,
        wallet_address: address,
        public_key: vector<u8>,
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
            },
            tx_context::sender(ctx)
        );
    }
}
