module cleartext_package::chat {

    // Part 1: These imports are provided by default
    // use sui::object::{Self, UID};
    // use sui::transfer;
    // use sui::tx_context::{Self, TxContext};
    use std::string::String;
    // use std::string;

    // Part 2: struct definitions
    public struct Message has key, store {
        id: UID,
        text: String,
    }

    public struct Chat has key {
        id: UID,
        num_messages: u64,
    }

    // Part 3: Module initializer to be executed when this module is published
    fun init(ctx: &mut TxContext) {
        let admin = Chat {
            id: object::new(ctx),
            num_messages: 0,
        };

        // Transfer the forge object to the module/package publisher
        transfer::transfer(admin, ctx.sender());
    }

    // Part 4: Accessors required to read the struct fields
    public fun text(self: &Message): String {
        self.text
    }

    public fun num_messages(self: &Chat): u64 {
        self.num_messages
    }

    // Part 5: Public/entry functions (introduced later in the tutorial)
    // public fun sword_create(magic: u64, strength: u64, ctx: &mut TxContext): Sword {
    //     Sword {
    //         id: object::new(ctx),
    //         magic: magic,
    //         strength: strength,
    //     }
    // }

    public fun new_message(
        chat: &mut Chat,
        text: String,
        ctx: &mut TxContext,): Message {
        chat.num_messages = chat.num_messages + 1;
        Message {
            id: object::new(ctx),
            text: text
        }
    }
    
    // Part 6: Tests

    #[test]
    fun test_text_create() {
        use std::debug;
        // Create a dummy TxContext for testing
        let mut ctx = tx_context::dummy();

        // Create a sword
        let message = Message {
            id: object::new(&mut ctx),
            text: std::string::utf8(b"Hello World"),
        };

        // Check if accessor functions return correct values
        debug::print(&message.text());
        assert!(message.text() == std::string::utf8(b"Hello World"), 1);
        let dummy_address = @0xCAFE;
        transfer::public_transfer(message, dummy_address);
    }

    #[test]
    fun test_messaging() {
        use sui::test_scenario;

        // Create test addresses representing users
        let admin = @0xAD;
        let user_a = @0xCAFE;
        let user_b = @0xFACE;
        let text = std::string::utf8(b"Hello World");

        // First transaction executed by initial owner to create the sword
        let mut scenario = test_scenario::begin(admin);
        {
            init(scenario.ctx());
        };

        scenario.next_tx(admin);
        {
            let mut chat = scenario.take_from_sender<Chat>();
            let message = chat.new_message(text, scenario.ctx());
            let message_clone = chat.new_message(text, scenario.ctx());
            transfer::public_transfer(message, user_a);
            transfer::public_transfer(message_clone, user_b);
            scenario.return_to_sender(chat);
        };

        // Second transaction executed by the initial sword owner
        scenario.next_tx(user_b);
        {
            // Extract the sword owned by the initial owner
            let message = scenario.take_from_sender<Message>();
            // Transfer the sword to the final owner
            assert!(message.text() == text, 1);
            scenario.return_to_sender(message);
        };

        scenario.next_tx(user_a);
        {
            // Extract the sword owned by the initial owner
            let message = scenario.take_from_sender<Message>();
            // Transfer the sword to the final owner
            assert!(message.text() == text, 1);
            scenario.return_to_sender(message);
        };

        scenario.end();
    }

    #[test]
    fun test_module_init() {
        use sui::test_scenario;

        // Create test addresses representing users
        let admin = @0xAD;
        let initial_owner = @0xCAFE;

        // First transaction to emulate module initialization
        let mut scenario = test_scenario::begin(admin);
        {
            init(scenario.ctx());
        };

        // Second transaction to check if the forge has been created
        // and has initial value of zero swords created
        scenario.next_tx(admin);
        {
            // Extract the Forge object
            let chat = scenario.take_from_sender<Chat>();
            // Verify number of created swords
            assert!(chat.num_messages() == 0, 1);
            // Return the Forge object to the object pool
            scenario.return_to_sender(chat);
        };

        // Third transaction executed by admin to create the sword
        scenario.next_tx(admin);
        {
            let mut chat = scenario.take_from_sender<Chat>();
            // Create the sword and transfer it to the initial owner
            let message = chat.new_message(std::string::utf8(b"Hello World"), scenario.ctx());
            transfer::public_transfer(message, initial_owner);
            scenario.return_to_sender(chat);
        };
        scenario.end();
    }
}
