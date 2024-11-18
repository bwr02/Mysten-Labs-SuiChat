import "../styles/ChatPanel.css";
import MessageInputField from "./MessageInputField";
// component to display the current open chat and its messages
interface ChatPanelProps {
  className?: string;
}
export const ChatPanel: React.FC<ChatPanelProps> = ({ className }) => {
  const messages = [
    { sender: "sent", text: "Just submit the doc, see you in class"},
    { sender: "received", text: "Can’t wait for our standup!"},
  ];
  return (
    <div className="chat-panel">
      <div className="chat-header">
        <span className="chat-recipient">Sophia</span>
      </div>
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.sender}`}>
            <span className="message-text">{message.text}</span>
          </div>
        ))}
      </div>
      <div className="message-input-container">
        <MessageInputField />
      </div>
    </div>
  );
}
