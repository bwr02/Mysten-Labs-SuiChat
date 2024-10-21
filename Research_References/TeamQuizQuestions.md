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

