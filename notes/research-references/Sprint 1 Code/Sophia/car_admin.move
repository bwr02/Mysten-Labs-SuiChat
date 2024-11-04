module car::car_admin {
    use sui::object::{Self,UID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;

    struct AdminCapability has key{
        id: UID
    }

    fun init(ctx: &mut TxContext) {
        transfer::transfer(AdminCapability{
            id: object::new(ctx),
        }, tx_context::sender(ctx ))
    }
}