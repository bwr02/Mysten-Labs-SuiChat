# Use Case 1 - Chloe - User Replies to Latest Message

**Use Case:** A user can leave the receiver address field blank (empty string) when calling the send message module to reply to the latest received message. 

**Acceptance Criteria**
1. In the CLI, a user can leave the receiver address field blank (empty string).
2. An empty string in the receiver address field will default to the user address of the latest received message.
3. If the user has no past messages, an error will be displayed upon the module call, indicating that a receiver address is required.
