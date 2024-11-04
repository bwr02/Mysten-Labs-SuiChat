# Bonnie Use Case 1 - Blockchain Emits Event

**Use Case**: Emit transaction completition events from the blockchain

**Actors**: Sui Blockchain, User, Web Application

**Precondition**: 
A transaction is successfully executed via a smart contract.

**Basic Path**:
1. The smart contract verifies and processes the transaction.
2. Upon transaction completion, the blockchain emits an event.
3. The web application receives and displays the event notification to the user.

**Alternative Path**:
If the transaction fails or is canceled, no event is emitted.

**Postcondition**: 
The user is notified via the web application that the transaction is complete.