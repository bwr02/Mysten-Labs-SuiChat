import { ConnectButton } from "@mysten/dapp-kit";
import { Box, Container, Flex, Heading } from "@radix-ui/themes";
import { ChatSidebar } from "./ChatSidebar";
import { ChatPanel } from "./ChatPanel";
import './App.css';

function App() {
  return (
    <div className="app-container">
      {/* Main container with Sidebar and Chat Panel */}
      <Container>
        <Flex
          mt="5"
          pt="2"
          px="4"
          style={{
            background: "#F3E8FF",
            minHeight: 500,
            display: "flex",
          }}
        >
          <ChatSidebar className="chat-sidebar" />
          <ChatPanel className="chat-panel" />
        </Flex>
        
      </Container>
      <Box>
          <ConnectButton />
        </Box>
    </div>
  );
}

export default App;
