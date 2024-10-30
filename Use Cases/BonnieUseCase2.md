# Bonnie Use Case 2 - Listener function waits to receive event from Blockchain

**Use Case**: Listen for events from Blockchain

**Actors**: User, CLI, User Database, Completed Transaction, Sui Blockchain

**Precondition**: 
Transaction on blockchain is complete

**Basic Path**:
1. Listen for event from blockchain
2. Post event when received

**Alternative Path**:
Event is not received.
No event being emitted.

**Postcondition**: 
Function takes in the event, before it releases it