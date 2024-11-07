import "../styles/ChatPanel.css";
import MessageInput from "./MessageInput";
// component to display the current open chat and its messages
export function ChatPanel() {
  return (
    <div className="chat-panel">
      <div className="chat-header">
        <span className="chat-recipient">Sophia</span>
      </div>
      <div className="chat-messages">
        <div className="message sent">Just submit the doc, see you in class</div>
        <div className="message received">Can’t wait for our standup!</div>
        <div className="message-input-container">
            <MessageInput />
        </div>
      </div>
    </div>
  );
}
