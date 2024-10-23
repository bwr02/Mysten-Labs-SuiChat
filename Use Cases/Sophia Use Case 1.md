# Use Case 1 - Sophia - CLI takes in message

**Use Case**: User submits a new text message (and ID of reciever) through CLI in order to submit for encryption/ to smart contract

**Actors**: User, CLI

**Scope**: 
  * Local Temporary Variables (local to the function)
    * newMessage --> used to store incoming message from CLI
    * sentTo --> used to store id of person recieving message
    * currID --> used to store current user ID

**Precondition**: User has an associated ID and has previously sent no messages (i.e. when querying "sent messages", it comes up as none), current state of newMessage variable = NULL, current state of sendTo = NULL

**Basic Path**:

  1. System stores current user ID in currID
  2. System prompts user for new message through CLI
  3. User types in message in CLI
     *  If message is NULL, repeat steps 2-3 until message is not NULL 
  4. System stores message in newMessage variable
  5. System prompts user for ID of who to send the message to through CLI
  6. User types in ID in CLI
     * If ID is NULL, repeat steps 5-6 until ID is not NULL
     * If ID is -1, exit out of function (this is the only way that the user can exit after entering this function call other than sending a message)
  7. System stores ID in sendTo variable
  8. Assert that both newMessage and sendTo have non NULL values
  9. Encryption function is called passing in newMessage, sendTo and currID
  10. Function reaches end and has no return value

**Alternative Path**:
  1. There are no alternative paths for this use case, user must follow through the steps in order to exit out (

**Postcondition**: User now has at least one "sent messages", newMessage and sendTo should both be non NULL

