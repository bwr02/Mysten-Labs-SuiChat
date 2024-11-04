import "./ChatSidebar.css";

export function ChatSidebar() {
  const conversations = [
    { name: "Ben", message: "Just finished our prd doc!", time: "10 min" },
    { name: "Ashton", message: "LGTM", time: "14 min" },
    { name: "Sophia", message: "Can’t wait for our standup!", time: "21 min" },
    { name: "Chloe", message: "Has anyone seen PR?", time: "23 min" },
    { name: "Bonnie", message: "Where are we meeting...", time: "24 min" },
    { name: "Jane", message: "Have you done 171 HW?", time: "36 min" },
    { name: "John", message: "What time is midterm?", time: "45 min" },
  ];

  return (
    <div className="chat-sidebar">
      <h1 className="chat-title">SuiChat</h1>
      <h2 className="conversations-heading">Conversations</h2>
      <div className="conversations-list">
        {conversations.map((conv, index) => (
          <div key={index} className="conversation">
            <div className="conversation-avatar" />
            <div className="conversation-details">
              <span className="conversation-name">{conv.name}</span>
              <span className="conversation-message">{conv.message}</span>
            </div>
            <span className="conversation-time">{conv.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
