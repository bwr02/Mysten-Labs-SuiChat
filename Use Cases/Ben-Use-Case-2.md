# Use Case 2 - Ben - Client should be able to see a list of all of users they have sent or recived messages to in the past

In this use case we are sending a message on SuiChat and trying to define the interaction

* When we send a message we identify the other user and find their public key
* Encrypt the message with their Public key
* Send the message on the blockchain to that user
* That user needs to identify and download the message for them and decrypt it with their private key and notify the reciver

## Acceptance Criteria
1. In the CLI a user can send a command that shows a list of all the people they have messaged in the past
2. The client software will display to the user a list of all people that have been messaged in the past
3. The list should be ordered in what conversation was sent or recived in most recently