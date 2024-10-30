# Bonnie Use Case 1 - Blockchain Emits Event

**Use Case**: Emit events from Blockchain

**Actors**: Sui Blockchain, User, CLI

**Precondition**: 
Some transaction is complete from the smart contract.

**Basic Path**:
1. Smart contract allows transaction
2. Message is sent to other user
3. Transaction complete notifies the user

**Alternative Path**:
Nothing happens, so no events emitted.

**Postcondition**: 
User receives an event from the blockchain, saying that transaction is complete