module cleartext::message {
    use sui::event;

    // Define the Message struct
    public struct Message has copy, drop, store {
        content: vector<u8>,
        sender: address,
        receiver: address,
        timestamp: u64,
    }

    // Function to emit a message as an event
    public fun create_message(
        sender: address,
        receiver: address,
        content: vector<u8>,
        timestamp: u64,
    ) {
        let message = Message { content, sender, receiver, timestamp };
        event::emit<Message>(message);  // Emit the message as an event
    }
}
