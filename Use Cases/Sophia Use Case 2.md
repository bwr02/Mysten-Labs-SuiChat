# Use Case 2 - Sophia - CLI prints out recieved message

**Use Case**: View new message in CLI

**Actors**: User, CLI, User Database, Recieved Message,  receivedMessage variable

**Precondition**: User has an associated ID and currently has no pending messages to relay

**Basic Path**:

  1. System recieves new recievedMessage
  2. System records current user ID
  3. System records sender user ID
  4. System formats recievedMessage along with user ID
  5. System outputs formatted message to CLI
  6. User is able to view the message in the CLI

**Alternative Path**:
  1. If recievedMessage is NULL, exit and wait until system recieves non NULL message

**Postcondition**: System no longer has a "pending message" and user is able to see a message in the command line