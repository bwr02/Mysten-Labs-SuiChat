module message_platform::message_platform {
    use sui::event;

    // copy is needed because emit needs to make a copy of the event when emitting it
    public struct MessageCreated has copy, drop{
        sender: address,
        recipient: address,
        content: vector<u8>,
        timestamp: u64,
    }

    // Function to send a message and emit an event
    public fun send_message(
        sender: address,
        recipient: address,
        content: vector<u8>,
        timestamp: u64,
    ) {
        // Create a message event
        let message_event = MessageCreated {
            sender,
            recipient,
            content,
            timestamp,
        };
        
        // Emit the event
        event::emit(message_event);
    }

    // #[test]
    // fun test_send_message() {
    //     use sui::test_scenario;
    //     use sui::tx_context;

    //     let sender = @0xCAFE; 
    //     let recipient = @0xFACE;

    //     // Create a dummy transaction context
    //     let mut ctx = tx_context::dummy();

    //     // Define a timestamp
    //     let timestamp: u64 = 1234567890;

    //     // Initialize message content
    //     let content = b"HelloWorld"; 

    //     // Send the message
    //     send_message(sender, recipient, vector<u8>::from(content), timestamp);

    //     // Validate that the event was emitted
    //     let event_log = event::get_events(); // Get emitted events
    //     assert!(vector::length(event_log) > 0, "No events emitted");

    //     // Find the last event emitted
    //     let last_event = vector::borrow(event_log, vector::length(event_log) - 1);
        
    //     // Assert that the last event is of type MessageCreated
    //     assert!(last_event.type_id() == MessageCreated::type_id(), "Last event is not of type MessageCreated");
        
    //     // Validate the contents of the emitted event
    //     assert!(last_event.sender == sender, "Sender mismatch");
    //     assert!(last_event.recipient == recipient, "Recipient mismatch");
    //     assert!(last_event.content == vector<u8>::from(content), "Content mismatch");
    //     assert!(last_event.timestamp == timestamp, "Timestamp mismatch");
    // }
}
