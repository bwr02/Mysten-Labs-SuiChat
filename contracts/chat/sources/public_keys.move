module chat::public_keys {
    /// `has key` ability allows the object to be stored and used as a global resource.
    public struct UserPublicKey has key, store {
        id: UID,
        wallet_address: address,
        public_key: vector<u8>,
        // optionally add version/timestamp
    }

    /// creates a new UserPublicKey object and returns it.
    public fun publish_key(ctx: &mut TxContext, wallet_address: address, public_key: vector<u8>): UserPublicKey {
        UserPublicKey {
            id: object::new(ctx),
            wallet_address,
            public_key,
        }
    }
}
