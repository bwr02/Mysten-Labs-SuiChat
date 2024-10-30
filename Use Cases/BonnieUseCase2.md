# Bonnie Use Case 2 - Listener function waits to receive event from Blockchain

**Use Case**: Listen for blockchain events

**Actors**: Web Application, User Database, Sui Blockchain

**Precondition**: 
A transaction has been completed on the blockchain.

**Basic Path**:
1. Listener function monitors the blockchain for transaction completion events.
2. Upon receiving an event, the listener processes and posts the event data to the web application.

**Alternative Path**:
If no event is emitted or received, no action is taken.

**Postcondition**: 
The listener function captures the event and prepares it for further processing in the application.