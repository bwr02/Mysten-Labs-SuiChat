import { ConnectButton } from "@mysten/dapp-kit";
import { Box, Container, Flex, Heading } from "@radix-ui/themes";
import { ChatSidebar } from "./components/ChatSidebar";
import { ChatPanel } from "./components/ChatPanel";
import './styles/App.css';

function App() {
  return (
      <div className="flex flex-col h-screen bg-purple-100">
          {/* flex with Sidebar and Chat Panel */}
          <Flex className="h-full flex-row" style={{ background: "#F3E8FF" }}>
              <ChatSidebar className="w-1/4 p-4 border-r bg-purple-100" />
              <ChatPanel className="w-3/4 flex-1 bg-white" />
          </Flex>
          <Box
              style={{
                  position: "absolute",
                  top: "16px",
                  right: "16px",
              }}
          >
              <ConnectButton/>
          </Box>
      </div>
  );
}

export default App;
