module my_first_package::cleartext {
    
    public struct Message has key, store {
        id: UID,
        message: std::string::String,
    }

    public struct Input has key {
        id: UID,
        messagesInput: u64,
    }
    
    fun init(ctx: &mut TxContext) {
        let admin = Input{
            id: object::new(ctx),
            messagesInput: 0,
        };
        transfer::transfer(admin, ctx.sender())
    }

    public fun message(self: &Message): std::string::String {
        self.message
    }

    public fun messagesInput(self: &Input): u64 {
        self.messagesInput
    }

    public fun createMessage(val: vector<u8>, ctx: &mut TxContext): Message {
        Message{
            id: object::new(ctx),
            message: std::string::utf8(val),
        }
    }

    public fun newMessage(
        input: &mut Input,
        message: vector<u8>,
        ctx: &mut TxContext,
    ): Message {
        input.messagesInput = input.messagesInput + 1;
        Message {
            id: object::new(ctx),
            message: std::string::utf8(message),
        }
    }

    #[test]
    fun testMessageCreated() {
        let mut ctx = tx_context::dummy();

        let message = Message {
            id: object::new(&mut ctx),
            message: std::string::utf8(b"hello world"),
        };

        assert!(message.message() == std::string::utf8(b"hello world"), 1);
        let dummy_address = @0xCAFE;
        transfer::public_transfer(message, dummy_address);
    }

    #[test]
    fun testMessageTransaction(){
        use sui::test_scenario;

        let initalOwner = @0xCAFE;
        let finalOwner = @0xFACE;

        let mut scenario = test_scenario::begin(initalOwner);
        {
            let message = createMessage(b"hello world", scenario.ctx());
            transfer::public_transfer(message, initalOwner);
        };

        scenario.next_tx(initalOwner);
        {
            let message = scenario.take_from_sender<Message>();
            transfer::public_transfer(message, finalOwner);
        };

        scenario.next_tx(finalOwner);
        {
            let message = scenario.take_from_sender<Message>();
            assert!(message.message() == std::string::utf8(b"hello world"), 1);
            scenario.return_to_sender(message)
        };
        scenario.end();
    }

    #[test]
    fun testModuleInit(){
        use sui::test_scenario;

        let admin = @0xAD;
        let initalOwner = @0xCAFE;

        let mut scenario = test_scenario::begin(admin);
        {
            init(scenario.ctx());
        };

        scenario.next_tx(admin);
        {
            let input = scenario.take_from_sender<Input>();
            assert!(input.messagesInput() == 0, 1);
            scenario.return_to_sender(input);
        };

        scenario.next_tx(admin);
        {
            let mut input = scenario.take_from_sender<Input>();
            let message = input.newMessage(b"hello world", scenario.ctx());
            transfer::public_transfer(message, initalOwner);
            scenario.return_to_sender(input);
        };
        scenario.end();
    }
}


