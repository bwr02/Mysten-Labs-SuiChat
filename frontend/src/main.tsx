import React from "react";
import ReactDOM from "react-dom/client";
import "@radix-ui/themes/styles.css";

import { WalletProvider } from "@suiet/wallet-kit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Theme } from "@radix-ui/themes";
import App from "./App.tsx";


const queryClient = new QueryClient();
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Theme appearance="dark">
      <QueryClientProvider client={queryClient}>
          <WalletProvider autoConnect>
            <App />
          </WalletProvider>
      </QueryClientProvider>
    </Theme>
  </React.StrictMode>,
);
