# Use Case 2 - Sophia - WebApp displays out recieved message

**Use Case**: User recieves a new message and displays message in frontend Web App

**Actors**: User, WebApp

**Precondition**: User has an associated ID (x) and another user has sent a message to User (x).

**Scope**:

Local Temporary Variables (loval ro the function)
  * recievedMessage --> passed into function, this is the message to be displayed in WebApp
  * fromUser --> passed into function, user ID of message sender
  * currId --> id of current user

**Basic Path**:

  1. System records current user ID in currId
  2. Format recivedMessage and display in WebApp frontend chat pannel

**Alternative Path**:
  1. If recievedMessage is NULL, exit and wait until system recieves non NULL message

**Postcondition**: System no longer has a "pending message" and user is able to see a message in the WebApp
