module chat::public_keys {
    /// `has key` ability allows the object to be stored and used as a global resource.
    public struct UserPublicKey has key, store {
        id: UID,
        owner: address,
        key: vector<u8>,
        // optionally add version/timestamp
    }

    /// creates a new UserPublicKey object and returns it.
    public fun publish_key(ctx: &mut TxContext, owner: address, key: vector<u8>): UserPublicKey {
        UserPublicKey {
            id: object::new(ctx),
            owner,
            key,
        }
    }

    /// update the user's public key. in the future: add access control to ensure that only the owner can update their key.
    public fun update_key(pub_key: &mut UserPublicKey, new_key: vector<u8>) {
        // for example, a simple check could be enforced (if needed)
        // require(pub_key.owner == sender, 1);
        pub_key.key = new_key;
    }
}
