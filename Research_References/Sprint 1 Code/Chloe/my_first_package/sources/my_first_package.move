
module my_first_package::my_first_package {
    // Part 1: These imports are provided by default
    // use sui::object::{Self, UID};
    // use sui::transfer;
    // use sui::tx_context::{Self, TxContext};

    // Part 2: struct definitions
    public struct Sword has key, store {
        id: UID,
        magic: u64,
        strength: u64,
    }

    public struct Forge has key {
        id: UID,
        swords_created: u64,
    }

    // Part 3: Module initializer to be executed when this module is published
    fun init(ctx: &mut TxContext) {
        let admin = Forge {
            id: object::new(ctx),
            swords_created: 0,
        };

        // Transfer the forge object to the module/package publisher
        transfer::transfer(admin, ctx.sender());
    }

    // Part 4: Accessors required to read the struct fields
    public fun magic(self: &Sword): u64 {
        self.magic
    }

    public fun strength(self: &Sword): u64 {
        self.strength
    }

    public fun swords_created(self: &Forge): u64 {
        self.swords_created
    }

    public fun create_sword(ctx: &mut TxContext): Sword {
        let sword = Sword {
            id: object::new(ctx),
            magic: 50,
            strength: 100,
        };
        sword
    }


    // Part 5: Public/entry functions (intr)

    // Part 6: Tests
    #[test]
    fun test_sword_create() {
        // Create a dummy TxContext for testing
        let mut ctx = tx_context::dummy();

        // Create a sword
        let sword = Sword {
            id: object::new(&mut ctx),
            magic: 42,
            strength: 7,
        };

        // Check if accessor functions return correct values
        assert!(sword.magic() == 42 && sword.strength() == 7, 1);

        let dummy_address = @0xCAFE;
        transfer::public_transfer(sword, dummy_address);
    }
}
