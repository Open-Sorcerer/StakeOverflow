import React from "react";
import { createRoot } from "react-dom/client";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import "./index.css";
import App from "./App";
import { DappProvider } from "providers/DappProvider";
import { ForumProvider } from "data";
import { BlockieAvatar, wagmiConfig, walletTheme } from "wallet";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <WagmiProvider config={wagmiConfig}>
    <QueryClientProvider client={queryClient}>
      <RainbowKitProvider theme={walletTheme} avatar={BlockieAvatar} modalSize="compact">
        <DappProvider>
          <ForumProvider>
            <App />
          </ForumProvider>
        </DappProvider>
      </RainbowKitProvider>
    </QueryClientProvider>
  </WagmiProvider>
);
