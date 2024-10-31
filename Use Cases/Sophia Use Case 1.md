# Use Case 1 - Sophia - CLI takes in message

**Use Case**: User submits a new text message (and ID of reciever) through WebApp Frontend in order to submit for encryption/ to smart contract

**Actors**: User, WebApp

**Scope**: 
  * Local Temporary Variables (local to the function)
    * newMessage --> used to store incoming message from WebApp
    * sentTo --> used to store id of person recieving message
    * currID --> used to store current user ID

**Precondition**: User has an associated ID and current state of newMessage variable = NULL, current state of sendTo = NULL

**Basic Path**:

  1. System stores current user ID in currID
  2. System waits for input from text form in WebApp frontend
  3. User types in message in frontend and id of recipient and clicks "Submit" button
     *  If message is NULL, repeat steps 2-3 until message is not NULL 
     * If ID is -1, exit out of function (this is the only way that the user can exit after entering this function call other than sending a message)
  4. System stores ID in sendTo variable
  5. Assert that both newMessage and sendTo have non NULL values
  6. Encryption function is called passing in newMessage, sendTo and currID
  7. Function reaches end and has no return value

**Alternative Path**:
  1. There are no alternative paths for this use case, user must follow through the steps in order to exit out

**Postcondition**: newMessage and sendTo should both be non NULL

