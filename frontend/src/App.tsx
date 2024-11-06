import { ConnectButton } from "@mysten/dapp-kit";
import { Box, Container, Flex, Heading } from "@radix-ui/themes";
import { ChatSidebar } from "./ChatSidebar";
import { ChatPanel } from "./ChatPanel";
import './App.css';

function App() {
  return (
    <div className="app-container">
      {/* flex with Sidebar and Chat Panel */}
        <Flex
          style={{
            background: "#F3E8FF",
            height: "100vh",
            display: "flex",
            flexDirection: "row",
          }}
        >
          <ChatSidebar className="chat-sidebar" />
          <ChatPanel className="chat-panel" />
        </Flex>
      <Box
        style={{
          position: "absolute",
          top: "16px",
          right: "16px",
        }}
      >
          <ConnectButton />
        </Box>
    </div>
  );
}

export default App;
