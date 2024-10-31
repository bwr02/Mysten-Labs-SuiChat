# Use Case 1 - Ben - User can see their most recent messages with another user in WebApp

**Use Case**: User enters another User ID and their most recent messages with that user are displayed

**Actors**: User, WebApp, User Database

**Scope**: 
  * Database Values
    * usersMessaged
    * Messages with selected person

**Precondition**: User must have sent or received a message with the user ID given

**Basic Path**:

  1. The frontend takes input of the userID for the person that messages are being accessed.
  2. System quiries database for all messages associated with the requested userID
  3. System prints the messages in the WebApp

**Alternative Path**:
  1. No messages have occured with the other user, shows an error message.

**Postcondition**: Most recent messages with selected user displayed in WebApp

