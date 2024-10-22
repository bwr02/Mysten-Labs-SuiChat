# Use Case 1 - Ben - Respond to the most Recent Message - As a user post a message to the blockchain with a specific reciver id

In this use case we are sending a message on SuiChat and trying to define the interaction

* When we send a message we identify the other user and find their public key
* Encrypt the message with their Public key
* Send the message on the blockchain to that user
* That user needs to identify and download the message for them and decrypt it with their private key and notify the reciver

## Acceptance Criteria