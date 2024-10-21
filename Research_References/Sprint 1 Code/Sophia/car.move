/*
/// Module: car
module car::car;
*/

/*
Some test code written while following along to this youtube video: https://www.youtube.com/watch?v=0wTpVQb09qs
** not all of it was copied, just enough to get a general sense of the language and rest of the video was watched for understanding
*/

module car::car {
    use sui::object::{Self, UID};

    struct Car has key {
        id: UID,
        speed: u8,
        acceleration: u8,
        handling: u8
    }
}

use sui::tx_context::{Self, TxContext};

fun new(speed: u8, acceleration: u8, handling: u8, ctx: &mut TxContext): Car {
    Car {
        id: object::new(ctx),
        speed,
        acceleration,
        handling
    }
}

use sui::transfer;

public entry fun create(_: &AdminCapability, speed: u8, acceleration: u8, handling: u8, ctx: &mut TxContext) {
    let car = new(speed, acceleration, handling, ctx);
    transfer::transfer(car, tx_context::sender(ctx));
}

public entry fun transfer(car: Car, recipient: address) {
    transfer::transfer(car, recipient);
}

public fun get_stats(self: &Car): (u8,u8,u8) {
    (self.speed, self.handling, self.acceleration)
}

public entry fun upgrade_speed(self: &mut Car, amount: u8) {
    self.speed = self.speed + amount;
}

public entry fun upgrade_acceleration(self: &mut Car, amount: u8) {
    self.acceleration = self.acceleration + amount;
}
public entry fun upgrade_handling(self: &mut Car, amount: u8) {
    self.handling = self.handling + amount;
}


