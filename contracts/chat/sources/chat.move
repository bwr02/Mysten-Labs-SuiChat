module chat::send_message {
    use sui::event;

    // copy is needed because emit needs to make a copy of the event when emitting it
    public struct MessageCreated has copy, drop{
        sender: address,
        recipient: address,
        content: vector<u8>,
        timestamp: u64,
    }

    public fun send_message(
        sender: address,
        recipient: address,
        content: vector<u8>,
        timestamp: u64,
    ) {
        let message_event = MessageCreated {
            sender,
            recipient,
            content,
            timestamp,
        };
        
        event::emit(message_event);
    }
}