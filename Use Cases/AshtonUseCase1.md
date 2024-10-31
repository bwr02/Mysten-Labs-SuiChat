# Ashton Use Case 1 - User sends a message and the client encrypts the message

**Use Case:** Client can encrypt a message queued to send

**Actors:** User, Client, Sui Blockchain

**Preconditions:** User submits a message to be sent to existing smart contract

**Basic Path:** 
  1. Client takes the address of the receiving user
  2. Using the address, client polls the blockchain for the public key
  3. Client encrypts the message with the public key

**Alternative Paths:** 
  * Address doesn't exist
    * return to the client, recipient doesn't exist
  * Public key doesn't exist
    * return to the client, public key not found

**Postconditions:** Client stores encrypted message ready to send.
