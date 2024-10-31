# Use Case 2 - Ben - Client can see list of Conversations

**Use Case**: WebApp can display a list of the most recent conversations

**Actors**: User, WebApp, User Database

**Scope**: 
  * Database Values
    * usersMessaged
      * timeOfLastMessage

**PreCondditions**: User has either sent or recived at least one message with at least one other person.

**Basic Path**:

  1. User requests to see a list of their most recent conversations
  2. System accesses database and pulls in the all of the users that have sent or recived a message to/from the user along with time of the most recent message
  3. System displays this list in WebApp

**Alternative Path**
  * If the user hasn't messaged anyone yet display "No Conversations

**PostCondition**: WebApp is displaying a list of the most recent conversations sorted from most to least recent
