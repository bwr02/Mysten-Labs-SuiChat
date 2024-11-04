module car::car_admin {
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;

    struct AdminCapability has key {
        id: UID
    }

    fun init(ctx: &mut TxContext) {
        transfer::transfer(AdminCapability) {
            id: object::new(ctx)
        }, tx_context::sender(ctx)
    }

    public entry fun create(_: &AdminCapability, speed: u8, acceleration: u8, handling: u8, ctx: &mut TxContext) {
        let car = new(spped, acceleration, handling, ctx);
        transfer::transfer(car, tx_context::sender(ctx));
    }
}