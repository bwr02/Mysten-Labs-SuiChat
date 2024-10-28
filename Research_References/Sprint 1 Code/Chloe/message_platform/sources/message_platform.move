
module message_platform::message_platform {

    //  struct definitions
    public struct Message has key, store {
        id: UID,
        sender: address,
        recipient: address,
        content: vector<u8>,
        timestamp: u64,
    }

    public struct Chat has key, store {
        id: UID,
        messages: vector<Message>,
    }
    
    //  module initializer, executed when module is published
    fun init(ctx: &mut TxContext) {
        let chat = Chat {
            id: object::new(ctx),
            messages: vector::empty<Message>(),
        };
        transfer::transfer(chat, ctx.sender());
    }

    //  accessors to read struct fields
    public fun sender(self: &Message): address {
        self.sender
    }

    public fun recipient(self: &Message): address {
        self.recipient
    }

    public fun content(self: &Message): &vector<u8> {
        &self.content
    }

    public fun timestamp(self: &Message): u64 {
        self.timestamp
    }

    public fun messages(self: &Chat): &vector<Message> {
        &self.messages
    }

    //  public/entry functions
    public fun send_message(
        chat: &mut Chat,
        sender: address,
        recipient: address,
        content: vector<u8>,
        timestamp: u64,
        ctx: &mut TxContext,
    ) {
        let message = Message {
            id: object::new(ctx),
            sender,
            recipient,
            content,
            timestamp,
        };
        vector::push_back(&mut chat.messages, message);
    }

    public fun get_message_at_index(self: &Chat, index: u64): &Message {
        vector::borrow(&self.messages, index)
    }
        /*
    ----------THIS IS THE COMMAND I USED TO CREATE A NEW MESSAGE OBJECT AFTER BUILDING AND PUBLISHING:----------
    sui client ptb --assign chat @<CHAT_OBJECT_ID> \
    --assign sender @<SENDER_ADDRESS> \
    --assign recipient @<RECIPIENT_ADDRESS> \
    --assign content '"<MESSAGE_CONTENT>"' \
    --move-call <PACKAGE_ID>::message_platform::send_message chat sender recipient content <TIMESTAMP> \
    --gas-budget 20000000
    */

    // tests
    // #[test]
    // fun test_module_init() {
    //     use sui::test_scenario;

    //     let chat = @0xAD;
    //     let sender = @0xCAFE;

    //     // First transaction to emulate module initialization
    //     let mut scenario = test_scenario::begin(chat);

    //     {
    //         init(scenario.ctx());
    //     };

    //     // Second transaction to check if the chat has been created
    //     // and has initial state of containing no Messages
    //     scenario.next_tx(chat);
    //     {
    //         let chat = scenario.take_from_sender<Chat>();
    //         // Verify number of Messages in chat
    //         assert!()
    //     }




    // }


    // #[test]
    // fun test_send_message() {
    //     use sui::test_scenario;

    //     let sender = @0xCAFE; 
    //     let recipient = @0xFACE;



    //     // Create a dummy transaction context
    //     let mut ctx = tx_context::dummy();
        
    //     // Initialize a new Chat
    //     let mut chat = Chat { 
    //         id: object::new(&mut ctx), 
    //         messages: vector::empty<Message>(),
    //     };

    //     // Define addresses and timestamp
        
    //     let timestamp: u64 = 1234567890;

    //     // Initialize message content
    //     let content = b"HelloWorld"; 

    //     // Create a Message
    //     let message = Message {
    //         id: object::new(&mut ctx),
    //         sender,
    //         recipient,
    //         content: vector<u8>::from(content), // Convert content to vector<u8>
    //         timestamp,
    //     };

    //     // Send the message (push to the vector)
    //     vector::push_back(&mut chat.messages, message);

    //     // Validate the message was sent
    //     let messages = messages(&chat);
    //     assert!(vector::length(messages) == 1, "Expected 1 message in chat");

    //     let message = vector::borrow(messages, 0);
    //     assert!((*message).sender() == sender, "Sender mismatch");
    //     assert!((*message).recipient() == recipient, "Recipient mismatch");
    //     assert!((*message).content() == &vector<u8>::from(content), "Content mismatch");
    //     assert!((*message).timestamp() == timestamp, "Timestamp mismatch"); 
    // }

}