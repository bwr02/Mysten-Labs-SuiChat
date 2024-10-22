# Use Case 1 - Sophia - CLI takes in message

**Use Case**: Submit Message through CLI

**Actors**: User, CLI, User Database, New Message, NewMessage Variable

**Precondition**: User has an associated ID and has previously sent no messages (i.e. when querying "sent messages", it comes up as none), current state of newMessage variable = NULL, current state of sendTo = NULL

**Basic Path**:

  1. System records current user ID
  2. System prompts user for new message through CLI
  3. User types in message in CLI
  4. System records user input and stores in newMessage variable
  5. System prompts user for id of who to send the message to through CLI
  3. User types in id in CLI
  4. System records user input and stores in sendTo variable
  5. Assert that both newMessage and sendTo have non NULL values

**Alternative Path**:
  1. If no message or no id is entered (i.e. user input is NULL), reprompt user

**Postcondition**: User now has at least one "sent messages", newMessage and sendTo should both be non NULL

