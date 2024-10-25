# Use Case 1 - Ben - User can see their most recent messages with another user in CLI

**Use Case**: User enters another User ID and their most recent messages with that user are displayed

**Actors**: User, CLI, User Database

**Scope**: 
  * Database Values
    * usersMessaged
    * Messages with selected person

**Precondition**: User must have messaged the user ID given

**Basic Path**:

  1. User enters the ID of the person they are trying to access messages with
  2. System accesses database and pulls in all the messages with the user ID given
  3. System displayed the messages in the CLI

**Alternative Path**:
  1. No messages have occured with the other user, shows an error message.

**Postcondition**: Most recent messages with selected user displayed

