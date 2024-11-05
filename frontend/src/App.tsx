import { ConnectButton } from "@mysten/dapp-kit";
import { Box, Container, Flex, Heading } from "@radix-ui/themes";
// import { WalletStatus } from "./WalletStatus";
// import MessageInput from "./Input";
import { ChatSidebar } from "./ChatSidebar";
import { ChatPanel } from "./ChatPanel";
import './App.css';

function App() {
  return (
    <div className="app-container">
      {/* Header with SuiChat title and ConnectButton */}
      {/* <Flex
        position="sticky"
        px="4"
        py="2"
        justify="between"
        style={{
          borderBottom: "1px solid var(--gray-a2)",
          background: "#E6E6FA",
        }}
      >
        <Box>
          <Heading style={{ color: "black" }}>SuiChat</Heading>
        </Box>

        
      </Flex> */}

      {/* Main container with Sidebar and Chat Panel */}
      <Container>
        <Container
          mt="5"
          pt="2"
          px="4"
          style={{ background: "#F3E8FF", minHeight: 500, display: 'flex' }}
        >
          <ChatSidebar />
          <ChatPanel />
        </Container>
      </Container>
      <Box>
          <ConnectButton />
      </Box>
      {/* Message input at the bottom */}
      {/* <div className="message-input-container">
        <MessageInput />
      </div> */}
    </div>
  );
}

export default App;
