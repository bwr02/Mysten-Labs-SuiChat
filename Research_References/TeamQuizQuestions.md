### Weekly Team Quiz Questions

**Chloe's Q&A**
1. If Alice wants to purchase tokenX, she must communicate with tokenX smart contract. What happens after this line of communication?
* A purchase function within the smart contract creates tokenX then transfers it into Alice's account. Now, Alice owns that asset (type T). 
2. How does the previous process differ from EVM based chains?
* In EVM based chains, Alice wouldn't actually own that asset. In EVMs, tokenX smart contract is simply a key value pair (key: addresses, value: how many tokens are owned). 
  * This approach is not scalable because then every single transaction has to communicate with that original tokenX smart contract
3. What is the difference between a Move Package and a Move smart contract?
* Move package - a way to structure and organize code
* Move smart contract - executable logic that runs on the blockchain
* A single package can contain one or more smart contracts
4. When defining an object in Move, there are 2 mandatory constraints, what are they?
* Every object has to have ``` has key``` key word
* First field must be id
5. When publishing my Move package, with a gas budget of 5M, I received an ```InsufficientGas``` Error. I resolved this error by increasing the gas budget to 10M. Why does this make sense?
* ```--gas-budget```: specifies the maximum amount of gas you're willing to spend on a transaction
* If your transaction requires more gas than this budget, the transaction will fail with an InsufficientGas error. Actions like publishing a package can involve compiling and storing code, verifying dependencies, and executing various blockchain operations. These activities can be computationally expensive and require more gas. By increasing the gas budget, you allow the blockchain to execute more complex or resource-heavy transactions.

**Ben’s Q&A**
1. What is a blockchain event? Is it stored on the blockchain?
* A blockchain event works like an announcement where the message is announced with a code that tells other viewers if the event is meant for them. People who need to hear the message look at it. It is not stored on the blockchain.
2. How does gas differ from Sui coins?
3. What causes a gas fee to be higher? What happens when you lower your gas budget?
4. Who should have your private key? Who should have the public key? What are each used for?

**Sophia's Q&A**
1. How can you ensure that only the owner of an object can perform certain functions in Move?
  * Create an admin class that only when you initialize the object is the admin set (can’t be changed later)
2. What does the ::transfer function in Move do? 
  * Transfers ownership of an object from one account to another
3. What does keyword “entry” do in a function definition?
  * Allows to be called by an external object in a transaction, can interact directly with the function
4. If you pass in a value that will be changed in the function, what do you have to specify the value as?
  * &mut

**Ashton's Q&A**
1. What is Gas, and is it specific to the SUI blockchain?
  * Gas isn’t specific to the SUI blockchain, it is a representation of the balance that pays for the verification of each transaction
2. What is immutability and why is it important in regards to blockchain and what we’re doing specifically
  * Immutability is the idea that once something is on the blockchain, it can’t be changed, to our specific use-case, this means that the public keys can’t be modified, and if we are putting the messages themselves as smart contracts, then those messages can’t be changed
3. What does an owner mutator do to a function
  * It allows you to make certain functions only be used by the person who deployed them, which counteracts the fact that an immutable contract means anybody could access the function.
4. What’s the basic idea of how you can ensure that key exchange is secure
  * Make the public key computationally difficult to decrypt, except the private key holder

**Bonnie's Q&A**
1. What do “has key, store, copy, and drop” refer to?
  * has key means that it’s going to be written to the Sui network
  * store means you’ll be able to store the variable inside another object
  * copy means you can duplicate
  * drop means you can delete that struct
2. When using Sui Move, how to make sure the compiler doesn’t throw an error when we don’t use a variable by the end of the function?
  * Prefix the function with an underscore
3. What’s the purpose of using capabilities?
  * Capabilities can be used to gate admin access for functions
  * Ex. Whoever has AdminCapability has admin privileges
4. What are the different types of ownerships that objects can have?
  * Owned by an address
  * Owned by another object
  * Shared
  * Immutable

