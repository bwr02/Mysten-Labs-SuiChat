### Introduction to Sui Network and Move by Sui
Documented notes from [YouTube video](https://www.youtube.com/live/cJwN3IhpLnQ?si=7pZ9UoQb9VUq3baL).


* If Alice wants to purchase tokenX, she must communicate with tokenX smart contract and call a Purchase function. That function creates tokenX then transfers it into Alice's account. Now, Alice owns that asset (type T). 

  * *In EVM based chains, Alice wouldn't actually own that asset. In EVMs, tokenX smart contract is simply a key value pair (key: addresses, value: how many tokens are owned). This approach is not scalable because then every single transaction has to communicate with that original tokenX smart contract.*
* Now Alice wants to transfer that token. Because Alice actually owns that token, she doesn't have to communicate with that smart contract anymore and can directly transfer the asset to Bob. Bob owns tokenX now.



**MOVE**

* Assets & ownerships are encoded in linear types
  * e.g. Pass in Coin type, get CarTitle ("If you give me a coin, I will give you a car title")


* Objects can be:
  * Owned by an address
  * Owned by another object
  * Shared
  * Immutable (people can only take a read-only reference to them)

```
struct ThisIsAnObject has key {    // every object has to have has key keyword
	id: UID			 // first field must be id 
}
```


